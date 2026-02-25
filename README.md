# Threat Modeling Sample Application

This is a GCU University project created for the sake of threat modeling with ThreatDragon.

## Overview

A simple web application that:

- Presents a login page (username and password)
- Uses **Passport.js** (open-source) to authenticate credentials against a database
- On successful login, shows a message-of-the-day stored in the database
- Allows authenticated users to comment on the message-of-the-day (comments stored in the database)

## Tech Stack

- **Node.js** + **Express**
- **Passport.js** (passport-local) for authentication
- **SQLite** with schema defined in `database/schema.sql`

## Database Setup

1. From the project root, create the database and tables using the DDL script:

   ```bash
   sqlite3 database/app.db < database/schema.sql
   ```

   Or run the app once; it will create the DB and schema if missing. Seed a user with:

   ```bash
   node database/seed.js
   ```

2. Default seed user: `demo` / `demo123` (change in production.)

## Run the Application

```bash
npm install
npm start
```

Open http://localhost:3000 and log in with the seed user.

## Database Schema

See `database/schema.sql` for the full DDL. Tables: `users`, `message_of_the_day`, `comments`.

## License

Educational use — GCU University.
