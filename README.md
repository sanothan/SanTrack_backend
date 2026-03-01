# SanTrack Backend

The server-side application for the SanTrack sanitation monitoring platform. Built using Node.js, Express, and MongoDB, this backend processes facility data, manages user authentication, stores inspection reports, and tracks community issues.

## Tech Stack

*   **Runtime:** Node.js
*   **Web Framework:** Express.js
*   **Database:** MongoDB
*   **ODM:** Mongoose
*   **Authentication:** JWT (JSON Web Tokens) & bcryptjs
*   **File Uploads:** Multer & Cloudinary
*   **Routing:** Express Router

## Project Structure

```
SanTrack_backend/
├── src/
│   ├── config/          # Environment configuration and database connection
│   ├── controllers/     # Route handlers and core business logic
│   ├── middleware/      # Authentication, role checking, error handling, file upload
│   ├── models/          # Mongoose database schemas (User, Facility, Inspection, Issue)
│   ├── routes/          # Express API route definitions
│   ├── services/        # Reusable application services
│   ├── utils/           # Utility functions (asyncHandler, ApiError)
│   └── server.js        # Server entry point
├── .env                 # Environment variables (not checked into version control)
└── package.json         # Dependencies and scripts commands
```

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   MongoDB (local instance running or a MongoDB Atlas URI)
*   Cloudinary Account (for image uploads)

### Setup & Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd SanTrack_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables (`.env`)**
    Create a `.env` file in the root directory and configure:
    ```env
    PORT=5000
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/santrack?retryWrites=true&w=majority
    JWT_SECRET=your_super_secret_jwt_key
    JWT_EXPIRES_IN=7d
    
    # Cloudinary configuration (if you wish to enable images)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

### Running the Server

**Development Mode (auto-reloads on edits):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start listening on `http://localhost:5000` (or your defined `PORT`).

## API Endpoints

The core resources are grouped under `/api/`:
*   **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
*   **Users:** `/api/users` (Admin management)
*   **Villages:** `/api/villages` (Geographic organization)
*   **Facilities:** `/api/facilities` (Toilets, water pumps, etc.)
*   **Inspections:** `/api/inspections` (Inspector reports submitted manually)
*   **Issues:** `/api/issues` (Community-reported complaints)
