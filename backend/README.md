# Finance Data Processing and Access Control System

A secure backend API for managing financial records with role-based access control. This project provides authenticated access to transaction management and analytics endpoints, ensuring each user can perform only the actions allowed by their role.

---

## 1) Project Overview

The **Finance Data Processing and Access Control System** is a Node.js/Express backend that supports:

- User registration and login with JWT-based authentication
- Role-based authorization (`viewer`, `analyst`, `admin`)
- Financial record management (create, read, update, delete)
- Dashboard analytics for totals, summaries, and category breakdowns

It is designed to be simple, secure, and production-friendly with centralized error handling, validation, and clear API behavior.

---

## 2) Features

### Authentication
- JWT token issuance on login/register
- Protected routes via auth middleware
- Account status checks (e.g., inactive users blocked)

### Role-Based Access Control (RBAC)
- **viewer**: read access to records + totals
- **analyst**: viewer access + advanced dashboard analytics
- **admin**: full access, including record creation/update/delete and user management

### Financial Records CRUD
- Create, list, filter, fetch by ID, update, and soft-delete records
- Input validation for amount, type, category, dates

### Dashboard Summary APIs
- Income/expense/balance totals
- Monthly rollups
- Category-wise grouping (income/expense)

---

## 3) Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing:** `bcrypt`
- **Validation:** `express-validator`

---

## 4) Folder Structure

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

## 5) Setup Instructions

### Step 1: Clone and move into backend
```bash
git clone <your-repository-url>
cd <repository-root>/backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment
Create a `.env` file in `backend/` using `.env.example` as a base.

```bash
cp .env.example .env
```

### Step 4: Update `.env` values
Set your MongoDB URI and JWT secret before running.

### Step 5: Run the server
Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Default base URL:
```text
http://localhost:5000/api
```

---

## 6) Environment Variables (`.env` example)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/finance_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 7) API Endpoints (Brief)

Base prefix: `/api`

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT
- `GET /auth/me` - Get current authenticated user

### Users (Admin only)
- `GET /users` - List users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id/role` - Update user role
- `PATCH /users/:id/status` - Update user status

### Records
- `GET /records` - List/filter records (`viewer+`)
- `GET /records/:id` - Get record by ID (`viewer+`)
- `POST /records` - Create record (`admin`)
- `PUT /records/:id` - Update record (`admin`)
- `DELETE /records/:id` - Soft-delete record (`admin`)

### Dashboard
- `GET /dashboard/totals` - Income/expense totals (`viewer+`)
- `GET /dashboard/summary` - Full summary analytics (`analyst+`)
- `GET /dashboard/categories` - Category breakdown (`analyst+`)

---

## 8) Example Request/Response

### Example: Login

**Request**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Response (200)**
```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "6612b2f7a0d3f4c9bf9d0abc",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active"
  }
}
```

### Example: Get Records with Filters

**Request**
```http
GET /api/records?type=expense&category=Food&startDate=2026-01-01&endDate=2026-03-31&page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Response (200)**
```json
{
  "data": {
    "records": [
      {
        "_id": "6612b4d3a0d3f4c9bf9d0def",
        "amount": 450,
        "type": "expense",
        "category": "Food",
        "date": "2026-03-28T00:00:00.000Z",
        "notes": "Groceries",
        "createdBy": {
          "_id": "6612b2f7a0d3f4c9bf9d0abc",
          "name": "Admin User",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

## 9) Notes / Assumptions

- Passwords are hashed with `bcrypt` before storage.
- JWT auth is required for all protected routes.
- Soft delete is used for records (`isDeleted = true`) rather than hard deletion.
- User registration defaults role to `viewer`.
- Validation errors return status `422` with structured details.
- Dashboard calculations default safely to zero when data is empty.

---

If you want, this README can be extended with OpenAPI/Swagger documentation in the next step.
