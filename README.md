# SanTrack Backend API

Express.js backend with MVC + Service layer architecture.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

## API Documentation

Swagger UI: http://localhost:5000/api-docs

## Endpoints

| Route | Description | Access |
|-------|-------------|--------|
| POST /api/auth/register | Register user | Public |
| POST /api/auth/login | Login | Public |
| GET /api/auth/me | Current user | Private |
| CRUD /api/users | User management | Admin |
| CRUD /api/villages | Village management | Admin (write), All (read) |
| CRUD /api/inspections | Inspections | Inspector |
| CRUD /api/issues | Issues | Community Leader |

## Architecture

- **Controllers**: Handle HTTP, delegate to services
- **Services**: Business logic, database operations
- **Models**: Mongoose schemas
- **Middleware**: Auth, validation, error handling
