// server.js (improved with subjects + per-course reports + Bootstrap-ready)
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === PostgreSQL connection (update password if yours is different) ===
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'attendance_db',
  password: 'postgres',  // change if your real password is different
  port: 5432,
});

// === Hardcoded course list (easy to edit) ===
const courses = [
  { code: 'CSL333', name: 'DBMS LAB' },
  { code: 'CST301', name: 'FLAT' },
  { code: 'CST303', name: 'COMPUTER NETWORKS' },
  { code: 'CST307', name: 'MPMC' },
  { code: 'CSL331', name: 'SSM LAB' }
];


// API: get courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// API: get students
app.get('/api/students', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, roll FROM students ORDER BY id;');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// API: save attendance
app.post('/api/attendance', async (req, res) => {
  const { course, session_date, records } = req.body;
  if (!course || !session_date || !Array.isArray(records)) return res.status(400).json({ error: 'missing fields' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const q = `
      INSERT INTO attendance (student_id, course, session_date, status)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (student_id, course, session_date) DO UPDATE SET status = EXCLUDED.status;
    `;
    for (const r of records) {
      await client.query(q, [r.student_id, course, session_date, r.status]);
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'db error' });
  } finally {
    client.release();
  }
});

// API: overall report
app.get('/api/report', async (req, res) => {
  try {
    const sql = `
      SELECT s.id, s.name, s.roll,
             COUNT(a.id) FILTER (WHERE a.status='Present') AS present,
             COUNT(a.id) AS total,
             ROUND(COUNT(a.id) FILTER (WHERE a.status='Present')::numeric / NULLIF(COUNT(a.id),0) * 100, 2) AS percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      GROUP BY s.id, s.name, s.roll
      ORDER BY s.id;
    `;
    const r = await pool.query(sql);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// API: per-course report
app.get('/api/report/course/:course', async (req, res) => {
  const course = req.params.course;
  try {
    const sql = `
      SELECT s.id, s.name, s.roll,
             COALESCE(SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END),0) AS present,
             COALESCE(COUNT(a.id),0) AS total,
             CASE WHEN COALESCE(COUNT(a.id),0) > 0
               THEN ROUND(100.0 * SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END) / COUNT(a.id), 2)
               ELSE 0 END AS percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.course = $1
      GROUP BY s.id, s.name, s.roll
      ORDER BY s.id;
    `;
    const r = await pool.query(sql, [course]);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});
// API: student-wise report (all subjects)
app.get('/api/report/student/:roll', async (req, res) => {
  const roll = req.params.roll;
  try {
    const sql = `
      SELECT c.code, c.name,
             COALESCE(SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END),0) AS present,
             COALESCE(COUNT(a.id),0) AS total,
             CASE WHEN COALESCE(COUNT(a.id),0) > 0
               THEN ROUND(100.0 * SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END) / COUNT(a.id), 2)
               ELSE 0 END AS percentage
      FROM (VALUES 
        ('CSL333','DBMS LAB'),
        ('CST301','FLAT'),
        ('CST303','COMPUTER NETWORKS'),
        ('CST307','MPMC'),
        ('CSL331','SSM LAB')
      ) AS c(code,name)
      LEFT JOIN attendance a ON a.course = c.code
      LEFT JOIN students s ON s.id = a.student_id
      WHERE s.roll = $1 OR s.name = $1
      GROUP BY c.code,c.name
      ORDER BY c.code;
    `;
    const r = await pool.query(sql, [roll]);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});
// API: full matrix report (all students × all subjects)
app.get('/api/report/all', async (req, res) => {
  try {
    // list of subjects
    const subjects = [
      { code: 'CSL333', name: 'DBMS LAB' },
      { code: 'CST301', name: 'FLAT' },
      { code: 'CST303', name: 'COMPUTER NETWORKS' },
      { code: 'CST307', name: 'MPMC' },
      { code: 'CSL331', name: 'SSM LAB' }
    ];

    // fetch students
    const students = (await pool.query('SELECT id, name, roll FROM students ORDER BY id')).rows;

    // for each student, calculate per-subject attendance
    for (const s of students) {
      s.subjects = {};
      for (const subj of subjects) {
        const q = `
          SELECT 
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) AS present,
            COUNT(*) AS total
          FROM attendance
          WHERE student_id = $1 AND course = $2;
        `;
        const r = await pool.query(q, [s.id, subj.code]);
        const present = r.rows[0].present || 0;
        const total = r.rows[0].total || 0;
        const perc = total > 0 ? Math.round((present / total) * 100) : 0;
        s.subjects[subj.code] = { present, total, perc };
      }
    }

    res.json({ subjects, students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
