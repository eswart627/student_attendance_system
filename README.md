# Student Attendance System (SAS) — IIIT Pune

A comprehensive, end-to-end academic attendance tracking platform built for **IIIT Pune**, combining real-time dynamic anti-proxy QR code rotation, automated time-drift validation, live in-memory roster streaming, post-session manual verification, and student mobile scanning.

---

## 🏛 Ecosystem Overview

The system consists of three specialized subprojects in this repository:

```text
sas/
├── backend_api/     # Node.js + Express 5 + Sequelize (MySQL) + Redis backend API
├── teacher_app/     # React 19 + Vite 7 + Tailwind CSS v4 web app for instructors
└── student_app/     # React Native 0.77 + Vision Camera Android app for students
```

| Component | Target Platform | Tech Stack | Documentation |
| :--- | :--- | :--- | :--- |
| **Backend API** (`backend_api`) | Server / Cloud (Render) | Node.js, Express 5, Sequelize, MySQL, Redis, JWT, bcrypt | [Backend Documentation](backend_api/documentation.md) |
| **Teacher Web App** (`teacher_app`) | Desktop / Browser | React 19, Vite 7, Tailwind CSS v4, Radix UI, Axios | [Teacher Web App Documentation](teacher_app/documentation.md) |
| **Student Mobile App** (`student_app`) | Android | React Native 0.77, Vision Camera, TypeScript, New Architecture | [Student Mobile App Documentation](student_app/documentation.md) |

---

## 🚀 Quickstart: How to Initialize and Run the Entire Project

### Step 1: Start the Backend API

1. Navigate to `backend_api/` and install dependencies:
   ```bash
   cd backend_api
   npm install
   ```
2. Create your `.env` file (refer to [Backend Environment Setup](backend_api/documentation.md#12-environment-variables-configuration-env)):
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   QR_JWT_SECRET=your_qr_jwt_secret_key
   MYSQL_DATABASE=student_attendance_system
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   REDIS_URL=redis://localhost:6379
   ```
3. Start the backend:
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

---

### Step 2: Start the Teacher Web Application

1. Open a new terminal and navigate to `teacher_app/`:
   ```bash
   cd teacher_app
   npm install
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```
3. Open `http://localhost:5173` in your browser. (To point to your local backend, ensure `src/lib/axios.js` is set to `http://localhost:3000/api`).

---

### Step 3: Run the Student Android Mobile Application

1. Open a new terminal and navigate to `student_app/`:
   ```bash
   cd student_app
   npm install
   ```
2. Connect your Android device via USB (with USB Debugging enabled) and forward port `3000`:
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```
3. In `student_app/src/services/api.ts`, ensure `API_BASE_URL` points to `http://127.0.0.1:3000/api` for local testing (or leave default to test against deployed Render cloud).
4. Launch Metro bundler and deploy the Android app:
   ```bash
   npm start
   # In another terminal:
   npm run android
   ```

---

## 📖 In-Depth Project Documentation

Detailed architectural deep-dives, database schemas, API specs, anti-spam mechanisms, and screen guides are organized within each subproject:

- 📘 **[Backend API Documentation](backend_api/documentation.md)**
- 💻 **[Teacher Web Application Documentation](teacher_app/documentation.md)**
- 📱 **[Student Android Mobile App Documentation](student_app/documentation.md)**
