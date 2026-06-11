# FlowBoard

> A web-based collaborative workspace and task organizer built for Agile Scrum teams.

FlowBoard helps teams manage projects, track tasks, monitor progress, and collaborate efficiently through a clean Kanban-style interface. Built as part of the ISD (Information Systems Development) course.

---

## Team

| Roll | Name | Role |
|------|------|------|
| 2207037 | Ajoy | Scrum Master |
| 2207052 | Suhita Islam Aurthi | Backend Developer |
| 2207034 | Fariha | Frontend Developer |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite) |
| Backend | Laravel (PHP) |
| Database | Oracle |
| Auth | Laravel Sanctum (token-based) |
| Version Control | Git / GitHub |
| Project Tracking | Jira (Scrum board) |

---

## Features

- ✅ User registration, login, logout
- ✅ Password reset via email
- ✅ Personal dashboard with active projects and recent tasks
- ✅ Workspace creation and management
- ✅ Kanban task board (To Do / In Progress / Done)
- ✅ Activity log per workspace
- 🔲 Task assignment to team members
- 🔲 Deadlines and priority levels on tasks
- 🔲 Notes system per workspace
- 🔲 Team member invite and removal
- 🔲 Activity log date filtering

---

## Project Structure

```
FlowBoard/
├── backend/                  # Laravel PHP backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── WorkspaceController.php
│   │   │   ├── TaskController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── DashboardController.php
│   │   │   └── ActivityLogController.php
│   │   └── Models/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/                 # React.js frontend
│   └── src/
│       ├── components/
│       │   ├── Login.jsx
│       │   ├── RegistrationForm.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DashboardLayout.jsx
│       │   ├── TaskBoard.jsx
│       │   ├── Workspace.jsx
│       │   └── ActivityLog.jsx
│       ├── lib/api.js
│       └── App.jsx
└── README.md
```

---

## Getting Started

### Prerequisites

- PHP >= 8.1
- Composer
- Node.js >= 18
- Oracle Database
- Oracle PDO driver for PHP

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
# Configure your Oracle DB credentials in .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the Laravel backend at `http://localhost:8000`.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register a new user |
| POST | /api/login | Login and receive token |
| POST | /api/logout | Invalidate session token |
| POST | /api/forgot-password | Send password reset email |
| POST | /api/reset-password | Reset password with token |
| GET | /api/workspaces | List user workspaces |
| POST | /api/workspaces | Create new workspace |
| GET | /api/workspaces/{id} | Get workspace details |
| PUT | /api/workspaces/{id} | Update workspace |
| DELETE | /api/workspaces/{id} | Delete workspace |
| POST | /api/workspaces/{id}/members | Add member by email |
| DELETE | /api/workspaces/{id}/members/{userId} | Remove member |
| GET | /api/tasks | Get tasks |
| POST | /api/tasks | Create a task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| GET | /api/workspaces/{id}/activity-logs | Get activity logs |

All protected routes require `Authorization: Bearer {token}` header.

---

## Branch Structure

```
main                    ← production-ready
└── Dev                 ← integration branch
     ├── feature/SCRUM-XX-*   ← feature branches per story
```

**Rules:**
- Never commit directly to `main` or `Dev`
- Branch from `Dev` for every feature
- Commit format: `SCRUM-XX: brief description`
- Open a PR to `Dev` when done — never self-merge

---

## Database Schema

| Table | Purpose |
|-------|---------|
| users | Registered users |
| workspaces | Project workspaces |
| workspace_user | Team membership (pivot) |
| projects | Projects within workspaces |
| tasks | Kanban tasks |
| activity_logs | Workspace event tracking |
| password_reset_tokens | Password reset flow |

---

## Links

- 🗂 [Jira Board](https://ajoysaha.atlassian.net/jira/software/projects/SCRUM/boards)
- 📄 [Confluence Docs](https://ajoysaha.atlassian.net/wiki/spaces/FD)
