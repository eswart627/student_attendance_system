# Student Attendance System (SAS) — Backend API Documentation

A high-performance Node.js, Express, Sequelize (MySQL), and Redis backend powering dynamic QR-based attendance tracking, real-time teacher session controls, anti-spam scan validation, and academic reporting.

---

## 📑 Table of Contents
1. [Getting Started: Initializing & Running Locally](#-getting-started-initializing--running-locally)
   - [1.1 System Prerequisites](#11-system-prerequisites)
   - [1.2 Environment Variables Configuration (.env)](#12-environment-variables-configuration-env)
   - [1.3 Step-by-Step Installation & Setup](#13-step-by-step-installation--setup)
   - [1.4 Running the Server](#14-running-the-server)
   - [1.5 Health Check & Smoke Test](#15-health-check--smoke-test)
   - [1.6 Running Automated Tests](#16-running-automated-tests)
2. [Architecture & Technology Stack](#-architecture--technology-stack)
   - [2.1 Technology Matrix](#21-technology-matrix)
   - [2.2 High-Level Request Flow & Architecture](#22-high-level-request-flow--architecture)
3. [Codebase Structure & Directory Map](#-codebase-structure--directory-map)
4. [Database Models & Schema Design](#-database-models--schema-design)
   - [4.1 Model Specifications](#41-model-specifications)
   - [4.2 Model Associations & Entity Relationships](#42-model-associations--entity-relationships)
   - [4.3 Entity-Relationship Diagram](#43-entity-relationship-diagram)
5. [Security & Authentication Middleware](#-security--authentication-middleware)
   - [5.1 JWT Bearer Authentication & Role-Based Access Control](#51-jwt-bearer-authentication--role-based-access-control)
   - [5.2 Password Hashing](#52-password-hashing)
6. [Detailed API Reference](#-detailed-api-reference)
   - [6.1 Health Check Route](#61-health-check-route)
   - [6.2 Authentication Routes (`/api/auth`)](#62-authentication-routes-apiauth)
   - [6.3 Teacher Session Routes (`/api/teacher/sessions`)](#63-teacher-session-routes-apiteachersessions)
   - [6.4 Student Scan Routes (`/api/student`)](#64-student-scan-routes-apistudent)
   - [6.5 Reporting Routes (`/api/report` & `/api/teacher/report`)](#65-reporting-routes-apireport--apiteacherreport)
7. [Anti-Spam, Time Synchronization & QR Security Mechanics](#-anti-spam-time-synchronization--qr-security-mechanics)
8. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🚀 Getting Started: Initializing & Running Locally

### 1.1 System Prerequisites

Before running the backend API, ensure the following software is installed on your workstation:

| Tool | Recommended Version | Verification Command | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.x` (Tested on `v22.x` / `v24.x`) | `node -v` | JavaScript runtime |
| **npm** | `>= 9.x` (Tested on `11.x`) | `npm -v` | Package manager |
| **MySQL Server** | `>= 8.0` | `mysql --version` | Relational database engine |
| **Redis Server** | `>= 6.0` (or cloud Redis / Upstash / Aiven) | `redis-cli ping` | In-memory key-value cache |

---

### 1.2 Environment Variables Configuration (.env)

Create a `.env` file in the root of the `backend_api/` directory:

```bash
cd backend_api
touch .env   # On Windows: New-Item .env
```

Populate the `.env` file with the following required configuration keys:

```env
# Server Configuration
PORT=3000

# JSON Web Token Secrets
JWT_SECRET=super_secret_jwt_key_change_in_production_12345
QR_JWT_SECRET=super_secret_qr_jwt_key_change_in_production_67890

# MySQL Database Configuration
MYSQL_DATABASE=student_attendance_system
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306

# MySQL SSL Configuration (Leave empty or omit if connecting to local MySQL without SSL)
MYSQL_SSL_CA=

# Redis Connection URL
REDIS_URL=redis://localhost:6379
```

#### Environment Variable Descriptions:

| Variable | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | No (Default: `3000`) | Port on which Express listens |
| `JWT_SECRET` | String | **Yes** | Secret key for signing and verifying user login JWTs (12h TTL) |
| `QR_JWT_SECRET` | String | **Yes** | Secret key for signing and validating rotating QR tokens (5s TTL) |
| `MYSQL_DATABASE` | String | **Yes** | Name of the MySQL database schema |
| `MYSQL_USER` | String | **Yes** | MySQL user account username |
| `MYSQL_PASSWORD` | String | **Yes** | MySQL user account password |
| `MYSQL_HOST` | String | **Yes** | Hostname or IP address of the MySQL server |
| `MYSQL_PORT` | Number | **Yes** | MySQL port (typically `3306`) |
| `MYSQL_SSL_CA` | String | Conditional | Certificate Authority certificate string or path for cloud SSL databases (e.g. TiDB, Aiven). If using local MySQL without SSL, remove or leave empty. |
| `REDIS_URL` | String | **Yes** | Full Redis connection URI (e.g., `redis://127.0.0.1:6379` or `rediss://...`) |

> [!IMPORTANT]
> If your local MySQL server does not enforce SSL, you can adjust `config/db.js` to only include `ssl` in `dialectOptions` when `process.env.MYSQL_SSL_CA` is provided.

---

### 1.3 Step-by-Step Installation & Setup

```bash
# Step 1: Navigate to the backend directory
cd backend_api

# Step 2: Install dependencies
npm install

# Step 3: Create MySQL Database
# Log into your MySQL console:
mysql -u root -p
# In the MySQL shell, run:
CREATE DATABASE student_attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Step 4: Ensure Redis is running
# On Linux/macOS:
redis-server
# Or verify Redis responds with PONG:
redis-cli ping
```

---

### 1.4 Running the Server

#### Option A: Production Mode
```bash
npm start
# Equivalent to: node server.js
```

#### Option B: Development Mode (Auto-restart on code change)
```bash
npx nodemon server.js
```

Upon successful startup, you will observe the following console output:
```text
Database connected...
All models synced successfully
Redis connected
Server is running on 0.0.0.0:3000
```

> [!NOTE]
> Database tables and constraints are automatically created on initial launch via `sequelize.sync()` in `models/index.js`.

---

### 1.5 Health Check & Smoke Test

To verify the backend is running and reachable:

```bash
curl http://localhost:3000/health
```

**Expected Response**:
```text
OK
```

---

### 1.6 Running Automated Tests

The repository includes a test script configured in `package.json`:

```bash
npm test
# Runs: mocha --timeout 5000
```

---

## 🏛 Architecture & Technology Stack

### 2.1 Technology Matrix

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `>= 18.x` | Asynchronous event-driven JavaScript runtime |
| **HTTP Framework** | Express | `^5.1.0` | High-performance routing & middleware framework |
| **Security Headers** | Helmet | `^8.1.0` | Sets critical HTTP response headers (`X-Content-Type-Options`, `HSTS`, etc.) |
| **CORS** | cors | `^2.8.5` | Cross-Origin Resource Sharing middleware |
| **ORM** | Sequelize | `^6.37.7` | Promise-based Node.js ORM for MySQL |
| **Database Driver** | mysql2 | `^3.24.2` | High-speed MySQL database driver |
| **In-Memory Cache** | ioredis | `^5.8.2` | Fast Redis client handling volatile QR nonces and live sets |
| **Token Authentication** | jsonwebtoken | `^9.0.2` | Signs and verifies user sessions and dynamic QR payloads |
| **Password Hashing** | bcrypt | `^6.0.0` | Salted cryptographic password hashing (10 rounds) |
| **QR Code Engine** | qrcode | `^1.5.4` | Generates Base64 Data URL QR images on demand |
| **Identifiers** | uuid (v4) | `^13.0.0` | Generates cryptographically secure UUIDv4 tokens and IDs |

---

### 2.2 High-Level Request Flow & Architecture

```text
  ┌────────────────────────────────────────────────────────┐
  │                 CLIENT APPLICATIONS                    │
  │  Teacher Web App (Vite React) │ Student Mobile App     │
  └───────────────┬────────────────────────┬───────────────┘
                  │ (HTTP/HTTPS)           │ (HTTP/HTTPS)
                  ▼                        ▼
  ┌────────────────────────────────────────────────────────┐
  │                    EXPRESS 5 SERVER                    │
  │           helmet() │ cors() │ express.json()           │
  └───────────────────────┬────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   /api/auth       /api/teacher     /api/student & /api/report
   (Login/Reg)     (Sessions/Live)  (QR Scan / Reports)
         │                │                │
         └────────┬───────┴────────┬───────┘
                  │                │
                  ▼                ▼
       ┌──────────────────┐  ┌──────────────────┐
       │   REDIS CACHE    │  │   MYSQL (RDBMS)  │
       │ (ioredis 5.8)    │  │ (Sequelize 6.37) │
       ├──────────────────┤  ├──────────────────┤
       │ • activeSession  │  │ • teachers       │
       │ • qr:<nonce>     │  │ • students       │
       │ • liveAttendance │  │ • classes        │
       │   (Sets & TTLs)  │  │ • courses        │
       │                  │  │ • sessions       │
       │                  │  │ • attendances    │
       │                  │  │ • coursestats    │
       │                  │  │ • sessionclasses │
       │                  │  │ • studentcourses │
       └──────────────────┘  └──────────────────┘
```

---

## 📂 Codebase Structure & Directory Map

```text
backend_api/
├── config/
│   ├── db.js                 # Sequelize MySQL initialization & connection authentication
│   ├── env.js                # Environment configuration placeholder
│   └── redis.js              # ioredis client initialization & connection lifecycle events
│
├── middleware/
│   └── authMiddleWare.js     # auth(roles): Bearer token extraction, JWT verification & RBAC
│
├── models/
│   ├── Attendance.js         # Attendance records linking Student, Session, and markedAt
│   ├── Class.js              # Class divisions (e.g. "CSE-A", "Year2-Sem1-A")
│   ├── Course.js             # Academic courses belonging to Teachers
│   ├── CourseStats.js        # Maps Course to Class & tracks totalClasses conducted counter
│   ├── Session.js            # Live/historical lecture sessions with start, end & active flag
│   ├── SessionClass.js       # Pivot table linking Session to multiple Classes
│   ├── Student.js            # Student accounts (MIS, year, semester, branch, classId, BLOB pic)
│   ├── StudentCourses.js     # Pivot table linking Student to enrolled Courses
│   ├── Teacher.js            # Faculty accounts (facultyId ID-X-NNN, email, BLOB pic)
│   └── index.js              # Model associations, foreign key constraints & sequelize.sync()
│
├── routes/
│   ├── auth.js               # POST /api/auth/login and POST /api/auth/register
│   ├── report.js             # GET /api/report/student/:id and GET /api/report/session/:id
│   ├── studentScan.js        # POST /api/student/scan (time & class-validated QR attendance)
│   ├── teacherReport.js      # GET /api/teacher/report (course & class breakdown analytics)
│   └── teacherSessions.js    # Teacher session lifecycle, dynamic QR, live stream & overrides
│
├── package.json              # Dependencies, scripts (start, test) & package metadata
├── package-lock.json         # Pinned dependency tree
└── server.js                 # Express application bootstrap, middleware & route mounting
```

---

## 🗄 Database Models & Schema Design

### 4.1 Model Specifications

#### 1. `Teacher` (`models/Teacher.js`)
- **Table Name**: `teachers`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Unique teacher identifier.
  - `facultyId` (`STRING`, Not Null, Unique): Faculty code validating against regular expression `/^ID-[A-Z]-\d{3}$/i` (e.g., `ID-A-017`).
  - `firstName` (`STRING`, Not Null): Teacher first name.
  - `lastName` (`STRING`, Not Null): Teacher last name.
  - `email` (`STRING`, Not Null, Unique): Institutional email (`isEmail: true`).
  - `department` (`STRING`, Not Null): Academic department name.
  - `passwordHash` (`STRING`, Not Null): Bcrypt hashed password.
  - `profilePic` (`BLOB("long")`, Nullable): Stored avatar binary data.
  - `createdAt`, `updatedAt` (`DATE`): Managed timestamps.

#### 2. `Student` (`models/Student.js`)
- **Table Name**: `students`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Unique student identifier.
  - `firstName` (`STRING`, Not Null): Student first name.
  - `lastName` (`STRING`, Not Null): Student last name.
  - `email` (`STRING`, Not Null, Unique): Student institutional email (`isEmail: true`).
  - `year` (`INTEGER`, Not Null): Academic study year (1 to 4).
  - `semester` (`INTEGER`, Not Null): Current semester (`min: 1`, `max: 8`).
  - `passwordHash` (`STRING`, Not Null): Bcrypt hashed password.
  - `MIS` (`STRING`, Not Null, Unique): Student Management Information System roll number.
  - `department` (`STRING`, Not Null): Academic department.
  - `branch` (`STRING`, Not Null): Academic branch (e.g., "CSE", "ECE").
  - `classId` (`UUID`, Nullable, FK -> `classes.id`): References the student's assigned classroom cohort (`onUpdate: CASCADE`, `onDelete: SET NULL`).
  - `profilePic` (`BLOB("long")`, Nullable): Binary picture data.

#### 3. `Class` (`models/Class.js`)
- **Table Name**: `classes`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Class identifier.
  - `name` (`STRING`, Not Null): Display name (e.g., `"CSE-A"`).
  - `code` (`STRING`, Not Null, Unique): Internal code identifier (e.g., `"CSE_DIV_A"`).
  - `description` (`TEXT`, Nullable): Cohort description.

#### 4. `Course` (`models/Course.js`)
- **Table Name**: `courses`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Course identifier.
  - `name` (`STRING`, Not Null): Course title (e.g., `"Operating Systems"`).
  - `code` (`STRING`, Not Null, Unique): Course code (e.g., `"CS-301"`).
  - `teacherId` (`UUID`, Not Null, FK -> `teachers.id`): Instructor assigned to course.

#### 5. `CourseStats` (`models/CourseStats.js`)
- **Table Name**: `coursestats`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Record ID.
  - `courseId` (`UUID`, Not Null, FK -> `courses.id`): Target course.
  - `classId` (`UUID`, Nullable, FK -> `classes.id`, `onDelete: CASCADE`): Target class.
  - `totalClasses` (`INTEGER`, default: `0`): Running counter of total lectures conducted for this course-class mapping.

#### 6. `Session` (`models/Session.js`)
- **Table Name**: `sessions`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Session identifier.
  - `courseId` (`UUID`, Not Null, FK -> `courses.id`): Course being taught.
  - `teacherId` (`UUID`, Not Null, FK -> `teachers.id`): Conducting teacher.
  - `startTime` (`DATE`, Not Null): Session start timestamp.
  - `endTime` (`DATE`, Not Null): Session scheduled expiration timestamp.
  - `active` (`BOOLEAN`, default: `true`): Live status flag.

#### 7. `SessionClass` (`models/SessionClass.js`)
- **Table Name**: `sessionclasses`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Record ID.
  - `sessionId` (`UUID`, Not Null, FK -> `sessions.id`, `onDelete: CASCADE`): Live session.
  - `classId` (`UUID`, Not Null, FK -> `classes.id`, `onDelete: CASCADE`): Class permitted to mark attendance.

#### 8. `StudentCourses` (`models/StudentCourses.js`)
- **Table Name**: `studentcourses`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Enrollment ID.
  - `studentId` (`UUID`, Not Null, FK -> `students.id`): Enrolled student.
  - `courseId` (`UUID`, Not Null, FK -> `courses.id`): Enrolled course.

#### 9. `Attendance` (`models/Attendance.js`)
- **Table Name**: `attendances`
- **Fields**:
  - `id` (`UUID`, PK, default: `UUIDV4`): Attendance record identifier.
  - `sessionId` (`UUID`, Not Null, FK -> `sessions.id`): Attended session.
  - `studentId` (`UUID`, Not Null, FK -> `students.id`): Attending student.
  - `markedAt` (`DATE`, Not Null, default: `NOW`): Timestamp when attendance was marked.

---

### 4.2 Model Associations & Entity Relationships

Defined in `models/index.js`:

```javascript
// Teacher & Course
Teacher.hasMany(Course, { foreignKey: "teacherId" });
Course.belongsTo(Teacher, { foreignKey: "teacherId" });

// Teacher & Session
Teacher.hasMany(Session, { foreignKey: "teacherId" });
Session.belongsTo(Teacher, { foreignKey: "teacherId" });

// Course & Session
Course.hasMany(Session, { foreignKey: "courseId" });
Session.belongsTo(Course, { foreignKey: "courseId" });

// Course & Class (through CourseStats)
Course.belongsToMany(Class, { through: CourseStats, foreignKey: "courseId", otherKey: "classId" });
Class.belongsToMany(Course, { through: CourseStats, foreignKey: "classId", otherKey: "courseId" });
CourseStats.belongsTo(Course, { foreignKey: "courseId" });
CourseStats.belongsTo(Class, { foreignKey: "classId" });
Course.hasMany(CourseStats, { foreignKey: "courseId" });
Class.hasMany(CourseStats, { foreignKey: "classId" });

// Student & Course (through StudentCourses)
Student.belongsToMany(Course, { through: StudentCourses, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: StudentCourses, foreignKey: "courseId" });

// Student & Attendance
Student.hasMany(Attendance, { foreignKey: "studentId" });
Attendance.belongsTo(Student, { foreignKey: "studentId" });

// Session & Attendance
Session.hasMany(Attendance, { foreignKey: "sessionId" });
Attendance.belongsTo(Session, { foreignKey: "sessionId" });

// Session & Class (through SessionClass)
Session.belongsToMany(Class, { through: SessionClass, foreignKey: "sessionId", otherKey: "classId" });
Class.belongsToMany(Session, { through: SessionClass, foreignKey: "classId", otherKey: "sessionId" });

// Class & Student (Cohort)
Student.belongsTo(Class, { foreignKey: "classId", as: "class" });
Class.hasMany(Student, { foreignKey: "classId", as: "students" });
```

---

### 4.3 Entity-Relationship Diagram

```mermaid
erDiagram
    TEACHER ||--o{ COURSE : "teaches"
    TEACHER ||--o{ SESSION : "conducts"
    COURSE ||--o{ SESSION : "has"
    COURSE ||--o{ COURSE_STATS : "tracks"
    CLASS ||--o{ COURSE_STATS : "participates_in"
    CLASS ||--o{ STUDENT : "contains"
    SESSION ||--o{ SESSION_CLASS : "broadcasts_to"
    CLASS ||--o{ SESSION_CLASS : "attends"
    STUDENT ||--o{ ATTENDANCE : "marks"
    SESSION ||--o{ ATTENDANCE : "records"
    STUDENT ||--o{ STUDENT_COURSES : "enrolled_in"
    COURSE ||--o{ STUDENT_COURSES : "includes"

    TEACHER {
        uuid id PK
        string facultyId UK
        string firstName
        string lastName
        string email UK
        string department
        string passwordHash
        blob profilePic
    }

    STUDENT {
        uuid id PK
        string firstName
        string lastName
        string email UK
        int year
        int semester
        string MIS UK
        string department
        string branch
        uuid classId FK
        string passwordHash
        blob profilePic
    }

    CLASS {
        uuid id PK
        string name
        string code UK
        text description
    }

    COURSE {
        uuid id PK
        string name
        string code UK
        uuid teacherId FK
    }

    SESSION {
        uuid id PK
        uuid courseId FK
        uuid teacherId FK
        datetime startTime
        datetime endTime
        boolean active
    }

    ATTENDANCE {
        uuid id PK
        uuid sessionId FK
        uuid studentId FK
        datetime markedAt
    }

    COURSE_STATS {
        uuid id PK
        uuid courseId FK
        uuid classId FK
        int totalClasses
    }
```

---

## 🔒 Security & Authentication Middleware

### 5.1 JWT Bearer Authentication & Role-Based Access Control

The middleware in `middleware/authMiddleWare.js` provides route protection:

```javascript
const { auth } = require("../middleware/authMiddleWare");

// Require valid student token
router.post("/scan", auth(["student"]), handler);

// Require valid teacher token
router.get("/courses", auth(["teacher"]), handler);

// Allow any authenticated user
router.get("/profile", auth([]), handler);
```

#### Workflow:
1. Reads `req.headers.authorization`. If absent, returns `401 Unauthorized` (`"Missing Auth Header."`).
2. Extracts Bearer token (`authHeader.split(" ")[1]`).
3. Verifies token using `jwt.verify(token, process.env.JWT_SECRET)`. If expired or malformed, returns `401 Unauthorized` (`"Invalid or Expired Token."`).
4. If `roles` array is non-empty, checks if `roles.includes(decoded.role)`. If role does not match, returns `403 Forbidden` (`"Forbidden: Insufficient Role."`).
5. Injects `decoded` payload into `req.user` (`{ id, role, iat, exp }`) and invokes `next()`.

---

### 5.2 Password Hashing

- Implemented via `bcrypt.hash(password, 10)` during registration (`routes/auth.js:117`).
- Validated via `bcrypt.compare(password, user.passwordHash)` during login (`routes/auth.js:34`).

---

## 📡 Detailed API Reference

### 6.1 Health Check Route

#### `GET /health`
Public health probe to verify API uptime.

- **Request**: No headers or body required.
- **Response (200 OK)**:
  ```text
  OK
  ```

---

### 6.2 Authentication Routes (`/api/auth`)

#### 1. User Login
`POST /api/auth/login/`

Authenticates a Teacher or Student and generates a 12-hour JWT session token.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "faculty@iiitp.ac.in",
    "password": "Password123",
    "role": "teacher"
  }
  ```
  *(For student login: `"role": "student"`)*

- **Response (200 OK — Teacher)**:
  ```json
  {
    "success": true,
    "serverTime": 1725302400000,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "firstName": "John",
        "lastName": "Doe",
        "email": "faculty@iiitp.ac.in",
        "facultyId": "ID-A-017",
        "department": "Computer Science & Engineering",
        "profilePic": null,
        "role": "teacher"
      }
    }
  }
  ```

- **Response (200 OK — Student)**:
  ```json
  {
    "success": true,
    "serverTime": 1725302400000,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@students.iiitp.ac.in",
        "MIS": "112115042",
        "year": 3,
        "semester": 6,
        "department": "Computer Science & Engineering",
        "profilePic": null,
        "role": "student",
        "class": {
          "classId": "8f3b202a-3c12-4c22-85a0-0294e5e48320",
          "name": "CSE-A",
          "code": "CSE_DIV_A",
          "description": "3rd Year CSE Division A"
        }
      }
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Missing Credentials."}` or `{"success": false, "message": "Invalid Role."}`
  - `401 Unauthorized`: `{"success": false, "message": "User Not Found."}` or `{"success": false, "message": "Invalid Password."}`

---

#### 2. User Registration (Testing Endpoint)
`POST /api/auth/register`

- **Request Body (Teacher)**:
  ```json
  {
    "role": "teacher",
    "firstName": "John",
    "lastName": "Doe",
    "email": "faculty@iiitp.ac.in",
    "password": "Password123",
    "department": "Computer Science",
    "facultyId": "ID-A-017"
  }
  ```
- **Request Body (Student)**:
  ```json
  {
    "role": "student",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "student@iiitp.ac.in",
    "password": "Password123",
    "department": "Computer Science",
    "branch": "CSE",
    "MIS": "112115042",
    "year": 3,
    "semester": 6
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }
  ```

---

### 6.3 Teacher Session Routes (`/api/teacher/sessions`)

*All routes in this group require `Authorization: Bearer <token>` with `role: "teacher"`.*
*Router middleware automatically calls `cleanupExpiredSessions()` on every incoming request to deactivate past sessions and flush Redis attendance.*

#### 1. Fetch Teacher Courses
`GET /api/teacher/sessions/courses`

Returns all courses taught by the logged-in teacher and the classes mapped to each course, including total conducted lectures from `CourseStats`.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "courses": [
      {
        "id": "5285746b-871d-4eb4-b91c-8f4ba7750849",
        "name": "Database Management Systems",
        "code": "CS-302",
        "teacherId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "Classes": [
          {
            "id": "8f3b202a-3c12-4c22-85a0-0294e5e48320",
            "name": "CSE-A",
            "code": "CSE_DIV_A",
            "CourseStats": {
              "totalClasses": 14
            }
          }
        ]
      }
    ]
  }
  ```

---

#### 2. Start Attendance Session
`POST /api/teacher/sessions/start`

Creates a new lecture session, links permitted classes via `SessionClass`, increments `totalClasses` in `CourseStats`, and caches the session in Redis with TTL (`duration * 60 + 20` seconds).

- **Request Body**:
  ```json
  {
    "courseId": "5285746b-871d-4eb4-b91c-8f4ba7750849",
    "classIds": ["8f3b202a-3c12-4c22-85a0-0294e5e48320"],
    "duration": 3
  }
  ```
  *(duration in minutes; default is 3)*

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "session": {
      "id": "e64f8bf9-251c-43ad-8d96-c65089e5a1b3",
      "courseId": "5285746b-871d-4eb4-b91c-8f4ba7750849",
      "teacherId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "startTime": "2026-09-03T01:00:00.000Z",
      "endTime": "2026-09-03T01:03:00.000Z",
      "active": true
    }
  }
  ```

---

#### 3. Generate Rotating Dynamic QR Token
`GET /api/teacher/sessions/:sessionId/qr`

Generates a fresh 5-second QR JWT token with a unique UUIDv4 nonce, caches the nonce in Redis with a 7-second TTL, and encodes it into a Base64 PNG Data URL.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACt...",
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "validFrom": 1725302400000,
    "validTo": 1725302405000
  }
  ```
- **Error (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Session is inactive or has expired"
  }
  ```

---

#### 4. Live Attendance Stream (Redis Cache)
`GET /api/teacher/sessions/:sessionId/live`

Queries Redis set `liveAttendance:${sessionId}` and returns student information for all currently marked students.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "presentStudents": [
      {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "firstName": "Jane",
        "lastName": "Smith",
        "MIS": "112115042"
      }
    ]
  }
  ```

---

#### 5. Get All Session Students (Present & Absent Roster)
`GET /api/teacher/sessions/:sessionId/students`

Fetches all students in the classes linked to the session and compares with the `attendances` table to indicate whether each student is present or absent.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "students": [
      {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "firstName": "Jane",
        "lastName": "Smith",
        "MIS": "112115042",
        "department": "Computer Science",
        "branch": "CSE",
        "class": {
          "id": "8f3b202a-3c12-4c22-85a0-0294e5e48320",
          "name": "CSE-A",
          "code": "CSE_DIV_A"
        },
        "present": true
      }
    ]
  }
  ```

---

#### 6. Bulk Mark / Unmark Attendance (Manual Override)
`POST /api/teacher/sessions/:sessionId/mark`

Allows instructors to manually override attendance for specific students.

- **Request Body**:
  ```json
  {
    "marked": ["a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"],
    "unmarked": ["b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e"]
  }
  ```

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Attendance updated successfully",
    "summary": {
      "markedCount": 1,
      "unmarkedCount": 1,
      "marked": [
        {
          "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          "MIS": "112115042",
          "name": "Jane Smith"
        }
      ],
      "unmarked": [
        {
          "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
          "MIS": "112115043",
          "name": "Bob Taylor"
        }
      ]
    }
  }
  ```

---

#### 7. Extend Session Duration
`POST /api/teacher/sessions/:sessionId/extend`

Extends the session's scheduled end time in MySQL and updates the Redis active session TTL.

- **Request Body**:
  ```json
  {
    "extraMinutes": 5
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session extended",
    "newEnd": "2026-09-03T01:08:00.000Z"
  }
  ```

---

#### 8. End Session (Finalize & Flush)
`POST /api/teacher/sessions/:sessionId/end`

Closes an active session, marks `active: false`, flushes Redis live attendance records into MySQL `attendances`, and cleans up Redis session keys.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session closed successfully"
  }
  ```

---

### 6.4 Student Scan Routes (`/api/student`)

#### Mark Attendance via QR Scan
`POST /api/student/scan`

*Requires `Authorization: Bearer <token>` with `role: "student"`.*

- **Request Body**:
  ```json
  {
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "scannedAt": 1725302402150
  }
  ```
  *(Note: `scannedAt` is the client timestamp in milliseconds).*

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Attendance marked successfully",
    "sessionId": "e64f8bf9-251c-43ad-8d96-c65089e5a1b3",
    "sessionEndTime": 1725302580000
  }
  ```

- **Validation Failure Responses (400 / 403)**:
  - `400`: `{"success": false, "message": "qrToken and scannedAt are required"}`
  - `400`: `{"success": false, "message": "Invalid or expired QR token"}`
  - `400`: `{"success": false, "message": "Session is inactive or has expired"}`
  - `400`: `{"success": false, "message": "QR token session mismatch"}`
  - `400`: `{"success": false, "message": "QR scan time is outside the valid window"}`
  - `400`: `{"success": false, "message": "QR scan submission delayed beyond acceptable limit"}`
  - `400`: `{"success": false, "message": "Student class information missing"}`
  - `403`: `{"success": false, "message": "You are not part of the class for this session"}`

---

### 6.5 Reporting Routes (`/api/report` & `/api/teacher/report`)

#### 1. Student Personal Attendance Report
`GET /api/report/student/:studentId`

*Requires `Authorization: Bearer <token>` with `role: "student"`. Students can only request their own ID.*

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "attendance": [
      {
        "courseId": "5285746b-871d-4eb4-b91c-8f4ba7750849",
        "courseName": "Database Management Systems",
        "courseCode": "CS-302",
        "present": 12,
        "total": 14,
        "percentage": 85.71
      }
    ]
  }
  ```

---

#### 2. Session Attendance Report (Teacher)
`GET /api/report/session/:sessionId`

*Requires `Authorization: Bearer <token>` with `role: "teacher"`.*

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "sessionId": "e64f8bf9-251c-43ad-8d96-c65089e5a1b3",
    "course": {
      "id": "5285746b-871d-4eb4-b91c-8f4ba7750849",
      "name": "Database Management Systems",
      "code": "CS-302"
    },
    "students": [
      {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "firstName": "Jane",
        "lastName": "Smith",
        "MIS": "112115042",
        "department": "Computer Science",
        "present": true
      }
    ]
  }
  ```

---

#### 3. Master Teacher Attendance Report
`GET /api/teacher/report`

*Requires `Authorization: Bearer <token>` with `role: "teacher"`.*

Generates an aggregated hierarchy of courses taught by the teacher, the mapped classes, and every enrolled student's attendance records with computed percentages.

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "report": [
      {
        "courseId": "5285746b-871d-4eb4-b91c-8f4ba7750849",
        "courseName": "Database Management Systems",
        "courseCode": "CS-302",
        "classes": [
          {
            "classId": "8f3b202a-3c12-4c22-85a0-0294e5e48320",
            "className": "CSE-A",
            "classCode": "CSE_DIV_A",
            "totalClasses": 14,
            "students": [
              {
                "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                "firstName": "Jane",
                "lastName": "Smith",
                "MIS": "112115042",
                "department": "Computer Science",
                "branch": "CSE",
                "present": 12,
                "total": 14,
                "percentage": 85.71
              }
            ]
          }
        ]
      }
    ]
  }
  ```

---

## 🛡 Anti-Spam, Time Synchronization & QR Security Mechanics

The SAS backend applies strict cryptographic and temporal checks to prevent proxy attendance and screenshot distribution:

1. **5-Second Dynamic QR Token Rotation**:
   - The teacher client requests a fresh token every 2 to 3 seconds.
   - The token contains a random UUIDv4 `nonce`, `iat` (issued at), and `exp` (`iat + 5s`).
   - The nonce is cached in Redis with a 7-second expiration (`EX 7`).

2. **Temporal Window Validation**:
   When `/api/student/scan` receives `scannedAt`:
   - `CLOCK_SKEW_MS` = 5,000 ms (allows backward time drift)
   - `LATE_WINDOW_MS` = 5,000 ms (allows late scan tolerance)
   - `MAX_DELAY_MS` = 5,000 ms (limits transport delay)
   - Condition 1: `clientScannedAt >= (token.iat * 1000 - CLOCK_SKEW_MS)`
   - Condition 2: `clientScannedAt <= (token.exp * 1000 + LATE_WINDOW_MS)`
   - Condition 3: `Date.now() - clientScannedAt <= MAX_DELAY_MS`

3. **Class Roster Enclosure**:
   - The student's assigned `classId` is queried from MySQL.
   - The active session's permitted class IDs are retrieved from `SessionClass`.
   - If the student's `classId` is not in `allowedClassIds`, the request is rejected with `403 Forbidden` (`"You are not part of the class for this session"`).

4. **Idempotency & Live Deduplication**:
   - Attendance is written via `Attendance.findOrCreate({ where: { sessionId, studentId } })`.
   - The student ID is added to the Redis set `liveAttendance:${sessionId}`, which naturally deduplicates duplicate entries.

---

## 🔧 Troubleshooting & FAQ

### Q1: `MYSQL ERROR: SequelizeConnectionRefusedError`
- **Cause**: MySQL server is not running or listening on `MYSQL_HOST:MYSQL_PORT`.
- **Fix**: Start your MySQL service:
  ```bash
  # Windows Services:
  net start MySQL80
  # Linux:
  sudo systemctl start mysql
  ```

### Q2: `Redis connection error: ECONNREFUSED 127.0.0.1:6379`
- **Cause**: Redis server is inactive.
- **Fix**: Start Redis locally via `redis-server` or verify your `REDIS_URL` connection string in `.env`.

### Q3: `Model sync failed: ER_ACCESS_DENIED_ERROR`
- **Cause**: Incorrect `MYSQL_USER` or `MYSQL_PASSWORD` specified in `.env`.
- **Fix**: Test login directly in the command line: `mysql -u <user> -p` using the same credentials configured in `.env`.

### Q4: CORS errors when calling API from frontend
- **Cause**: Client domain blocked.
- **Fix**: `server.js` includes `app.use(cors())`, which permits all origins by default. Ensure your frontend sends requests to the correct backend host and port (e.g. `http://localhost:3000`).

---

*Documentation maintained for the IIIT Pune Student Attendance System Backend API.*
