// server.js (improved with subjects + per-course reports + Bootstrap-ready)
const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());

// Session configuration
app.use(session({
  secret: 'attendance-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Hardcoded users (in production, use database with hashed passwords)
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'teacher', password: 'teacher123', role: 'teacher' }
];

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Role-based middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }
    next();
  };
}

// Serve login page without authentication
app.get('/login.html', express.static(path.join(__dirname, 'public')));

// Protect all other static files
app.use((req, res, next) => {
  // Allow access to login page and API login endpoint
  if (req.path === '/login.html' || req.path === '/api/login' || req.path === '/api/logout') {
    next();
  } else if (req.path.endsWith('.html') || req.path === '/') {
    // Redirect to login if not authenticated
    if (!req.session || !req.session.user) {
      res.redirect('/login.html');
    } else {
      next();
    }
  } else {
    next();
  }
});

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


// === Authentication APIs ===
// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.user = { username: user.username, role: user.role };
    res.json({ success: true, user: { username: user.username, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Could not log out' });
    } else {
      res.json({ success: true });
    }
  });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// === Protected APIs (require authentication) ===
// API: get courses
app.get('/api/courses', requireAuth, (req, res) => {
  res.json(courses);
});

// API: get students (teachers only)
app.get('/api/students', requireRole('teacher'), async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, roll FROM students ORDER BY id;');
    res.json(r.rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'db error' });
  }
});

// API: save attendance (teachers only)
app.post('/api/attendance', requireRole('teacher'), async (req, res) => {
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

// API: overall report (admins only)
app.get('/api/report', requireRole('admin'), async (req, res) => {
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
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'db error' });
  }
});

// API: per-course report (admins only)
app.get('/api/report/course/:course', requireRole('admin'), async (req, res) => {
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
// API: student-wise report (all subjects) - accessible by all authenticated users
app.get('/api/report/student/:roll', requireAuth, async (req, res) => {
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
// API: full matrix report (all students × all subjects) - admins only
app.get('/api/report/all', requireRole('admin'), async (req, res) => {
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
