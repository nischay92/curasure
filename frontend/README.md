# CuraSure Frontend

React, Vite, and TypeScript frontend for CuraSure.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Auth Routes

```text
/login
/register
/dashboard
/dashboard/patient
/dashboard/doctor
/dashboard/insurance
/dashboard/admin
/doctor/onboarding
```

The app uses Firebase Auth on the client and syncs the selected role to the backend through `POST /auth/profile`.
