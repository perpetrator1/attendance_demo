# Attendance Management System - Setup Complete! 🎉

## ✅ What's Been Created

### Database
- **Database Name**: `attendance_db`
- **30 Students** with roll numbers 101-130
- **690+ Attendance Records** across 5 subjects over the past 2 weeks
- Random attendance patterns (85% average attendance rate)

### Students Sample
- Alice Johnson (101)
- Bob Smith (102)
- Charlie Brown (103)
- Diana Prince (104)
- Ethan Hunt (105)
- ... and 25 more

### Subjects
1. **CSL333** - DBMS LAB (Mon, Thu)
2. **CST301** - FLAT (Mon, Wed, Fri)
3. **CST303** - COMPUTER NETWORKS (Tue, Thu)
4. **CST307** - MPMC (Mon, Wed, Fri)
5. **CSL331** - SSM LAB (Tue, Fri)

---

## 🔧 PostgreSQL Authentication Issue

Your PostgreSQL is using "Ident" authentication. To run the server, you have **2 options**:

### Option 1: Run Server as PostgreSQL User (Quick Fix)
```bash
sudo -u postgres node server.js
```

Then visit: `http://localhost:3000`

### Option 2: Configure Password Authentication (Permanent Fix)

1. **Find PostgreSQL config file:**
```bash
sudo -u postgres psql -c "SHOW hba_file;"
```

2. **Edit the file:**
```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

3. **Change these lines from `ident`/`peer` to `md5`:**
```
# Before:
local   all             postgres                                peer
host    all             all             127.0.0.1/32            ident
host    all             all             ::1/128                 ident

# After:
local   all             postgres                                md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

4. **Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

5. **Set password (if not already set):**
```bash
sudo -u postgres psql
```
Then in psql:
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

6. **Now you can run normally:**
```bash
node server.js
```

---

## 🚀 Running the Application

### Quick Start (if auth configured):
```bash
node server.js
```

### Or use sudo method:
```bash
sudo -u postgres node server.js
```

Visit: **http://localhost:3000**

---

## 🔐 Login Credentials

- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`

---

## 📁 Files Created

- `setup_database.sql` - SQL script with all table and data creation
- `setup_db.js` - Node.js script to set up database
- `test_connection.js` - Test database connection
- `DATABASE_SETUP.md` - Detailed setup instructions
- `public/login.html` - Login page

---

## 🎯 Features

1. **Login System** - Secure authentication with sessions
2. **Mark Attendance** - Select course, date, and mark students present/absent
3. **View Reports** - Complete attendance matrix for all students and subjects
4. **Student View** - Individual student attendance across all subjects
5. **Logout** - Available on all pages

---

## 📊 Database Schema

### Students Table
- `id` (Primary Key)
- `name` (VARCHAR 100)
- `roll` (VARCHAR 50, Unique)

### Attendance Table
- `id` (Primary Key)
- `student_id` (Foreign Key → students)
- `course` (VARCHAR 20)
- `session_date` (DATE)
- `status` ('Present' or 'Absent')
- Unique constraint on (student_id, course, session_date)

---

## 🔍 Quick Database Check

```bash
sudo -u postgres psql -d attendance_db -c "SELECT COUNT(*) FROM students;"
sudo -u postgres psql -d attendance_db -c "SELECT COUNT(*) FROM attendance;"
```

---

## 🆘 Troubleshooting

**Connection Error?**
- Use: `sudo -u postgres node server.js`
- Or follow Option 2 above to configure password authentication

**Database doesn't exist?**
```bash
sudo -u postgres psql -d attendance_db -f setup_database.sql
```

**Reset database:**
```bash
sudo -u postgres psql -c "DROP DATABASE attendance_db;"
sudo -u postgres psql -c "CREATE DATABASE attendance_db;"
sudo -u postgres psql -d attendance_db -f setup_database.sql
```

---

Enjoy your attendance management system! 🎓
