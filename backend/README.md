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
  "service": "curasure-backend"
}
```

MongoDB, Firebase, Socket.IO, and role-based auth will be added in later milestones.

