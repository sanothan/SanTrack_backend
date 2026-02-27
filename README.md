# SanTrack Backend API

A comprehensive backend API for the SanTrack Rural Sanitation Inspection and Improvement System.

## Features

- **User Management**: Role-based authentication (Admin, Inspector, Community Leader)
- **Village Management**: Track villages, districts, and populations
- **Facility Management**: Monitor sanitation facilities (toilets, wells, water tanks, hand pumps)
- **Inspection System**: Schedule and track facility inspections with scoring
- **Issue Reporting**: Community-driven issue reporting and resolution tracking
- **Analytics & Reports**: Generate comprehensive reports and analytics
- **File Upload**: Support for image uploads for facilities, inspections, and issues
- **Security**: JWT authentication, rate limiting, input validation

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Bcrypt** for password hashing

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password

#### Users (Admin only)
- `GET /users` - Get all users with pagination
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### User Profile
- `GET /users/profile/me` - Get current user profile
- `PUT /users/profile/me` - Update current user profile

#### Villages
- `GET /villages` - Get all villages (authenticated users)
- `POST /villages` - Create village (admin only)
- `GET /villages/:id` - Get village by ID
- `PUT /villages/:id` - Update village (admin only)
- `DELETE /villages/:id` - Delete village (admin only)
- `GET /villages/:id/stats` - Get village statistics

#### Facilities
- `GET /facilities` - Get all facilities (authenticated users)
- `POST /facilities` - Create facility (admin/inspector)
- `GET /facilities/:id` - Get facility by ID
- `PUT /facilities/:id` - Update facility (admin/inspector)
- `DELETE /facilities/:id` - Delete facility (admin only)
- `POST /facilities/:id/images` - Upload facility images

#### Inspections
- `GET /inspections` - Get all inspections (authenticated users)
- `POST /inspections` - Create inspection (inspector only)
- `GET /inspections/:id` - Get inspection by ID
- `PUT /inspections/:id` - Update inspection (inspector who created it)
- `DELETE /inspections/:id` - Delete inspection (admin only)
- `GET /facilities/:facilityId/inspections` - Get facility inspections

#### Issues
- `GET /issues` - Get all issues (authenticated users)
- `POST /issues` - Create issue (inspector/community leader)
- `GET /issues/:id` - Get issue by ID
- `PUT /issues/:id` - Update issue (admin/inspector)
- `DELETE /issues/:id` - Delete issue (admin only)
- `PATCH /issues/:id/resolve` - Resolve issue (admin/inspector)

#### Reports (Admin only)
- `GET /reports` - Get all generated reports
- `POST /reports` - Generate new report
- `GET /reports/:id` - Get report by ID
- `PUT /reports/:id` - Regenerate report
- `DELETE /reports/:id` - Delete report
- `GET /reports/:id/download` - Download report

#### Analytics (Admin only)
- `GET /analytics/dashboard` - Get dashboard analytics
- `GET /analytics/villages` - Get village-level analytics

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```
Edit `.env` with your configuration.

4. Start the development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

## Environment Variables

See `env.example` for all required environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `EMAIL_*` - Email configuration for password reset
- `CLOUDINARY_*` - Cloudinary configuration for image storage

## Database Schema

### User
- name, email, password (hashed), role, village, phone, avatar, isActive, lastLogin

### Village
- name, district, state, population, totalHouseholds, coordinates, updatedBy

### Facility
- name, type, village, location, condition, lastInspection, installedDate, notes, images, createdBy

### Inspection
- facility, inspector, date, score (1-10), status, photos, notes, recommendations, nextInspectionDue

### Issue
- facility, reportedBy, title, description, severity, status, assignedTo, photos, resolutionNotes, resolvedAt

### Report
- title, type, generatedBy, dateRange, data, format, filePath

## User Roles

- **admin**: Full access to all features
- **inspector**: Can create inspections, update facilities, manage issues
- **community_leader**: Can report issues, view data for their village

## File Upload

- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- Maximum files per upload: 5
- Upload endpoints:
  - `/facilities/:id/images` - Facility images
  - Future: Inspection and issue image uploads

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Role-based access control

## API Documentation

Visit `/api-docs` for interactive API documentation (Swagger UI).

## Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

ISC License
