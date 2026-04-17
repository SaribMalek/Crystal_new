# AS Crystal

AS Crystal is a full-stack crystal e-commerce project built with React, Node.js, Express, and MySQL. It includes a customer storefront, admin panel, product management, orders, users, reviews, coupons, reports, blog management, menu management, and seeded demo data for testing.

## Features

### Customer Side
- Modern crystal store homepage
- Shop page with filters and search
- Product detail pages
- Cart and checkout flow
- Login and registration
- Wishlist
- Profile and order history
- Dynamic frontend menus
- Blog and contact flows

### Admin Side
- Dashboard with charts and summaries
- Product management
- Category management
- Menu and submenu management
- Blog management
- Order management
- User management
- Review moderation
- Coupon management
- Reports and analytics
- Settings hub structure

## Tech Stack
- Frontend: React, React Router, Axios, Recharts, Lucide React
- Backend: Node.js, Express, MySQL, JWT, bcrypt, Nodemailer, Stripe
- Database: MySQL

## Project Structure
```text
Crystal_New/
|-- backend/
|-- frontend/
|-- package.json
|-- setup.bat
`-- start.bat
```

## Installation

### Prerequisites
Make sure these are installed:
- Node.js
- npm
- MySQL
- WAMP/XAMPP or another local MySQL server

### Install dependencies
```bash
cd frontend
npm install
cd ../backend
npm install
cd ..
```

## Environment Setup

### Backend
Copy `backend/.env.example` to `backend/.env` and adjust values as needed.

Important variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crystal_store
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=uploads/products
```

Optional:
```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_SECURE=false
STRIPE_SECRET_KEY=
```

### Frontend
Copy `frontend/.env.example` to `frontend/.env` only if you want to override the API target.

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Notes:
- In development, the CRA proxy already points frontend requests to `http://localhost:5000`.
- In production, `REACT_APP_API_BASE_URL` lets you point the frontend to a separate API host if needed.
- If frontend and backend are served behind the same domain and `/api` path, you can leave it unset.

## Database Setup
This project includes an automatic setup script that:
- creates the database
- creates required tables
- seeds sample categories and products
- creates the admin user
- adds demo users, orders, reviews, coupons, wishlist data, blogs, and menus

Run:
```bash
npm run setup
```

Or directly:
```bash
setup.bat
```

## Run the Project

### One-command startup
From the project root:
```bash
npm start
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`
- Admin panel on `http://localhost:3000/admin`

### Manual startup
Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Admin Login
Use the seeded admin account:
- Email: `admin@gmail.com`
- Password: `Password@123`

## Deployment Notes

### Frontend deployment
Build the production frontend:
```bash
cd frontend
npm run build
```

If you deploy frontend and backend separately, set:
```env
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```

### Backend deployment
Recommended production settings:
- set a strong `JWT_SECRET`
- set `NODE_ENV=production`
- set `FRONTEND_URL` to the final frontend origin
- configure real SMTP values if order/contact emails should send
- configure `STRIPE_SECRET_KEY` only if you want Stripe checkout enabled
- ensure the `uploads/` directory is writable and publicly served

### CORS and API
Backend CORS uses `FRONTEND_URL`, so this must match your deployed frontend origin.

### Stripe
Stripe checkout routes exist in the backend, but Stripe only works when `STRIPE_SECRET_KEY` is configured.

## Available Scripts

### Root
- `npm start` -> starts frontend and backend using the batch file
- `npm run setup` -> creates database and demo data

### Frontend
- `npm start`
- `npm run build`
- `npm test`

### Backend
- `npm start`
- `npm run dev`
- `npm run setup-db`

## Notes
- Menu management is database-driven
- User deletion requires deactivation first
- Settings Hub is intentionally structured as an expansion area for shipping, roles, newsletter, SEO, and bulk tools
- The latest frontend build compiles successfully

## License
This project is for learning, development, and customization use.
