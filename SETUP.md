# PulseDesk v1.0 — Complete Setup Guide

## Demo Credentials (after seeding)
| Role     | Email                          | Password    |
|----------|-------------------------------|-------------|
| Admin    | admin@mindframeindia.com       | Welcome@123 |
| Manager  | zara@mindframeindia.com        | Welcome@123 |
| Employee | raza@mindframeindia.com        | Welcome@123 |
| HR       | hr@mindframeindia.com          | Welcome@123 |

## Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # fill in DB credentials
npm run migrate         # creates all 15 tables
npm run seed            # seeds 11 users, 8 clients, 14 jobs
npm run dev             # starts on :5000
```

## Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev             # starts on :3000
```

## Connect remaining pages to API

Each page in /app/* has a placeholder. Connect like this:

```js
// In any page component:
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../../store/slices/jobsSlice';

export default function Page() {
  const dispatch = useDispatch();
  const { list: jobs } = useSelector(s => s.jobs);
  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);
  // render jobs
}
```

## Complete API Reference

All endpoints documented in backend/SETUP.md

## Socket Events

Frontend — connect in any component:
```js
import { getSocket } from '../../lib/socket';
const socket = getSocket();
socket.on('job:status:change', ({ jobId, status }) => { /* update UI */ });
socket.on('notification:new',   (n) => { /* show bell */ });
```

## Deployment
- Backend: Railway, Render, or any Node.js host
- Frontend: Vercel (recommended for Next.js)
- Database: Supabase (free PostgreSQL)
- Files: Cloudinary (free tier)
