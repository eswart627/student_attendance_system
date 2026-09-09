# Student Attendance System (SAS) — Teacher Web App Documentation

A modern web application built with React 19, Vite 7, and Tailwind CSS v4 designed for instructors at **IIIT Pune** to launch real-time attendance sessions, broadcast dynamic anti-proxy QR codes, monitor live student check-ins, perform post-session manual overrides, and inspect comprehensive academic attendance reports.

---

## 📑 Table of Contents
1. [Getting Started: Initializing & Running Locally](#-getting-started-initializing--running-locally)
   - [1.1 System Prerequisites](#11-system-prerequisites)
   - [1.2 Step-by-Step Installation & Setup](#12-step-by-step-installation--setup)
   - [1.3 Connecting to the Backend API](#13-connecting-to-the-backend-api)
   - [1.4 Running the Development Server](#14-running-the-development-server)
   - [1.5 Building for Production & Preview](#15-building-for-production--preview)
   - [1.6 Code Quality & Linting](#16-code-quality--linting)
2. [Architecture & Technology Stack](#-architecture--technology-stack)
   - [2.1 Technology Matrix](#21-technology-matrix)
   - [2.2 High-Level Architecture Diagram](#22-high-level-architecture-diagram)
3. [Codebase Structure & Directory Map](#-codebase-structure--directory-map)
4. [State Management & Server Time Synchronization](#-state-management--server-time-synchronization)
   - [4.1 AuthContext & Local Storage Persistence](#41-authcontext--local-storage-persistence)
   - [4.2 Clock Offset Synchronization Engine](#42-clock-offset-synchronization-engine)
5. [Routing & Navigation Guards](#-routing--navigation-guards)
   - [5.1 Route Definitions](#51-route-definitions)
   - [5.2 ProtectedRoute Guard](#52-protectedroute-guard)
6. [Layout & Shared UI Components](#-layout--shared-ui-components)
   - [6.1 DashboardLayout Shell](#61-dashboardlayout-shell)
   - [6.2 Collapsible Sidebar Navigation](#62-collapsible-sidebar-navigation)
   - [6.3 HeaderBar & FooterBar](#63-headerbar--footerbar)
   - [6.4 Base UI Component Library](#64-base-ui-component-library)
7. [Screens & User Workflows Deep Dive](#-screens--user-workflows-deep-dive)
   - [7.1 LoginPage](#71-loginpage)
   - [7.2 HomePage (Teacher Dashboard & Session Launcher)](#72-homepage-teacher-dashboard--session-launcher)
   - [7.3 SessionPage (Dynamic QR Broadcast & Live Roster)](#73-sessionpage-dynamic-qr-broadcast--live-roster)
   - [7.4 SessionReviewPage (Post-Session Overrides & Verification)](#74-sessionreviewpage-post-session-overrides--verification)
   - [7.5 ReportPage (Hierarchical Analytics & Student Metrics)](#75-reportpage-hierarchical-analytics--student-metrics)
8. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🚀 Getting Started: Initializing & Running Locally

### 1.1 System Prerequisites

Ensure your workstation meets the following minimum requirements:

| Tool | Recommended Version | Verification Command | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.x` (Tested on `v22.x` / `v24.x`) | `node -v` | JavaScript runtime environment |
| **npm** | `>= 9.x` (Tested on `11.x`) | `npm -v` | Node package manager |
| **Modern Browser** | Chrome, Edge, Firefox, Safari | — | Requires ES2022+ & CSS Grid support |

---

### 1.2 Step-by-Step Installation & Setup

```bash
# Step 1: Clone the repository (if not already cloned)
git clone https://github.com/<your-username>/sas.git
cd sas

# Step 2: Navigate to the teacher web app directory
cd teacher_app

# Step 3: Install dependencies
npm install
```

---

### 1.3 Connecting to the Backend API

The Axios client instance is configured in `src/lib/axios.js`.

```javascript
// src/lib/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://student-attendance-system-kr95.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
```

#### Option A: Use the Live Production/Staging Backend (Default)
By default, `api` points to the hosted Render backend (`https://student-attendance-system-kr95.onrender.com/api`). If you have internet access, **no configuration changes are needed**.

#### Option B: Connect to a Local Backend Server
If your Express API backend is running locally on port `3000`:
1. Open `src/lib/axios.js`.
2. Update `baseURL`:
   ```javascript
   const api = axios.create({
     baseURL: "http://localhost:3000/api",
     headers: { "Content-Type": "application/json" },
   });
   ```

---

### 1.4 Running the Development Server

Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Output:
```text
  VITE v7.2.2  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser and navigate to `http://localhost:5173`.

---

### 1.5 Building for Production & Preview

To generate an optimized production bundle:

```bash
# Compile and bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

### 1.6 Code Quality & Linting

Run ESLint across the codebase:

```bash
npm run lint
```

---

## 🏛 Architecture & Technology Stack

### 2.1 Technology Matrix

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **UI Framework** | React | `^19.2.0` | Declarative component UI library with React Hooks & Strict Mode |
| **Build Tool** | Vite | `^7.2.2` | Lightning-fast build tool and development server |
| **Routing** | React Router DOM | `^7.9.6` | Client-side routing with route protection guards |
| **Styling** | Tailwind CSS | `^4.1.17` | Utility-first CSS framework integrated via `@tailwindcss/vite` |
| **Icons** | Lucide React | `^0.553.0` | Scalable modern icon set |
| **UI Primitives** | Radix UI | `^1.1.x` | Accessible primitives (`@radix-ui/react-avatar`, `@radix-ui/react-slot`) |
| **HTTP Client** | Axios | `^1.13.2` | Promise-based HTTP client for REST API communication |
| **QR Rendering** | qrcode.react | `^4.2.0` | React component for rendering client-side QR codes |
| **Styling Utilities** | clsx / tailwind-merge | `^2.1.1` / `^3.4.0` | Utility class merging and conditional styling |

---

### 2.2 High-Level Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TEACHER WEB APP ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │         main.jsx          │
                         │    (AuthProvider Root)    │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       AppRouter.jsx       │
                         └─────────────┬─────────────┘
                                       │
             ┌─────────────────────────┴─────────────────────────┐
             │ [Unauthenticated]                                 │ [Authenticated]
             ▼                                                   ▼
  ┌─────────────────────┐                            ┌─────────────────────┐
  │      LoginPage      │                            │   ProtectedRoute    │
  │  - Email & Password │                            └──────────┬──────────┘
  │  - Role: 'teacher'  │                                       │
  │  - Sets Clock Offset│                                       ▼
  └──────────┬──────────┘                            ┌─────────────────────┐
             │                                       │   DashboardLayout   │
             │                                       │ (Header, Side, Foot)│
             │                                       └──────────┬──────────┘
             │                                                  │
             │                     ┌────────────────────────────┼────────────────────────────┐
             │                     ▼                            ▼                            ▼
             │              ┌──────────────┐             ┌──────────────┐             ┌──────────────┐
             │              │   HomePage   │             │ SessionPage  │             │  ReportPage  │
             │              │ - Courses    │             │ - Dynamic QR │             │ - Hierarchy  │
             │              │ - Classes    │             │ - Live Roster│             │ - Filters    │
             │              │ - Start Sess │             │ - Ext/End    │             │ - Analytics  │
             │              └──────────────┘             └──────┬───────┘             └──────────────┘
             │                                                  │
             │                                                  ▼
             │                                       ┌──────────────────────┐
             │                                       │  SessionReviewPage   │
             │                                       │ - Manual Overrides   │
             │                                       │ - Bulk Select/Save   │
             │                                       └──────────────────────┘
             └─────────────────────────┬────────────────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │        AXIOS CLIENT       │
                         │     (src/lib/axios.js)    │
                         └─────────────┬─────────────┘
                                       │ (Bearer JWT / JSON)
                                       ▼
                         ┌───────────────────────────┐
                         │     BACKEND REST API      │
                         │   /api/teacher/...        │
                         └───────────────────────────┘
```

---

## 📂 Codebase Structure & Directory Map

```text
teacher_app/
├── index.html                   # HTML entrypoint with viewport & title
├── package.json                 # Dependencies & build scripts
├── vite.config.js               # Vite config with React plugin & path alias (@ -> src)
├── eslint.config.js             # ESLint flat configuration
├── components.json              # Radix/UI component configuration
│
└── src/
    ├── App.jsx                  # Root App component mounting AppRouter
    ├── main.jsx                 # Entrypoint wrapping App with AuthProvider
    ├── index.css                # Global stylesheet & Tailwind CSS imports
    │
    ├── components/              # Shared structural UI components
    │   ├── FooterBar.jsx        # Institutional copyright footer
    │   ├── HeaderBar.jsx        # Navigation bar with user avatar & faculty badge
    │   ├── Sidebar.jsx          # Collapsible navigation drawer with route links
    │   └── ui/                  # Atom UI primitives
    │       ├── avatar.jsx       # Radix Avatar & AvatarFallback wrappers
    │       ├── button.jsx       # Variant-driven Button component (CVA)
    │       ├── card.jsx         # Card, CardHeader, CardTitle, CardContent
    │       └── input.jsx        # Standardized form input field
    │
    ├── context/
    │   └── AuthContext.jsx      # Authentication, user session & clock offset context
    │
    ├── layout/
    │   └── DashboardLayout.jsx  # Layout shell integrating Sidebar, HeaderBar, and Main
    │
    ├── lib/
    │   ├── axios.js             # Configured Axios instance with base URL
    │   └── utils.js             # cn() styling helper combining clsx & tailwind-merge
    │
    ├── pages/                   # Application views
    │   ├── Home/
    │   │   └── HomePage.jsx     # Teacher dashboard, course catalog & session creator
    │   ├── Login/
    │   │   └── LoginPage.jsx    # Authentication view with credentials form
    │   ├── SessionPage.jsx      # Active session viewer with dynamic QR & live stream
    │   ├── SessionReviewPage.jsx# Post-session attendance verification & manual override
    │   └── ReportPage.jsx       # Master attendance analytics, threshold filters & search
    │
    └── router/
        ├── AppRouter.jsx        # BrowserRouter route configuration
        └── ProtectedRoute.jsx   # Route guard enforcing active auth token
```

---

## ⏱ State Management & Server Time Synchronization

### 4.1 AuthContext & Local Storage Persistence

Implemented in `src/context/AuthContext.jsx`:

```javascript
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [offset, setOffset] = useState(0);

  // Restore session from localStorage on initial load / refresh
  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setToken(parsed.token);
      setOffset(parsed.offset);
    }
  }, []);

  const login = (userData, tokenData, serverTimeData) => {
    const clientNow = Date.now();
    const offset = serverTimeData - clientNow;
    setUser(userData);
    setToken(tokenData);
    setOffset(offset);

    localStorage.setItem(
      "auth",
      JSON.stringify({ user: userData, token: tokenData, offset })
    );
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
    setOffset(0);
  };
  ...
}
```

---

### 4.2 Clock Offset Synchronization Engine

Because dynamic attendance QR codes rotate every 5 seconds and expire quickly, any clock skew between the teacher's computer and the backend server could result in premature expiration or invalidation.

1. **Offset Calculation**: During login, the backend returns its exact timestamp: `serverTime: Date.now()`.
2. The client calculates the delta:
   $$\text{offset} = \text{serverTime} - \text{Date.now()}_{\text{client}}$$
3. **Synchronized Clocks**: Throughout `HomePage` and `SessionPage`, true server time is continuously computed:
   $$\text{Current Server Time} = \text{Date.now()} + \text{offset}$$
4. This ensures that live countdowns, QR generation schedules, and session durations remain accurate regardless of client device time settings.

---

## 🧭 Routing & Navigation Guards

### 5.1 Route Definitions

Configured in `src/router/AppRouter.jsx`:

| Path | Component | Guarded | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `LoginPage` | No | Faculty credentials login form |
| `/home` | `HomePage` | **Yes** (`<ProtectedRoute>`) | Dashboard, course selector, and session launcher |
| `/session/:sessionId` | `SessionPage` | Contextual | Live dynamic QR broadcast and student attendance stream |
| `/session/:sessionId/review` | `SessionReviewPage` | Contextual | Post-session student roster verification and override editor |
| `/report` | `ReportPage` | Contextual | Comprehensive course and class attendance analytics |

---

### 5.2 ProtectedRoute Guard

Implemented in `src/router/ProtectedRoute.jsx`:

```javascript
export default function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

If the user does not possess an active JWT token in `AuthContext` or `localStorage`, they are immediately redirected to the `/` login screen.

---

## 🎨 Layout & Shared UI Components

### 6.1 DashboardLayout Shell

Located in `src/layout/DashboardLayout.jsx`, this component coordinates the application layout:
- Renders `HeaderBar` at the top with user info.
- Mounts the collapsible `Sidebar` on the left.
- Injects `children` in a responsive main content wrapper with smooth transitions adjusting to sidebar expansion.
- Appends `FooterBar` at the bottom.

---

### 6.2 Collapsible Sidebar Navigation

Located in `src/components/Sidebar.jsx`:
- **State**: Toggles between expanded width (`w-64`) and compact collapsed icon-only mode (`w-16`).
- **Aesthetic**: Deep slate dark teal (`#172d38`) background accented with geometric circular line art.
- **Nav Links**:
  - **Dashboard**: Points to `/home` (Icon: `LayoutDashboard`).
  - **Attendance Report**: Points to `/report` (Icon: `ClipboardList`).
- **Active State Indicator**: Highlights the currently active route with golden sand (`#9a804f`) and sage indicators.
- **Logout Action**: Calls `logout()` from `AuthContext` and navigates back to `/`.

---

### 6.3 HeaderBar & FooterBar

- **`HeaderBar.jsx`**:
  - Displays a hamburger toggle button for the sidebar.
  - Features the faculty avatar circle with dynamic name initials (e.g. `"JD"`).
  - Displays the teacher's full name, institutional email, and department pill.
- **`FooterBar.jsx`**:
  - Displays institutional credits: *"IIIT Pune — Student Attendance System (SAS)"*.

---

### 6.4 Base UI Component Library

Located in `src/components/ui/`:
- **`button.jsx`**: Accessible button supporting variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and sizes (`default`, `sm`, `lg`, `icon`) configured via `class-variance-authority`.
- **`card.jsx`**: Composable surface container (`Card`, `CardHeader`, `CardTitle`, `CardContent`).
- **`avatar.jsx`**: Image container with fallback initial generator.
- **`input.jsx`**: Clean form input component styled with Tailwind utilities.

---

## 🖥 Screens & User Workflows Deep Dive

### 7.1 LoginPage

- **Path**: `src/pages/Login/LoginPage.jsx`
- **Route**: `/`
- **Workflow**:
  1. Instructor inputs their institutional email and password.
  2. Submits payload with `"role": "teacher"` to `POST /api/auth/login/`.
  3. Displays an inline error alert banner if authentication fails (e.g., *"Invalid Password."* or *"User Not Found."*).
  4. Upon `200 OK`:
     - Invokes `login(data.user, data.token, serverTime)`.
     - Persists token, user profile, and clock offset.
     - Navigates immediately to `/home`.

---

### 7.2 HomePage (Teacher Dashboard & Session Launcher)

- **Path**: `src/pages/Home/HomePage.jsx`
- **Route**: `/home`
- **Features**:
  - **Live Synchronized Clock**: Shows digital time updating every second using the calibrated `offset`.
  - **Faculty Overview Card**: Shows teacher name, email, department, faculty ID, total courses, and total classes.
  - **Course Selector**:
    - Queries `GET /api/teacher/sessions/courses`.
    - Renders course cards showing course name, course code, and enrolled classes count.
    - Clicking a course selects it as the active lecture subject.
  - **Class Multi-Selector**:
    - When a course is selected, renders toggle buttons for all classes associated with that course (from `CourseStats`).
    - Instructors can select one or multiple classes (e.g., joint lecture for `CSE-A` and `CSE-B`).
  - **Duration Selector**:
    - Allows choosing session duration (options: 1, 3, 5, 10, 15, 30, 45, 60 minutes; default: 3 minutes).
  - **Session Launch Action**:
    - Submits `{ courseId, classIds, duration }` to `POST /api/teacher/sessions/start`.
    - On success, navigates to `/session/:sessionId` with session state.

---

### 7.3 SessionPage (Dynamic QR Broadcast & Live Roster)

- **Path**: `src/pages/SessionPage.jsx`
- **Route**: `/session/:sessionId`
- **Features**:
  - **Rotating QR Code Stream**:
    - Polling interval runs every **2.5 seconds** requesting `GET /api/teacher/sessions/:sessionId/qr`.
    - Displays the rotating QR image returned by the server.
    - Renders a circular progress indicator showing the 5-second validity lifetime of the active QR token.
  - **Session Expiration Countdown**:
    - Computes remaining session time: `sessionEndTime - (Date.now() + offset)`.
    - Formats remaining time into a prominent `MM:SS` countdown timer.
    - When remaining time reaches 0, automatically halts QR polling and marks the session ended.
  - **Live Attendance Feed**:
    - Polls `GET /api/teacher/sessions/:sessionId/live` every **2.5 seconds** to fetch newly marked students from Redis.
    - Sorts students alphabetically and by numerical MIS.
    - Automatically scrolls the live attendance list smoothly down as students check in.
    - Displays real-time present count badge.
  - **Extend Session**:
    - Opens a quick extension selector (`+1 min`, `+5 min`, `+10 min`).
    - Submits to `POST /api/teacher/sessions/:sessionId/extend`.
    - Updates local session end time and displays confirmation toast.
  - **End Session**:
    - Instructor clicks "End Session".
    - Displays confirmation dialog.
    - On confirmation, calls `POST /api/teacher/sessions/:sessionId/end`.
    - Navigates immediately to `/session/:sessionId/review` for final verification.

---

### 7.4 SessionReviewPage (Post-Session Overrides & Verification)

- **Path**: `src/pages/SessionReviewPage.jsx`
- **Route**: `/session/:sessionId/review`
- **Features**:
  - **Student Roster Ingestion**:
    - Queries `GET /api/teacher/sessions/:sessionId/students`.
    - Loads all students across the classes attached to this session.
    - Preserves an immutable snapshot of original attendance state (`originalPresent`).
  - **Summary Metrics Header**:
    - Displays total enrolled students, total marked present, and total marked absent.
  - **Interactive Manual Override**:
    - Instructors can click any student row to manually flip their status (Absent $\leftrightarrow$ Present).
    - Rows with manual overrides are visually highlighted with modified status badges.
  - **Bulk Actions**:
    - "Select All": Temporarily marks all students as present.
    - "Deselect All": Resets or clears attendance.
  - **Override Persistence**:
    - Clicking "Save Changes" calculates the exact diff:
      - `marked`: Array of student IDs that were changed from absent to present.
      - `unmarked`: Array of student IDs that were changed from present to absent.
    - Submits `{ marked, unmarked }` to `POST /api/teacher/sessions/:sessionId/mark`.
    - Shows confirmation feedback and locks in the new attendance records.
  - **Navigation Links**: Direct buttons to return to Dashboard (`/home`) or view master Attendance Reports (`/report`).

---

### 7.5 ReportPage (Hierarchical Analytics & Student Metrics)

- **Path**: `src/pages/ReportPage.jsx`
- **Route**: `/report`
- **Features**:
  - **Master Report Loading**:
    - Queries `GET /api/teacher/report`.
    - Loads hierarchical data: `Course -> Class -> Students[]`.
  - **Dual-Tier Navigation**:
    - **Step 1: Course Selector Tabs**: Allows switching between courses taught by the instructor.
    - **Step 2: Class Selector Tabs**: Displays classes mapped to the chosen course.
  - **Analytics KPI Cards**:
    - **Total Students**: Total enrollment in selected class.
    - **Conducted Lectures**: Number of total sessions held (`totalClasses`).
    - **Average Attendance**: Class-wide mean percentage.
    - **Students Below 75%**: Total count of students falling under mandatory attendance threshold.
  - **Smart Filtering System**:
    - Quick filter buttons:
      - **All**: View all students.
      - **Below 75%**: Highlights students at risk of attendance shortage.
      - **Critical (<60%)**: Highlights severe defaulters.
    - **Custom Percentage Input**: Type any custom threshold (e.g. `< 50%` or `< 80%`).
    - **Live Search**: Instant keyword search matching student first name, last name, or MIS number.
  - **Multi-Column Sorting**:
    - Sortable by **Student Name** (A-Z / Z-A).
    - Sortable by **MIS Roll Number** (Ascending / Descending).
    - Sortable by **Attendance Percentage** (Lowest First / Highest First).
  - **Detailed Student Breakdown Table**:
    - Student name, MIS, branch, attended classes count, total classes count, visual progress bar, and status pill:
      - `Green (≥ 75%)`: Good standing.
      - `Amber (60% – 74.9%)`: Warning.
      - `Red (< 60%)`: Critical shortage.

---

## 🔧 Troubleshooting & FAQ

### Q1: The web app shows "Network Error" when attempting to log in
- **Cause**: The backend server is unreachable.
- **Fix**:
  1. Check if the Render instance is waking up from idle (free instances take ~30 seconds on cold start).
  2. If running locally, ensure backend is running at `http://localhost:3000` and `src/lib/axios.js` is set to `http://localhost:3000/api`.

### Q2: Dynamic QR code does not rotate or displays an error
- **Cause**: The active session has ended, or Redis is disconnected on the backend.
- **Fix**: Verify that Redis is active on the backend. If the session expired, return to `/home` and launch a new session.

### Q3: Student live check-ins are not showing on SessionPage
- **Cause**: The student is scanning a QR code for a class they are not enrolled in, or the student scan request was rejected by temporal validation.
- **Fix**:
  1. Verify the student belongs to the class selected when launching the session.
  2. Verify that the student's mobile device clock is synchronized.

### Q4: Clearing login session or logging out
- **Fix**: Click the "Logout" option in the left Sidebar, or run in the browser console:
  ```javascript
  localStorage.removeItem("auth");
  window.location.href = "/";
  ```

---

*Documentation maintained for the IIIT Pune Student Attendance System Teacher Web App.*
