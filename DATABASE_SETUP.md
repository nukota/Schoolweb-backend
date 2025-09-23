# Database Setup Guide

## Prerequisites

- PostgreSQL installed and running locally
- Database client (pgAdmin, DBeaver, or psql command line)

## Setup Steps

### 1. Create Database

Connect to your PostgreSQL server and create a new database:

```sql
CREATE DATABASE schoolweb_db;
```

### 2. Create Database User (Optional but recommended)

```sql
CREATE USER schoolweb_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE schoolweb_db TO schoolweb_user;
```

### 3. Update Environment Variables

Edit the `.env` file in your project root with your actual database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=schoolweb_user  # or your PostgreSQL username
DB_PASSWORD=your_secure_password  # your actual password
DB_NAME=schoolweb_db
```

### 4. Start the Application

The application will automatically create the database tables when you start it:

```bash
npm run start:dev
```

## Database Schema

The application will create the following tables:

- `users` - Core user authentication data
- `student_profiles` - Student-specific information
- `teacher_profiles` - Teacher-specific information
- `subjects` - Academic subjects
- `classes` - Class/course instances
- `enrollments` - Student-class relationships
- `requests` - Student requests (drop/add classes)

## Important Notes

- `synchronize: true` is enabled in development mode, which automatically creates/updates database schema
- **DISABLE** `synchronize` in production and use proper migrations
- Tables will be created automatically on first run
- Sample data insertion should be done through API endpoints or data seeding scripts

## API Endpoints

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Profile Creation (after signup)

- `POST /student-profiles` - Create student profile (protected route)
- `POST /teacher-profiles` - Create teacher profile (protected route)

## Testing the Setup

1. Start your PostgreSQL server
2. Create the database
3. Update the `.env` file with correct credentials
4. Run `npm run start:dev`
5. Check the console for successful database connection
6. Tables should be automatically created

## Troubleshooting

### Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check connection details in `.env`
- Ensure user has proper permissions

### Port Conflicts

- Default PostgreSQL port is 5432
- Change `DB_PORT` in `.env` if using different port

### Authentication Issues

- Verify username/password combination
- Check PostgreSQL `pg_hba.conf` for authentication methods
