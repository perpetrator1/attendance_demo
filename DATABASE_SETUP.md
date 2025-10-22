# PostgreSQL Setup Instructions

## Problem
PostgreSQL is using "Ident" authentication which requires system user authentication instead of password authentication.

## Solution: Configure PostgreSQL for Password Authentication

### Step 1: Edit PostgreSQL Configuration

Find and edit the `pg_hba.conf` file:

```bash
# Find the config file location
sudo -u postgres psql -c "SHOW hba_file;"

# Edit the file (usually at /var/lib/pgsql/data/pg_hba.conf or /etc/postgresql/*/main/pg_hba.conf)
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

### Step 2: Change Authentication Method

Find lines that look like this:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            ident
# IPv6 local connections:
host    all             all             ::1/128                 ident
local   all             postgres                                peer
```

Change them to:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
local   all             postgres                                md5
```

### Step 3: Restart PostgreSQL

```bash
# On Fedora/RHEL/CentOS
sudo systemctl restart postgresql

# On Ubuntu/Debian
sudo systemctl restart postgresql

# Or
sudo service postgresql restart
```

### Step 4: Set PostgreSQL Password (if needed)

```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

### Step 5: Run the Setup Script

Once PostgreSQL is configured, run:
```bash
node setup_db.js
```

---

## Alternative: Use SQLite Instead

If you prefer not to configure PostgreSQL, I can convert this project to use SQLite, which requires no setup:

```bash
npm install sqlite3
```

Then modify server.js to use SQLite instead of PostgreSQL.

---

## Quick Test with Docker (Optional)

If you have Docker installed, you can run PostgreSQL in a container:

```bash
docker run --name postgres-attendance -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:latest
```

Then run the setup script:
```bash
node setup_db.js
```

---

## Manual Database Setup (Alternative)

If you can access PostgreSQL through any method, you can manually run:

1. Connect to PostgreSQL as superuser
2. Run the SQL file:
```bash
psql -U postgres -d postgres -f setup_database.sql
```

Or copy and paste the SQL from `setup_database.sql` directly into a PostgreSQL client.
