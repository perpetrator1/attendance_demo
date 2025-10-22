// test_connection.js - Quick test to verify database connection
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
    console.log('Testing database connection...');
    const client = await pool.connect();
    
    // Test query
    const result = await client.query('SELECT COUNT(*) as count FROM students');
    console.log('✅ Connection successful!');
    console.log(`Found ${result.rows[0].count} students in the database`);
    
    const attendance = await client.query('SELECT COUNT(*) as count FROM attendance');
    console.log(`Found ${attendance.rows[0].count} attendance records`);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('\nPlease check DATABASE_SETUP.md for instructions on configuring PostgreSQL authentication.');
    process.exit(1);
  }
}

testConnection();
