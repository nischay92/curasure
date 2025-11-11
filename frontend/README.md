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
/doctors
/appointments
/chat
/insurance/provider
/coverage
/doctor/onboarding
```

The app uses Firebase Auth on the client and syncs the selected role to the backend through `POST /auth/profile`.

The doctor search page uses Leaflet and OpenStreetMap. Markers render for doctor profiles with latitude and longitude values.
