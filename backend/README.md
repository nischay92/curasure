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
```

Firebase, Socket.IO, and role-based auth will be added in later milestones.
