# Database Security Guidelines

This document outlines the security architecture, connection practices, encryption details, access levels, and backup strategies implemented for the Cloud Mosaic database engine.

---

## 🔒 1. Connection Security

- **Secrets Handling**: All secrets, usernames, passwords, and host coordinates are loaded from environment variables using `python-dotenv`. No secrets are hardcoded in the codebase.
- **DATABASE_URL Configuration**: The backend dynamically parses RFC-compliant `DATABASE_URL` strings (e.g., `postgresql://user:pass@host:port/dbname`).
- **Connection Pooling**: To optimize performance and reuse connections, connection pooling is configured via `CONN_MAX_AGE` (defaults to 10 minutes in production).

---

## 🔑 2. Field-Level Encryption

Sensitive employee and operational fields are encrypted at rest using Fernet symmetric encryption.
- **Derived Encryption Key**: A 32-byte URL-safe base64-encoded key is derived deterministically from the Django `SECRET_KEY` using SHA-256.
- **Encrypted Fields**:
  - `EmployeeProfile.phone`
  - `EmployeeProfile.address`
  - `EmployeeProfile.emergency_contact`

---

## 👥 3. Database Access Control & Least Privilege

In production, database access must follow the **Principle of Least Privilege (PoLP)**. The default application connection user should not have administrative privileges (like superuser or DB owner).

### Setup Script for PostgreSQL
Create a restricted application role:
```sql
-- 1. Create a new user role
CREATE USER cloud_mosaic_app WITH PASSWORD 'secure_application_password';

-- 2. Revoke all privileges by default
REVOKE ALL ON DATABASE cloud_mosaic_db FROM PUBLIC;

-- 3. Grant basic connect and table mutation privileges
GRANT CONNECT ON DATABASE cloud_mosaic_db TO cloud_mosaic_app;
GRANT USAGE ON SCHEMA public TO cloud_mosaic_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cloud_mosaic_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cloud_mosaic_app;
```

---

## 🗄️ 4. Backup & Disaster Recovery Strategy

### Automated Backup Script
Schedule a daily automated cron job to dump database contents securely:
```bash
#!/bin/bash
# Backup script path: /opt/scripts/db_backup.sh
BACKUP_DIR="/var/backups/db"
TIMESTAMP=$(date +%F_%H-%M-%S)
FILENAME="cloud_mosaic_backup_$TIMESTAMP.sql.gz"

pg_dump -h localhost -U cloud_mosaic_app -d cloud_mosaic_db | gzip > "$BACKUP_DIR/$FILENAME"
find "$BACKUP_DIR" -type f -mtime +30 -delete # Retention policy: 30 days
```

### Restore Process
To restore from a backup:
```bash
gunzip -c /var/backups/db/cloud_mosaic_backup_YYYY-MM-DD.sql.gz | psql -h localhost -U cloud_mosaic_app -d cloud_mosaic_db
```

---

## 📈 5. Monitoring & Logging

- **Database Errors Logger**: All database engine exceptions, failed connection checks, and driver crashes are logged to `logs/db.log` via the `django.db.backends` log handler.
- **Slow Query Logging (PostgreSQL)**: Configure `log_min_duration_statement` in `postgresql.conf` to log statements taking longer than 500ms:
  ```ini
  log_min_duration_statement = 500
  ```
