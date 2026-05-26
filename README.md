# CuraSure

CuraSure is a full-stack healthcare portal for four groups that usually have to work across disconnected systems: patients, doctors, insurance providers, and platform admins.

The app is built as a practical product prototype. It has real authentication, role-based access, MongoDB-backed records, appointment scheduling, secure chat checks, insurance coverage workflows, document metadata, telehealth links, and an AI symptom guidance flow with a rule-based fallback. It is not production medical software, but the code is structured like something that could grow in that direction.

## What Works Right Now

Patients can:

- Register and sign in with Firebase Auth.
- Search doctors by specialty, location, insurance, and availability.
- View doctors on a Leaflet/OpenStreetMap map when coordinates are available.
- Book only doctor-opened hourly slots that are still free.
- See appointments, start secure conversations, check insurance coverage, upload documents, and open telehealth visits.
- Use the symptom assistant for non-diagnostic guidance and suggested specialties.

Doctors can:

- Create and update their profile.
- Open hourly availability slots.
- See booked appointments.
- Chat with patients who have an allowed conversation.
- Join appointment telehealth sessions.

Insurance providers can:

- Manage provider profile data.
- Create plans and coverage rules.
- Review coverage-related data through the provider workspace.

Admins can:

- Review users, doctors, insurance providers, and audit logs.
- Verify or reject doctors and insurance providers.
- Work from a table-based admin dashboard instead of placeholder cards.

## Tech Stack

- Frontend: React, Vite, TypeScript, React Router, Axios, Socket.IO client, Leaflet/OpenStreetMap
- Backend: Node.js, Express, TypeScript, MongoDB Atlas, Mongoose, Socket.IO
- Auth and storage: Firebase Auth, Firebase Admin SDK, Firebase Storage
- AI: Gemini API when configured, with a local rule-based fallback
- Deployment target: Vercel for frontend, Render for backend

## Repository Layout

```text
curasure/
  frontend/       React/Vite app
  backend/        Express API, Socket.IO, MongoDB models
  docs/           Project notes and milestone documentation
  README.md
  .gitignore
```

## Local Setup

Run the backend first:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Run the frontend in another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/health`
- Database health check: `http://localhost:4000/health/db`

## Environment Variables

Do not paste secrets into GitHub or chat. Keep them in local `.env` files.

Backend variables live in `backend/.env`:

```bash
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
MONGODB_URI=
MONGODB_DB_NAME=curasure
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
GEMINI_API_KEY=
```

Frontend variables live in `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Notes:

- `FIREBASE_PRIVATE_KEY` should keep its newline escapes as `\n`.
- Gemini is optional for local development. If `GEMINI_API_KEY` is missing, the symptom assistant uses the rule-based fallback.
- Firebase Auth users are still created through Firebase. The MongoDB seed script only creates app-side demo records.

## Useful Frontend Routes

```text
/login
/register
/dashboard
/doctor/onboarding
/doctors
/appointments
/chat
/insurance/provider
/coverage
/symptoms
/documents
/admin
/telehealth
```

## API Areas

The backend is organized around these route groups:

- `/auth` for Firebase-authenticated profile work.
- `/doctors` for doctor profiles, search, availability, and verification-related reads.
- `/appointments` for booking, slot checks, appointment lists, and telehealth access.
- `/conversations` for secure chat history and participant-checked messaging.
- `/insurance` for provider plans, rules, and coverage checks.
- `/ai` for symptom guidance.
- `/documents` for Firebase Storage-backed uploads and metadata.
- `/admin` for admin-only user, verification, and audit workflows.

Socket.IO uses Firebase ID tokens during connection setup and checks conversation participation before joining chat rooms.

## Demo Data

After the backend environment is configured, you can seed MongoDB:

```bash
cd backend
npm run seed
```

The seed creates demo users, doctor profiles, insurance plans, coverage rules, appointments, conversations, messages, audit logs, and AI sessions in MongoDB. It does not create matching Firebase Auth accounts, so for full sign-in testing you still need Firebase users with matching roles in the app profile flow.

## Testing Checklist

Backend:

```bash
cd backend
npm run typecheck
npm run build
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run build
```

Manual checks worth doing after a fresh setup:

- Register one patient, one doctor, one insurance provider, and one admin.
- Complete doctor onboarding, then open a few hourly slots.
- Book a slot as a patient and confirm the same slot cannot be booked again.
- Start a conversation from an allowed doctor/patient relationship.
- Run a coverage check from the patient side.
- Upload a document and confirm only the owner can list it.
- Open `/admin` as an admin and verify the tables load.
- Open telehealth from an appointment as the patient or doctor.

## Security Work Already In Place

- Firebase token verification on protected backend routes.
- Role-based route guards.
- Appointment and conversation participant checks.
- Doctor availability double-booking protection.
- Helmet, CORS config, rate limiting, and request logging.
- Zod validation on the hardened route paths.
- Audit log model and admin audit visibility.
- Secrets kept in environment variables only.

There is still production hardening left before real-world use: stricter Firebase custom claims, deeper audit coverage, stronger file scanning, medical/legal review, monitoring, backups, and deployment-specific security headers.

## Deployment Status

Local development is wired up. Production deployment is intentionally not finalized yet.

The next deployment milestone is to configure:

- Vercel for the frontend.
- Render for the backend.
- Production environment variables.
- Production CORS origins.
- Public backend/frontend URLs.

Those values should be added through each platform's dashboard, not committed to the repo.
