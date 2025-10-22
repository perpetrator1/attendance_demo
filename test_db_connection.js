// Quick test to verify database connection
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'attendance_db',
  password: 'postgres',
  port: 5432,
});

async function testConnection() {
  try {
    console.log('Testing connection...');
    const result = await pool.query('SELECT COUNT(*) as count FROM students;');
    console.log('✓ Connection successful!');
    console.log('✓ Students in database:', result.rows[0].count);
    
    const attendance = await pool.query('SELECT COUNT(*) as count FROM attendance;');
    console.log('✓ Attendance records:', attendance.rows[0].count);
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

testConnection();
