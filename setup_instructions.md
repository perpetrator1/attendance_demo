# Quick Setup Instructions

## Issue
The database is not connecting because PostgreSQL authentication needs to be configured.

## Quick Fix Options

### Option 1: Use sudo to run the setup (Easiest)
```bash
# Run the database setup with sudo
sudo -u postgres psql -d attendance_db -f setup_database.sql
```

### Option 2: Configure PostgreSQL for password authentication
Follow the steps in `DATABASE_SETUP.md` to configure PostgreSQL to use password authentication.

### Option 3: Change connection to use peer authentication
Update `server.js` to connect without a password by using the system user.

## After Database is Set Up

1. Make sure the server is running:
```bash
node server.js
```

2. Open your browser and go to: http://localhost:3000

3. Login with:
   - **Teacher**: username: `teacher`, password: `teacher123` (will redirect to attendance marking)
   - **Admin**: username: `admin`, password: `admin123` (will redirect to reports)

## Role-Based Access Control (Now Implemented)

- **Teachers**: Can only mark attendance (index.html)
- **Admins**: Can only view reports (report.html)
- **Both**: Can check individual student attendance (student.html)

## If Data is Not Showing

1. Check if PostgreSQL is running: `sudo systemctl status postgresql`
2. Check if database exists: `sudo -u postgres psql -l | grep attendance_db`
3. Check the browser console for errors (F12)
4. Check server logs in the terminal where you ran `node server.js`
