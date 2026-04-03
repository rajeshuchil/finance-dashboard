# Finance Data Processing and Access Control System

A secure REST API backend for managing financial records with role-based access control. Built with Node.js, Express, and MongoDB.

---

## Demo Credentials

To quickly test all features without manual database setup:

**Seed the admin user first:**
```bash
npm run seed:admin
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Admin@123 |
| Viewer | Register normally via `/api/auth/register` | — |

> The Admin role has full access to all endpoints including user management. Viewers can read records and dashboard data.

---

## Seed Sample Data (Optional)

To populate the database with 75 realistic financial records for a richer demo experience:

```bash
npm run seed:data
```

---

## Project Overview

This backend supports:

- User registration and login with JWT-based authentication
- Role-based authorization (`viewer`, `analyst`, `admin`)
- Financial record management with filtering, pagination, and soft delete
- Dashboard analytics powered by MongoDB aggregation pipelines

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing:** `bcrypt`
- **Validation:** `express-validator`
- **Security:** `helmet`, `express-rate-limit`

---

## Folder Structure

```text
backend/
├── app.js
├── server.js
├── package.json
├── .env.example
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── recordController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js
│   ├── validate.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   └── Record.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── recordRoutes.js
│   └── dashboardRoutes.js
└── utils/
    ├── ApiError.js
    ├── asyncHandler.js
    └── jwt.js
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Update `MONGO_URI` and `JWT_SECRET` in `.env` before running.

### 3. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

Default base URL: `http://localhost:5000/api`

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## API Endpoints

All protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | Any role | Get current user profile |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | List users (with filters) |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/:id/role` | Admin | Change user role |
| PATCH | `/users/:id/status` | Admin | Activate or deactivate user |

### Records
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/records` | Viewer+ | List/filter records |
| GET | `/records/:id` | Viewer+ | Get record by ID |
| POST | `/records` | Admin | Create record |
| PUT | `/records/:id` | Admin | Update record |
| DELETE | `/records/:id` | Admin | Soft-delete record |

Query params for `GET /records`: `type`, `category`, `startDate`, `endDate`, `page`, `limit`, `sortOrder`

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/dashboard/totals` | Viewer+ | Income, expenses, and balance |
| GET | `/dashboard/summary` | Analyst+ | Full analytics summary |
| GET | `/dashboard/categories` | Analyst+ | Category-wise breakdown |

---

## Response Format

All responses follow a consistent envelope format:

**Single resource:**
```json
{ "data": { ... } }
```

**List with pagination:**
```json
{
  "data": [...],
  "meta": { "total": 50, "page": 1, "limit": 10, "pages": 5 }
}
```

**Error:**
```json
{ "error": "message here" }
```

---

## Example Requests

### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "Admin@123" }
```

```json
{
  "data": {
    "token": "<jwt-token>",
    "user": { "id": "...", "name": "Admin", "email": "admin@example.com", "role": "admin", "status": "active" }
  }
}
```

### Get Records with Filters
```http
GET /api/records?type=expense&category=Food&startDate=2026-01-01&page=1&limit=10
Authorization: Bearer <token>
```

```json
{
  "data": [ { "_id": "...", "amount": 450, "type": "expense", "category": "Food", ... } ],
  "meta": { "total": 1, "page": 1, "limit": 10, "pages": 1 }
}
```

---

## Notes and Assumptions

- All new users register as `viewer`. Roles are assigned by an admin after registration.
- Passwords require a minimum of 8 characters including uppercase, lowercase, number, and symbol.
- Records use soft delete (`isDeleted: true`) to preserve audit trails.
- Duplicate email registration returns a `409 Conflict` response.
- Validation errors return `422 Unprocessable Entity` with detailed field messages.
- Dashboard monthly summary covers the last 12 full calendar months.
