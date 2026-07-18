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
| Frontend | React 18 (Vite) |
| Backend | Laravel 12 (PHP) |
| Database | SQLite (development) / Oracle (production) |
| Auth | Laravel Sanctum (token-based) |
| Version Control | Git / GitHub |
| Project Tracking | Jira (Scrum board) |

---

## Features

- ✅ User registration, login, logout
- ✅ Password reset via email
- ✅ Personal dashboard with workspaces, deadline-sorted tasks, and recent tasks
- ✅ Workspace creation and management
- ✅ Kanban task board (To Do / In Progress / Review / Done)
- ✅ Task assignment, priorities, and deadlines
- ✅ Workspace member invitations (send / accept / decline / revoke)
- ✅ Project management with project invitations
- ✅ Workspace notes with autosave
- ✅ Activity log per workspace (task created/moved/completed, member joined, project and note creation) with date filtering

---

## Project Structure

```
FlowBoard/
├── backend/                  # Laravel PHP backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── WorkspaceController.php
│   │   │   ├── WorkspaceInvitationController.php
│   │   │   ├── TaskController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── ProjectInvitationController.php
│   │   │   ├── NoteController.php
│   │   │   └── ActivityLogController.php
│   │   └── Models/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/                 # React frontend
│   └── src/
│       ├── components/
│       │   ├── Login.jsx
│       │   ├── RegistrationForm.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DashboardLayout.jsx
│       │   ├── TaskBoard.jsx
│       │   ├── Workspace.jsx
│       │   ├── NotesEditor.jsx
│       │   └── ActivityLog.jsx
│       ├── lib/api.js        # API client (all backend calls)
│       ├── App.jsx           # Router / auth shell
│       └── App.css           # Shared design tokens & primitives
└── README.md
```

---

## Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # SQLite is the default for local development
php artisan migrate
php artisan serve                # http://127.0.0.1:8000
```

> **Using Oracle instead:** set `DB_CONNECTION=oracle` plus the `DB_HOST` /
> `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` values in `.env`
> (requires the Oracle PDO driver), then run `php artisan migrate`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

The frontend calls the Laravel API at `http://127.0.0.1:8000/api` by default.
Override with `VITE_API_BASE_URL` in `frontend/.env` if your backend runs elsewhere.

---

## API Overview

All protected routes require an `Authorization: Bearer {token}` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register a new user |
| POST | /api/login | Login and receive token |
| POST | /api/logout | Invalidate current token |
| GET | /api/user | Current user profile |
| POST | /api/forgot-password | Send password reset email |
| POST | /api/reset-password | Reset password with token |

### Dashboard & Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Active projects, recent tasks, deadline-sorted tasks |
| GET | /api/workspaces | List user workspaces |
| POST | /api/workspaces | Create workspace |
| GET | /api/workspaces/{id} | Workspace details (members, projects, tasks) |
| PUT | /api/workspaces/{id} | Update workspace |
| DELETE | /api/workspaces/{id} | Delete workspace |
| DELETE | /api/workspaces/{id}/members/{userId} | Remove member |

### Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST | /api/workspaces/{id}/invitations | List / send workspace invitations |
| DELETE | /api/workspaces/{id}/invitations/{invId} | Revoke invitation |
| GET | /api/invitations/my | Invitations for the current user |
| POST | /api/invitations/{id}/accept · /decline | Respond to invitation |
| GET / POST | /api/projects/{id}/invitations | List / send project invitations |
| GET | /api/project-invitations/my | Project invitations for current user |
| POST | /api/project-invitations/{id}/accept · /decline | Respond |

### Tasks, Projects, Notes, Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST | /api/workspaces/{id}/tasks | List / create tasks |
| PUT / DELETE | /api/tasks/{id} | Update / delete task |
| PATCH | /api/tasks/{id}/status | Move task between columns |
| PATCH | /api/tasks/{id}/assign | Assign task to member |
| GET / POST | /api/projects | List / create projects |
| GET / PUT / DELETE | /api/projects/{id} | Project CRUD |
| GET / POST | /api/workspaces/{id}/notes | List / create notes |
| GET / PUT / DELETE | /api/workspaces/{id}/notes/{noteId} | Note CRUD |
| GET | /api/workspaces/{id}/activity | Paginated activity log (`from`, `to`, `per_page`) |

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
| workspace_user | Team membership (pivot, with role) |
| workspace_invitations | Pending / accepted / declined workspace invites |
| projects | Projects within workspaces |
| project_invitations | Project-level invites |
| tasks | Kanban tasks (status, priority, deadline, assignee) |
| notes | Workspace notes |
| activity_logs | Workspace event tracking |
| password_reset_tokens | Password reset flow |

---

## Links

- 🗂 [Jira Board](https://ajoysaha.atlassian.net/jira/software/projects/SCRUM/boards)
- 📄 [Confluence Docs](https://ajoysaha.atlassian.net/wiki/spaces/FD)
