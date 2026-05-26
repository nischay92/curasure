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

Socket.IO and full role-specific features will be added in later milestones.
