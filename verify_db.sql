-- Quick verification queries
-- Run: sudo -u postgres psql -d attendance_db -f verify_db.sql

\echo '=== STUDENTS ==='
SELECT id, name, roll FROM students ORDER BY id LIMIT 10;

\echo ''
\echo '=== ATTENDANCE SUMMARY BY COURSE ==='
SELECT 
  course,
  COUNT(DISTINCT student_id) as students,
  COUNT(*) as total_records,
  SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present_count,
  SUM(CASE WHEN status='Absent' THEN 1 ELSE 0 END) as absent_count,
  ROUND(100.0 * SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) / COUNT(*), 2) as attendance_percentage
FROM attendance
GROUP BY course
ORDER BY course;

\echo ''
\echo '=== SAMPLE ATTENDANCE RECORDS ==='
SELECT 
  s.name,
  s.roll,
  a.course,
  a.session_date,
  a.status
FROM attendance a
JOIN students s ON s.id = a.student_id
ORDER BY a.session_date DESC, s.id
LIMIT 15;
