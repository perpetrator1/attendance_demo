-- Database setup script for Attendance Management System
-- Run this script to create tables and populate with dummy data

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Create students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  roll VARCHAR(50) UNIQUE NOT NULL
);

-- Create attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  course VARCHAR(20) NOT NULL,
  session_date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
  UNIQUE(student_id, course, session_date)
);

-- Insert dummy students (30 students)
INSERT INTO students (name, roll) VALUES
  ('Alice Johnson', '101'),
  ('Bob Smith', '102'),
  ('Charlie Brown', '103'),
  ('Diana Prince', '104'),
  ('Ethan Hunt', '105'),
  ('Fiona Apple', '106'),
  ('George Wilson', '107'),
  ('Hannah Montana', '108'),
  ('Isaac Newton', '109'),
  ('Julia Roberts', '110'),
  ('Kevin Hart', '111'),
  ('Laura Palmer', '112'),
  ('Michael Scott', '113'),
  ('Nina Simone', '114'),
  ('Oscar Wilde', '115'),
  ('Patricia Hill', '116'),
  ('Quincy Jones', '117'),
  ('Rachel Green', '118'),
  ('Steve Rogers', '119'),
  ('Tina Fey', '120'),
  ('Uma Thurman', '121'),
  ('Victor Hugo', '122'),
  ('Wendy Williams', '123'),
  ('Xavier Knight', '124'),
  ('Yara Shah', '125'),
  ('Zack Morris', '126'),
  ('Amy Adams', '127'),
  ('Bruce Wayne', '128'),
  ('Cara Delevingne', '129'),
  ('David Bowie', '130');

-- Insert dummy attendance records for the past 2 weeks
-- CSL333 - DBMS LAB (8 sessions)
INSERT INTO attendance (student_id, course, session_date, status) 
SELECT 
  s.id,
  'CSL333',
  date,
  CASE WHEN random() > 0.2 THEN 'Present' ELSE 'Absent' END
FROM students s
CROSS JOIN (
  SELECT CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL AS date
  FROM generate_series(0, 7) n
  WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL) IN (1, 4) -- Monday and Thursday
) dates;

-- CST301 - FLAT (10 sessions)
INSERT INTO attendance (student_id, course, session_date, status) 
SELECT 
  s.id,
  'CST301',
  date,
  CASE WHEN random() > 0.15 THEN 'Present' ELSE 'Absent' END
FROM students s
CROSS JOIN (
  SELECT CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL AS date
  FROM generate_series(0, 13) n
  WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL) IN (1, 3, 5) -- Mon, Wed, Fri
) dates
LIMIT 300; -- 30 students × 10 sessions

-- CST303 - COMPUTER NETWORKS (10 sessions)
INSERT INTO attendance (student_id, course, session_date, status) 
SELECT 
  s.id,
  'CST303',
  date,
  CASE WHEN random() > 0.18 THEN 'Present' ELSE 'Absent' END
FROM students s
CROSS JOIN (
  SELECT CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL AS date
  FROM generate_series(0, 13) n
  WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL) IN (2, 4) -- Tue, Thu
) dates
LIMIT 300; -- 30 students × 10 sessions

-- CST307 - MPMC (9 sessions)
INSERT INTO attendance (student_id, course, session_date, status) 
SELECT 
  s.id,
  'CST307',
  date,
  CASE WHEN random() > 0.25 THEN 'Present' ELSE 'Absent' END
FROM students s
CROSS JOIN (
  SELECT CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL AS date
  FROM generate_series(0, 13) n
  WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL) IN (1, 3, 5) -- Mon, Wed, Fri
) dates
LIMIT 270; -- 30 students × 9 sessions

-- CSL331 - SSM LAB (7 sessions)
INSERT INTO attendance (student_id, course, session_date, status) 
SELECT 
  s.id,
  'CSL331',
  date,
  CASE WHEN random() > 0.22 THEN 'Present' ELSE 'Absent' END
FROM students s
CROSS JOIN (
  SELECT CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL AS date
  FROM generate_series(0, 13) n
  WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '13 days' + (n || ' days')::INTERVAL) IN (2, 5) -- Tue, Fri
) dates
LIMIT 210; -- 30 students × 7 sessions

-- Display summary statistics
SELECT 'Database setup completed successfully!' AS message;
SELECT 'Total Students: ' || COUNT(*) FROM students;
SELECT 'Total Attendance Records: ' || COUNT(*) FROM attendance;

-- Show sample data
SELECT 'Sample Students:' AS info;
SELECT id, name, roll FROM students LIMIT 5;

SELECT 'Sample Attendance Records:' AS info;
SELECT a.id, s.name, a.course, a.session_date, a.status 
FROM attendance a 
JOIN students s ON a.student_id = s.id 
ORDER BY a.session_date DESC 
LIMIT 10;
