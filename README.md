# DogWatch — City Dog Problem Reporting System

A full-stack web application that helps citizens report dog-related problems across the city using geo-tagged reports on an interactive Google Map, secured with OTP-based mobile authentication.

## Problem Statement

Cities face challenges with stray dogs, aggressive behavior, night barking, injured animals, and large dog populations. Citizens lack a simple way to report these issues with accurate location data.

## Solution

DogWatch provides a web-based platform where users can:

- Log in using mobile number + OTP verification
- Report dog problems with geo-tagged locations
- View all reports on an interactive city map
- Track report status on a personal dashboard
- Allow admins to verify and manage reports

## Features

- **OTP Authentication** — Secure login via mobile number (development mode logs OTP to console)
- **GeoTagged Reports** — GPS or map-based location selection
- **Interactive Google Map** — View and filter reports by type
- **User Dashboard** — Track your reports (Pending, Verified, Resolved)
- **Admin Panel** — Manage all reports, change status, delete inappropriate entries
- **Nearby Search** — Haversine formula for radius-based report filtering
- **SQLite Database** — Lightweight, file-based database via Prisma ORM

## Architecture

```
React Frontend (Vite + Tailwind)
        |
        | REST API (Axios)
        ↓
Node.js + Express Backend
        |
        ↓
Prisma ORM
        |
        ↓
SQLite Database (dev.db)
```

Google Maps JavaScript API is used by the frontend for map display and location selection. Browser Geolocation API is used for current-location detection.

## Technology Stack

| Layer      | Technologies                                      |
|------------|---------------------------------------------------|
| Frontend   | React, Vite, Tailwind CSS, React Router, Axios    |
| Maps       | Google Maps JavaScript API, Browser Geolocation   |
| Backend    | Node.js, Express.js                               |
| Database   | SQLite + Prisma ORM                               |
| Auth       | OTP (bcrypt hashed), JWT                          |

## Folder Structure

```
dogwatch/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # Auth context
│   │   └── services/       # API client
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route handlers
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & admin middleware
│   ├── services/           # OTP service
│   ├── prisma/             # Schema, migrations, seed
│   └── server.js
└── README.md
```

## SQLite + Prisma

This project uses **SQLite** as the sole database (no MongoDB, PostgreSQL, or MySQL).

- Database file: `server/prisma/dev.db`
- Connection string: `DATABASE_URL="file:./dev.db"`
- Prisma provides type-safe database access, migrations, and seeding

### Prisma Commands

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generates the Prisma Client from schema |
| `npx prisma migrate dev --name init` | Creates and applies database migrations |
| `npx prisma db seed` | Seeds demo data (admin user + Bangalore reports) |
| `npx prisma studio` | Opens a visual database browser at localhost:5555 |

## Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable **Maps JavaScript API**
3. Create an API key
4. Add it to `client/.env`:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key
```

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=change_this_secret
OTP_EXPIRY_MINUTES=5
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Copy from `.env.example` files. **Never commit `.env` files.**

## Installation

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env        # Edit values as needed
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend runs at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd client
npm install
cp .env.example .env        # Add your Google Maps API key
npm run dev
```

Frontend runs at `http://localhost:5173`

## OTP Testing (Development Mode)

When `NODE_ENV=development`:

1. Go to `/login` and enter any valid 10-digit mobile number (e.g., `9876543210`)
2. Check the **server console** for:

```
Development OTP for 9876543210: 123456
```

3. Enter the OTP on the verification page
4. You will receive a JWT and be redirected to the dashboard

### Demo Admin Account

| Field        | Value          |
|--------------|----------------|
| Phone        | `9999999999`   |
| Role         | ADMIN          |

> **Note:** This is a demo account for interview/testing only. Do not use in production.

Login with `9999999999`, get OTP from server console, verify, and access `/admin`.

## API Documentation

### Auth

| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| POST   | `/api/auth/send-otp`  | No   | Send OTP to phone     |
| POST   | `/api/auth/verify-otp`| No   | Verify OTP, get JWT   |
| GET    | `/api/auth/me`        | Yes  | Get current user      |

### Reports

| Method | Endpoint                        | Auth | Description                |
|--------|---------------------------------|------|----------------------------|
| GET    | `/api/reports`                  | No   | List all reports           |
| GET    | `/api/reports/nearby`           | No   | Nearby reports (Haversine) |
| GET    | `/api/reports/my`               | Yes  | Current user's reports     |
| GET    | `/api/reports/stats`            | Yes  | Dashboard statistics       |
| GET    | `/api/reports/:id`              | No   | Single report              |
| POST   | `/api/reports`                  | Yes  | Create report              |
| PUT    | `/api/reports/:id`              | Yes  | Update report              |
| DELETE | `/api/reports/:id`              | Yes  | Delete report              |

### Sample API Requests

**Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "123456"}'
```

**Create Report:**
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "AGGRESSIVE_DOG",
    "description": "Aggressive dog near park",
    "dogCount": 1,
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "MG Road, Bangalore"
  }'
```

**Nearby Reports:**
```bash
curl "http://localhost:5000/api/reports/nearby?lat=12.9716&lng=77.5946&radius=5000"
```

## Database Schema

### User
- `id`, `phoneNumber` (unique), `isVerified`, `role` (USER/ADMIN), timestamps

### Report
- `id`, `userId`, `type`, `description`, `dogCount`, `latitude`, `longitude`, `address`, `status`, timestamps
- Types: AGGRESSIVE_DOG, SMALL_PUPPIES, NIGHT_BARKING, LARGE_DOG_POPULATION, INJURED_DOG, STRAY_DOG, OTHER
- Statuses: PENDING, VERIFIED, RESOLVED, REJECTED

### OTP
- `id`, `phoneNumber`, `otpHash`, `expiresAt`, `attempts`, `createdAt`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not loading | Set `VITE_GOOGLE_MAPS_API_KEY` in `client/.env` |
| OTP not received | Check server console (development mode) |
| 401 Unauthorized | Token expired — log in again |
| Database error | Run `npx prisma migrate dev` and `npx prisma db seed` |
| CORS error | Ensure `CLIENT_URL` in server `.env` matches frontend URL |
| Port in use | Change `PORT` in server `.env` or kill existing process |

## Future Improvements

- Integrate Twilio/SMS for production OTP delivery
- Push notifications for report status updates
- Photo upload for reports
- PostgreSQL migration for production scale
- Rate limiting and CAPTCHA
- Email notifications for admins
- Mobile app (React Native)

## License

MIT — Built for educational and interview demonstration purposes.
>>>>>>> 33b816d (Initial commit: DogWatch - City Dog Problem Reporting System)
