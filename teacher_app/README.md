# Student Attendance System — Teacher Web App

A modern web application built with React 19, Vite 7, and Tailwind CSS v4 for instructors at IIIT Pune to manage real-time attendance sessions, broadcast rotating QR codes, and monitor attendance analytics.

## Quickstart: How to Initialize & Run

### 1. Prerequisites
- **Node.js**: `>= 18.x` (Tested on `v22.x` / `v24.x`)
- **npm**: `>= 9.x`

### 2. Install Dependencies
```bash
cd teacher_app
npm install
```

### 3. Backend API Connection
The app connects to the API via `src/lib/axios.js`.
- By default, it points to the deployed Render backend:
  `https://student-attendance-system-kr95.onrender.com/api`
- To run against a local backend, edit `src/lib/axios.js` and set:
  `baseURL: "http://localhost:3000/api"`

### 4. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 📖 Complete Documentation
For detailed architecture, state management & server time synchronization, routing guards, complete component breakdown, and screen workflows, please see:

👉 **[Complete Teacher Web App Documentation](documentation.md)**
