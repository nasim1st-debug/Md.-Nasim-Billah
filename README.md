# QueueMaster - Digital Queue Management System

A professional, real-time queue management system built with React, Node.js, Express, Socket.io, and SQLite.

## Features
- **Token Generation**: High-impact UI for customers to take tokens.
- **Live Display**: Real-time board with sound notifications when a token is called.
- **Staff Counter**: Controller for staff to call the next token, skip, or manage counter status.
- **Admin Dashboard**: Overview of system traffic and status with data reset capabilities.
- **Authentication**: JWT-based login for staff and admins.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion (for animations), Lucide React (icons).
- **Backend**: Express.js, Socket.io (real-time), better-sqlite3 (database).
- **Communication**: Socket.io for instant updates across all screens.

## Quick Start (Local Setup)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   Create a `.env` file based on `.env.example`.
   ```bash
   JWT_SECRET="your_secret_key"
   ```

3. **Run in Development**:
   ```bash
   npm run dev
   ```
   The app will automatically initialize the SQLite database (`queue.db`) and create default accounts.

4. **Default Credentials**:
   - **Admin**: username: `admin` | password: `admin123`
   - **Staff**: username: `staff1` | password: `admin123`

## API Endpoints
- `POST /api/auth/login`: Authenticate users.
- `POST /api/tokens/generate`: Create a new queue token (A001...).
- `GET /api/queue/stats`: Get current waiting/calling/served stats.
- `GET /api/counters`: List all service counters.
- `POST /api/counters/:id/call-next`: Assign next waiting token to a counter.
- `POST /api/counters/:id/status`: Change counter online/offline status.
- `POST /api/admin/clear-queue`: Reset system data.

## System Design
- **Real-time broadcast**: When a staff calls a token, the server emits a `token-called` event via Socket.io. The `Display` component listens to this to trigger the sound or visual alert.
- **Queue Logic**: Tokens are served in FIFO (First In, First Out) order by ID.
- **SQLite Database**: Used for simplicity and portability. In a high-traffic production environment, swap `better-sqlite3` for `pg` (PostgreSQL) in `backend/db.ts` with minimal changes.

## License
MIT
