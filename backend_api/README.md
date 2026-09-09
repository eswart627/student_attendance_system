# Student Attendance System — Backend API

RESTful API backend for the IIIT Pune Student Attendance System, built with Node.js, Express, Sequelize (MySQL), and Redis.

## Quickstart: How to Initialize & Run

### 1. Prerequisites
- **Node.js**: `>= 18.x`
- **MySQL**: `>= 8.0`
- **Redis**: `>= 6.0`

### 2. Setup Environment Variables
Create `.env` in `backend_api/`:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
QR_JWT_SECRET=your_qr_jwt_secret_key
MYSQL_DATABASE=student_attendance_system
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_SSL_CA=
REDIS_URL=redis://localhost:6379
```

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start production server (default on port 3000)
npm start

# Or start development server with nodemon
npx nodemon server.js
```

### 4. Verify Server
```bash
curl http://localhost:3000/health
# Response: OK
```

---

## 📖 Complete Documentation
For detailed architecture, database schema, entity-relationship diagrams, security mechanisms, and complete API endpoint specifications, please refer to:

👉 **[Complete Backend Documentation](documentation.md)**
