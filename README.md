# SanTrack Backend

Backend API for SanTrack, a sanitation monitoring and issue tracking platform.

This service handles:

- authentication and role-based access control
- village and facility management
- inspections and critical follow-up automation
- issue tracking
- image uploads
- dashboard statistics
- tactical scheduling

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth + bcryptjs
- Multer + Cloudinary for media uploads
- Nodemailer / SendGrid-ready email flow

## Project Structure

```text
SanTrack_backend/
    seed.js
    src/
        app.js
        server.js
        config/
        controllers/
        middleware/
        models/
        routes/
        services/
        templates/
        utils/
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (Atlas or local)

### 1) Install dependencies

```bash
cd SanTrack_backend
npm install
```

### 2) Configure environment variables

Create a `.env` file in `SanTrack_backend`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/santrack
MONGODB_URI_FALLBACK=mongodb://127.0.0.1:27017/santrack

JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d

# Optional: Google auth
GOOGLE_CLIENT_ID=your_google_client_id

# Optional: Cloudinary image upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Email service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
EMAIL_FROM=noreply@santrack.local
EMAIL_ADMIN_NOTIFY=admin@santrack.local
```

Notes:

- `JWT_SECRET` and `MONGODB_URI` are required for startup.
- `MONGODB_URI_FALLBACK` is used when SRV lookup fails.
- Cloudinary keys are required only for `POST /api/uploads/image`.

### 3) Run the API

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API runs on `http://localhost:5000` by default.

### 4) Optional seed data

Create default admin and inspector users:

```bash
node seed.js
```

Seeded credentials:

- admin: `admin@santrack.com` / `password123`
- inspector: `inspector@santrack.com` / `password123`

## API Endpoint Documentation

### Base URL

- Local: `http://localhost:5000/api`

### Auth Header

Protected endpoints require:

```http
Authorization: Bearer <jwt_token>
```

### Health and Root

| Method | Path          | Access | Description                 |
| ------ | ------------- | ------ | --------------------------- |
| GET    | `/`           | Public | API welcome message         |
| GET    | `/api/health` | Public | Health status and timestamp |

### Auth Endpoints

| Method | Path                        | Access        | Description                                |
| ------ | --------------------------- | ------------- | ------------------------------------------ |
| POST   | `/api/auth/register`        | Public        | Register a community user                  |
| POST   | `/api/auth/login`           | Public        | Login with email/password                  |
| POST   | `/api/auth/google`          | Public        | Login/register via Google credential token |
| GET    | `/api/auth/profile`         | Authenticated | Get current user profile                   |
| PUT    | `/api/auth/profile`         | Authenticated | Update profile and optional password       |
| POST   | `/api/auth/verify-password` | Authenticated | Verify current password                    |
| POST   | `/api/auth/deactivate`      | Authenticated | Deactivate account (scheduled deletion)    |
| DELETE | `/api/auth/account`         | Authenticated | Permanently delete account                 |

### Users (Admin)

| Method | Path             | Access | Description                             |
| ------ | ---------------- | ------ | --------------------------------------- |
| POST   | `/api/users`     | Admin  | Create user (admin/inspector/community) |
| GET    | `/api/users`     | Admin  | List users                              |
| GET    | `/api/users/:id` | Admin  | Get user by id                          |
| PUT    | `/api/users/:id` | Admin  | Update user                             |
| DELETE | `/api/users/:id` | Admin  | Delete user                             |

### Villages

| Method | Path                                                | Access                      | Description                         |
| ------ | --------------------------------------------------- | --------------------------- | ----------------------------------- |
| GET    | `/api/villages`                                     | Admin, Inspector, Community | List villages with facilities count |
| GET    | `/api/villages/:id`                                 | Admin, Inspector, Community | Get village by id                   |
| POST   | `/api/villages`                                     | Admin                       | Create village                      |
| PUT    | `/api/villages/:id`                                 | Admin                       | Update village                      |
| DELETE | `/api/villages/:id`                                 | Admin                       | Delete village                      |
| GET    | `/api/villages/reverse-geocode?lat=<lat>&lng=<lng>` | Admin                       | Reverse geocode coordinates         |

### Facilities

| Method | Path                     | Access                      | Description                                 |
| ------ | ------------------------ | --------------------------- | ------------------------------------------- |
| GET    | `/api/facilities/public` | Public                      | Public facility list (supports `villageId`) |
| GET    | `/api/facilities`        | Admin, Inspector, Community | List facilities (supports `villageId`)      |
| GET    | `/api/facilities/:id`    | Admin, Inspector, Community | Get facility by id                          |
| POST   | `/api/facilities`        | Admin                       | Create facility                             |
| PUT    | `/api/facilities/:id`    | Admin                       | Update facility                             |
| DELETE | `/api/facilities/:id`    | Admin                       | Delete facility                             |

### Inspections

| Method | Path                                          | Access                  | Description                                              |
| ------ | --------------------------------------------- | ----------------------- | -------------------------------------------------------- |
| POST   | `/api/inspections`                            | Inspector               | Create inspection                                        |
| GET    | `/api/inspections`                            | Admin, Inspector        | List inspections (inspector sees own records)            |
| GET    | `/api/inspections/sync-history?limit=<1..20>` | Admin, Inspector        | Recent inspections with follow-up issue/schedule summary |
| GET    | `/api/inspections/:id`                        | Admin, Inspector(owner) | Get inspection by id                                     |
| PUT    | `/api/inspections/:id`                        | Admin, Inspector(owner) | Update inspection                                        |
| DELETE | `/api/inspections/:id`                        | Admin, Inspector(owner) | Delete inspection                                        |

Behavior note:

- Critical inspections trigger automated follow-up issue/schedule workflows.

### Issues

| Method | Path              | Access                      | Description                     |
| ------ | ----------------- | --------------------------- | ------------------------------- |
| POST   | `/api/issues`     | Inspector, Community        | Create issue                    |
| GET    | `/api/issues`     | Admin, Inspector            | List issues (supports `status`) |
| GET    | `/api/issues/:id` | Admin, Inspector, Community | Get issue by id                 |
| PUT    | `/api/issues/:id` | Admin                       | Update issue status/details     |
| DELETE | `/api/issues/:id` | Admin                       | Delete issue                    |

### Dashboard

| Method | Path                   | Access | Description                         |
| ------ | ---------------------- | ------ | ----------------------------------- |
| GET    | `/api/dashboard/stats` | Admin  | Platform stats + recent inspections |

### Uploads

| Method | Path                 | Access           | Description                                |
| ------ | -------------------- | ---------------- | ------------------------------------------ |
| POST   | `/api/uploads/image` | Admin, Inspector | Upload image using multipart field `image` |

Upload limits:

- max file size: 5 MB

### Schedules

| Method | Path                 | Access        | Description                                     |
| ------ | -------------------- | ------------- | ----------------------------------------------- |
| GET    | `/api/schedules`     | Authenticated | List schedules (admin sees all, others see own) |
| POST   | `/api/schedules`     | Authenticated | Create schedule                                 |
| PATCH  | `/api/schedules/:id` | Authenticated | Update schedule                                 |
| DELETE | `/api/schedules/:id` | Authenticated | Delete schedule                                 |

## Validation Summary (Most Used Payloads)

### Register

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "123456",
  "phone": "555-0102"
}
```

### Create Village

```json
{
  "name": "Village A",
  "district": "District X",
  "gps": { "lat": 10.123, "lng": 11.456 },
  "population": 3500
}
```

### Create Facility

```json
{
  "name": "Central Well",
  "type": "well",
  "villageId": "<mongo_id>",
  "condition": "good"
}
```

### Create Inspection

```json
{
  "facilityId": "<mongo_id>",
  "score": 8,
  "remarks": "Clean and functional",
  "images": [{ "url": "https://...", "publicId": "abc123" }],
  "cleanlinessLevel": "good",
  "odorLevel": "low",
  "waterAvailability": "full",
  "suppliesStatus": "stocked",
  "maintenanceRequired": false
}
```

### Create Issue

```json
{
  "facilityId": "<mongo_id>",
  "description": "Water leakage near the main tap"
}
```

## Common Error Responses

Errors are returned in this format:

```json
{
  "message": "Error message",
  "details": ["optional validation details"]
}
```

## Available Scripts

- `npm run dev` - start development server with nodemon
- `npm start` - start production server
