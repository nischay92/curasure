# CuraSure

CuraSure is a doctor-patient-insurance healthcare portal built in small, pushable milestones.

## Planned Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Socket.IO client, Leaflet/OpenStreetMap
- Backend: Node.js, Express, TypeScript, MongoDB Atlas, Mongoose, Socket.IO
- Auth and storage: Firebase Auth, Firebase Storage
- AI: Gemini API with a rule-based fallback
- Deployment: Vercel for frontend, Render for backend

## Repository Structure

```text
curasure/
  frontend/
  backend/
  docs/
  README.md
  .gitignore
```

## Milestone Status

- Milestone 1: repository scaffold complete.
- Milestone 2: backend foundation complete.
- Milestone 3: MongoDB Atlas setup complete.
- Milestone 4: MongoDB integration complete.
- Milestone 5: Firebase setup complete.
- Milestone 6: Firebase Auth integration complete.

## Local Development

Backend development:

```bash
cd backend
npm install
npm run dev
```

Required local environment:

```bash
cp .env.example .env
```

Then set `MONGODB_URI` in `backend/.env`.

Health check:

```bash
curl http://localhost:4000/health
```

Authenticated profile routes:

```bash
GET /auth/me
POST /auth/profile
```
