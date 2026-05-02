# GameVault — Project 2 (MERN Stack)

A full MERN stack game library application with authentication, sessions, and server-side authorization.

## Project Structure

```
project-02/
├── backend/          ← Node.js / Express / MongoDB API
│   ├── models/
│   │   ├── User.js       ← bcrypt password hashing
│   │   └── Game.js       ← createdBy field (ObjectId ref to User)
│   ├── routes/
│   │   ├── auth.js       ← register, login, logout, /me
│   │   └── games.js      ← full CRUD with authorization
│   ├── middleware/
│   │   ├── postLogger.js ← custom POST logger (timestamp + userID)
│   │   └── requireAuth.js
│   └── server.js
└── frontend/         ← React (refactored from Project 1)
    └── src/
        ├── api.js          ← axios instance
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Header/     ← auth-aware nav
        │   └── GameCard/   ← edit/delete for owners
        └── pages/
            ├── MainPage/   ← fetches from API (no mock data)
            ├── AuthPages/  ← Login & Register connected to backend
            ├── AddGamePage/ ← create + edit form
            └── MyGamesPage/ ← user's own games
```

---

## Setup — Local Development

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI and SESSION_SECRET in .env
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (already set for local)
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login + start session |
| POST | /api/auth/logout | ✅ | End session |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/games | ❌ | List all games (filterable) |
| GET | /api/games/:id | ❌ | Get single game |
| POST | /api/games | ✅ | Create game |
| PUT | /api/games/:id | ✅ Owner only | Update game |
| DELETE | /api/games/:id | ✅ Owner only | Delete game |

---

## Key Requirements Implemented

| Requirement | Implementation |
|---|---|
| Full MERN Stack | React + Node.js + Express + MongoDB/Mongoose |
| DB Design | `Game.createdBy` → ObjectId ref to `User` |
| Password Hashing | `bcryptjs` in `User.js` pre-save hook |
| Sessions/Cookies | `express-session` + `connect-mongo` store |
| Server-Side Auth | `findOneAndUpdate({ _id, createdBy: session.userId })` |
| Custom Middleware | `postLogger.js` — logs timestamp + userID on every POST |
| E2E Integration | All CRUD via API; no mock data in frontend |
| Deployment | Render.com (backend: Web Service, frontend: Static Site) |

---

## Deployment on Render.com

### Backend (Web Service)

1. Connect GitHub repo → select `backend/` as root
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `SESSION_SECRET` = a long random string
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your frontend Render URL (e.g. `https://gamevault.onrender.com`)

### Frontend (Static Site)

1. Connect GitHub repo → select `frontend/` as root
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL` = your backend Render URL + `/api` (e.g. `https://gamevault-api.onrender.com/api`)

> **Important:** In your frontend `.env` on Render, set `VITE_API_URL` to the full backend URL.

---

## Submission Links File Template

```
submission-links.txt

Group Members:
- [Name] — [Student ID]
- [Name] — [Student ID]

GitHub Repository: https://github.com/...

Frontend URL (Render): https://gamevault-....onrender.com
Backend API URL (Render): https://gamevault-api-....onrender.com
```
