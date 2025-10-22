// setup_db.js - Script to create and populate the attendance database
const { Pool } = require('pg');

// Use the same connection settings as server.js
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Connect to default database first
  password: 'postgres',
  port: 5432,
});

async function setupDatabase() {
  let client;
  
  try {
    console.log('Connecting to PostgreSQL...');
    client = await pool.connect();
    
    // Drop and create database
    console.log('Dropping existing database if exists...');
    await client.query('DROP DATABASE IF EXISTS attendance_db;');
    
    console.log('Creating new database...');
    await client.query('CREATE DATABASE attendance_db;');
    
    console.log('Database created successfully!');
    client.release();
    
    // Now connect to the new database
    const appPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'attendance_db',
      password: 'postgres',
      port: 5432,
    });
    
    const appClient = await appPool.connect();
    
    // Create tables
    console.log('\nCreating tables...');
    
    await appClient.query(`
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        roll VARCHAR(50) UNIQUE NOT NULL
      );
    `);
    console.log('✓ Students table created');
    
    await appClient.query(`
      CREATE TABLE attendance (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course VARCHAR(20) NOT NULL,
        session_date DATE NOT NULL,
        status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
        UNIQUE(student_id, course, session_date)
      );
    `);
    console.log('✓ Attendance table created');
    
    // Insert dummy students
    console.log('\nInserting 30 students...');
    const students = [
      ['Alice Johnson', '101'],
      ['Bob Smith', '102'],
      ['Charlie Brown', '103'],
      ['Diana Prince', '104'],
      ['Ethan Hunt', '105'],
      ['Fiona Apple', '106'],
      ['George Wilson', '107'],
      ['Hannah Montana', '108'],
      ['Isaac Newton', '109'],
      ['Julia Roberts', '110'],
      ['Kevin Hart', '111'],
      ['Laura Palmer', '112'],
      ['Michael Scott', '113'],
      ['Nina Simone', '114'],
      ['Oscar Wilde', '115'],
      ['Patricia Hill', '116'],
      ['Quincy Jones', '117'],
      ['Rachel Green', '118'],
      ['Steve Rogers', '119'],
      ['Tina Fey', '120'],
      ['Uma Thurman', '121'],
      ['Victor Hugo', '122'],
      ['Wendy Williams', '123'],
      ['Xavier Knight', '124'],
      ['Yara Shah', '125'],
      ['Zack Morris', '126'],
      ['Amy Adams', '127'],
      ['Bruce Wayne', '128'],
      ['Cara Delevingne', '129'],
      ['David Bowie', '130']
    ];
    
    for (const [name, roll] of students) {
      await appClient.query('INSERT INTO students (name, roll) VALUES ($1, $2)', [name, roll]);
    }
    console.log(`✓ Inserted ${students.length} students`);
    
    // Get all student IDs
    const studentResult = await appClient.query('SELECT id FROM students ORDER BY id');
    const studentIds = studentResult.rows.map(r => r.id);
    
    // Create attendance records for the past 2 weeks
    console.log('\nCreating attendance records...');
    
    const courses = ['CSL333', 'CST301', 'CST303', 'CST307', 'CSL331'];
    const today = new Date();
    let totalRecords = 0;
    
    for (const course of courses) {
      let sessionCount = 0;
      
      // Generate sessions for past 14 days
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        
        let shouldHaveSession = false;
        
        // Different schedule for different courses
        if (course === 'CSL333' && (dayOfWeek === 1 || dayOfWeek === 4)) shouldHaveSession = true; // Mon, Thu
        if (course === 'CST301' && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) shouldHaveSession = true; // Mon, Wed, Fri
        if (course === 'CST303' && (dayOfWeek === 2 || dayOfWeek === 4)) shouldHaveSession = true; // Tue, Thu
        if (course === 'CST307' && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) shouldHaveSession = true; // Mon, Wed, Fri
        if (course === 'CSL331' && (dayOfWeek === 2 || dayOfWeek === 5)) shouldHaveSession = true; // Tue, Fri
        
        if (shouldHaveSession && sessionCount < 10) {
          sessionCount++;
          const dateStr = date.toISOString().split('T')[0];
          
          // Mark attendance for all students (80-90% present randomly)
          for (const studentId of studentIds) {
            const isPresent = Math.random() > 0.15; // 85% attendance rate
            const status = isPresent ? 'Present' : 'Absent';
            
            await appClient.query(
              'INSERT INTO attendance (student_id, course, session_date, status) VALUES ($1, $2, $3, $4)',
              [studentId, course, dateStr, status]
            );
            totalRecords++;
          }
        }
      }
      
      console.log(`✓ ${course}: ${sessionCount} sessions`);
    }
    
    console.log(`✓ Total attendance records: ${totalRecords}`);
    
    // Show summary
    console.log('\n=== Database Setup Complete ===');
    const studentCount = await appClient.query('SELECT COUNT(*) FROM students');
    const attendanceCount = await appClient.query('SELECT COUNT(*) FROM attendance');
    
    console.log(`Total Students: ${studentCount.rows[0].count}`);
    console.log(`Total Attendance Records: ${attendanceCount.rows[0].count}`);
    
    // Show sample data
    console.log('\n=== Sample Students ===');
    const sampleStudents = await appClient.query('SELECT * FROM students LIMIT 5');
    console.table(sampleStudents.rows);
    
    console.log('\n=== Recent Attendance Records ===');
    const sampleAttendance = await appClient.query(`
      SELECT a.id, s.name, s.roll, a.course, a.session_date, a.status
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      ORDER BY a.session_date DESC
      LIMIT 10
    `);
    console.table(sampleAttendance.rows);
    
    appClient.release();
    await appPool.end();
    await pool.end();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('You can now run: node server.js');
    
  } catch (err) {
    console.error('❌ Error setting up database:', err.message);
    console.error(err);
    process.exit(1);
  }
}

setupDatabase();
