-- Database Setup Script for Attendance Management System
-- Run this as postgres user: sudo -u postgres psql -f setup_db.sql

-- Drop database if exists (careful in production!)
DROP DATABASE IF EXISTS attendance_db;

-- Create database
CREATE DATABASE attendance_db;

-- Connect to the database
\c attendance_db

-- Create students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  roll VARCHAR(50)
);

-- Create attendance table (using course code directly as per server.js)
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  course VARCHAR(50) NOT NULL,
  session_date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
  UNIQUE(student_id, course, session_date)
);

-- Insert dummy students (20 students)
INSERT INTO students (name, roll) VALUES 
  ('Alice Johnson', 'CS101'),
  ('Bob Smith', 'CS102'),
  ('Charlie Brown', 'CS103'),
  ('Diana Prince', 'CS104'),
  ('Ethan Hunt', 'CS105'),
  ('Fiona Gallagher', 'CS106'),
  ('George Wilson', 'CS107'),
  ('Hannah Montana', 'CS108'),
  ('Isaac Newton', 'CS109'),
  ('Julia Roberts', 'CS110'),
  ('Kevin Hart', 'CS111'),
  ('Laura Palmer', 'CS112'),
  ('Michael Scott', 'CS113'),
  ('Nina Simone', 'CS114'),
  ('Oscar Wilde', 'CS115'),
  ('Pam Beesly', 'CS116'),
  ('Quincy Adams', 'CS117'),
  ('Rachel Green', 'CS118'),
  ('Steve Rogers', 'CS119'),
  ('Tina Turner', 'CS120');

-- Insert dummy attendance records for the past 2 weeks
-- CSL333 - DBMS LAB (10 sessions)
INSERT INTO attendance (student_id, course, session_date, status) VALUES
  -- Week 1 - Monday
  (1, 'CSL333', '2025-10-08', 'Present'),
  (2, 'CSL333', '2025-10-08', 'Present'),
  (3, 'CSL333', '2025-10-08', 'Absent'),
  (4, 'CSL333', '2025-10-08', 'Present'),
  (5, 'CSL333', '2025-10-08', 'Present'),
  (6, 'CSL333', '2025-10-08', 'Present'),
  (7, 'CSL333', '2025-10-08', 'Absent'),
  (8, 'CSL333', '2025-10-08', 'Present'),
  (9, 'CSL333', '2025-10-08', 'Present'),
  (10, 'CSL333', '2025-10-08', 'Present'),
  (11, 'CSL333', '2025-10-08', 'Present'),
  (12, 'CSL333', '2025-10-08', 'Absent'),
  (13, 'CSL333', '2025-10-08', 'Present'),
  (14, 'CSL333', '2025-10-08', 'Present'),
  (15, 'CSL333', '2025-10-08', 'Present'),
  (16, 'CSL333', '2025-10-08', 'Present'),
  (17, 'CSL333', '2025-10-08', 'Present'),
  (18, 'CSL333', '2025-10-08', 'Absent'),
  (19, 'CSL333', '2025-10-08', 'Present'),
  (20, 'CSL333', '2025-10-08', 'Present'),
  
  -- Week 1 - Wednesday
  (1, 'CSL333', '2025-10-10', 'Present'),
  (2, 'CSL333', '2025-10-10', 'Present'),
  (3, 'CSL333', '2025-10-10', 'Present'),
  (4, 'CSL333', '2025-10-10', 'Present'),
  (5, 'CSL333', '2025-10-10', 'Absent'),
  (6, 'CSL333', '2025-10-10', 'Present'),
  (7, 'CSL333', '2025-10-10', 'Present'),
  (8, 'CSL333', '2025-10-10', 'Present'),
  (9, 'CSL333', '2025-10-10', 'Absent'),
  (10, 'CSL333', '2025-10-10', 'Present'),
  (11, 'CSL333', '2025-10-10', 'Present'),
  (12, 'CSL333', '2025-10-10', 'Present'),
  (13, 'CSL333', '2025-10-10', 'Present'),
  (14, 'CSL333', '2025-10-10', 'Absent'),
  (15, 'CSL333', '2025-10-10', 'Present'),
  (16, 'CSL333', '2025-10-10', 'Present'),
  (17, 'CSL333', '2025-10-10', 'Present'),
  (18, 'CSL333', '2025-10-10', 'Present'),
  (19, 'CSL333', '2025-10-10', 'Present'),
  (20, 'CSL333', '2025-10-10', 'Absent');

-- CST301 - FLAT (8 sessions)
INSERT INTO attendance (student_id, course, session_date, status) VALUES
  -- Session 1
  (1, 'CST301', '2025-10-09', 'Present'),
  (2, 'CST301', '2025-10-09', 'Present'),
  (3, 'CST301', '2025-10-09', 'Present'),
  (4, 'CST301', '2025-10-09', 'Absent'),
  (5, 'CST301', '2025-10-09', 'Present'),
  (6, 'CST301', '2025-10-09', 'Present'),
  (7, 'CST301', '2025-10-09', 'Present'),
  (8, 'CST301', '2025-10-09', 'Present'),
  (9, 'CST301', '2025-10-09', 'Present'),
  (10, 'CST301', '2025-10-09', 'Absent'),
  (11, 'CST301', '2025-10-09', 'Present'),
  (12, 'CST301', '2025-10-09', 'Present'),
  (13, 'CST301', '2025-10-09', 'Present'),
  (14, 'CST301', '2025-10-09', 'Present'),
  (15, 'CST301', '2025-10-09', 'Absent'),
  (16, 'CST301', '2025-10-09', 'Present'),
  (17, 'CST301', '2025-10-09', 'Present'),
  (18, 'CST301', '2025-10-09', 'Present'),
  (19, 'CST301', '2025-10-09', 'Present'),
  (20, 'CST301', '2025-10-09', 'Present'),
  
  -- Session 2
  (1, 'CST301', '2025-10-11', 'Present'),
  (2, 'CST301', '2025-10-11', 'Absent'),
  (3, 'CST301', '2025-10-11', 'Present'),
  (4, 'CST301', '2025-10-11', 'Present'),
  (5, 'CST301', '2025-10-11', 'Present'),
  (6, 'CST301', '2025-10-11', 'Present'),
  (7, 'CST301', '2025-10-11', 'Absent'),
  (8, 'CST301', '2025-10-11', 'Present'),
  (9, 'CST301', '2025-10-11', 'Present'),
  (10, 'CST301', '2025-10-11', 'Present'),
  (11, 'CST301', '2025-10-11', 'Present'),
  (12, 'CST301', '2025-10-11', 'Absent'),
  (13, 'CST301', '2025-10-11', 'Present'),
  (14, 'CST301', '2025-10-11', 'Present'),
  (15, 'CST301', '2025-10-11', 'Present'),
  (16, 'CST301', '2025-10-11', 'Present'),
  (17, 'CST301', '2025-10-11', 'Present'),
  (18, 'CST301', '2025-10-11', 'Absent'),
  (19, 'CST301', '2025-10-11', 'Present'),
  (20, 'CST301', '2025-10-11', 'Present');

-- CST303 - COMPUTER NETWORKS (7 sessions)
INSERT INTO attendance (student_id, course, session_date, status) VALUES
  -- Session 1
  (1, 'CST303', '2025-10-07', 'Present'),
  (2, 'CST303', '2025-10-07', 'Present'),
  (3, 'CST303', '2025-10-07', 'Present'),
  (4, 'CST303', '2025-10-07', 'Present'),
  (5, 'CST303', '2025-10-07', 'Present'),
  (6, 'CST303', '2025-10-07', 'Absent'),
  (7, 'CST303', '2025-10-07', 'Present'),
  (8, 'CST303', '2025-10-07', 'Present'),
  (9, 'CST303', '2025-10-07', 'Present'),
  (10, 'CST303', '2025-10-07', 'Present'),
  (11, 'CST303', '2025-10-07', 'Absent'),
  (12, 'CST303', '2025-10-07', 'Present'),
  (13, 'CST303', '2025-10-07', 'Present'),
  (14, 'CST303', '2025-10-07', 'Present'),
  (15, 'CST303', '2025-10-07', 'Present'),
  (16, 'CST303', '2025-10-07', 'Present'),
  (17, 'CST303', '2025-10-07', 'Absent'),
  (18, 'CST303', '2025-10-07', 'Present'),
  (19, 'CST303', '2025-10-07', 'Present'),
  (20, 'CST303', '2025-10-07', 'Present');

-- CST307 - MPMC (6 sessions)
INSERT INTO attendance (student_id, course, session_date, status) VALUES
  -- Session 1
  (1, 'CST307', '2025-10-08', 'Present'),
  (2, 'CST307', '2025-10-08', 'Present'),
  (3, 'CST307', '2025-10-08', 'Absent'),
  (4, 'CST307', '2025-10-08', 'Present'),
  (5, 'CST307', '2025-10-08', 'Present'),
  (6, 'CST307', '2025-10-08', 'Present'),
  (7, 'CST307', '2025-10-08', 'Present'),
  (8, 'CST307', '2025-10-08', 'Absent'),
  (9, 'CST307', '2025-10-08', 'Present'),
  (10, 'CST307', '2025-10-08', 'Present'),
  (11, 'CST307', '2025-10-08', 'Present'),
  (12, 'CST307', '2025-10-08', 'Present'),
  (13, 'CST307', '2025-10-08', 'Absent'),
  (14, 'CST307', '2025-10-08', 'Present'),
  (15, 'CST307', '2025-10-08', 'Present'),
  (16, 'CST307', '2025-10-08', 'Present'),
  (17, 'CST307', '2025-10-08', 'Present'),
  (18, 'CST307', '2025-10-08', 'Present'),
  (19, 'CST307', '2025-10-08', 'Absent'),
  (20, 'CST307', '2025-10-08', 'Present');

-- CSL331 - SSM LAB (5 sessions)
INSERT INTO attendance (student_id, course, session_date, status) VALUES
  -- Session 1
  (1, 'CSL331', '2025-10-09', 'Present'),
  (2, 'CSL331', '2025-10-09', 'Absent'),
  (3, 'CSL331', '2025-10-09', 'Present'),
  (4, 'CSL331', '2025-10-09', 'Present'),
  (5, 'CSL331', '2025-10-09', 'Present'),
  (6, 'CSL331', '2025-10-09', 'Present'),
  (7, 'CSL331', '2025-10-09', 'Present'),
  (8, 'CSL331', '2025-10-09', 'Present'),
  (9, 'CSL331', '2025-10-09', 'Absent'),
  (10, 'CSL331', '2025-10-09', 'Present'),
  (11, 'CSL331', '2025-10-09', 'Present'),
  (12, 'CSL331', '2025-10-09', 'Present'),
  (13, 'CSL331', '2025-10-09', 'Present'),
  (14, 'CSL331', '2025-10-09', 'Absent'),
  (15, 'CSL331', '2025-10-09', 'Present'),
  (16, 'CSL331', '2025-10-09', 'Present'),
  (17, 'CSL331', '2025-10-09', 'Present'),
  (18, 'CSL331', '2025-10-09', 'Present'),
  (19, 'CSL331', '2025-10-09', 'Present'),
  (20, 'CSL331', '2025-10-09', 'Absent');

-- Display summary
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_attendance_records FROM attendance;
SELECT course, COUNT(*) as sessions FROM attendance GROUP BY course ORDER BY course;
