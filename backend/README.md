# CuraSure Backend

Express and TypeScript backend for CuraSure.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm start
```

## Health Check

Start the server, then visit:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "curasure-backend",
  "database": {
    "status": "ok",
    "state": "connected"
  }
}
```

## Environment

Create a local `.env` file:

```bash
cp .env.example .env
```

Set:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=curasure
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=...
```

## Auth Routes

Routes expect a Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer <firebase_id_token>
```

Available in this milestone:

```http
POST /auth/profile
GET /auth/me
```

## Doctor Routes

Doctor routes require a Firebase ID token and a CuraSure user role of `doctor`.

```http
GET /doctors
GET /doctors/me
PUT /doctors/me
```

`GET /doctors` supports `specialty`, `city`, `state`, `insurance`, and `consultationMode` query filters.

## Appointment Routes

Appointment routes require a Firebase ID token.

```http
GET /appointments
POST /appointments
GET /appointments/slots?doctorId=<doctorId>
POST /appointments/slots
```

Doctors open hourly availability slots. Patients can book only open slots. Patients see their own appointments; doctors see appointments booked with their doctor profile.

## Conversation Routes

Conversation routes require a Firebase ID token and enforce participant access.

```http
GET /conversations
POST /conversations
GET /conversations/:conversationId/messages
POST /conversations/:conversationId/messages
```

Socket.IO connections also require a Firebase ID token in the socket auth payload.
