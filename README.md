# AS Crystal

AS Crystal is a full-stack crystal e-commerce project built with:

- React
- Node.js
- Express
- MySQL

It includes a customer storefront, admin panel, product management, orders, users, reviews, coupons, reports, menu management, and demo seed data for testing.

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

### Admin Side

- Dashboard with charts and summaries
- Product management
- Category management
- Menu and submenu management
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
AS-Crystal/
├── backend/
├── frontend/
├── package.json
├── setup.bat
└── start.bat
```

## Installation

### Prerequisites

Make sure these are installed:

- Node.js
- npm
- MySQL
- WAMP/XAMPP or a local MySQL server

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Crystal_New
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

## Environment Setup

Create or update `backend/.env` with values like:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crystal_store
JWT_SECRET=crystal_store_jwt_secret_key_2024_super_secure
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=uploads/products
```

Optional for email:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_SECURE=false
```

Optional for Stripe:

```env
STRIPE_SECRET_KEY=
```

## Database Setup

This project includes an automatic setup script that:

- creates the database
- creates required tables
- seeds sample categories and products
- creates admin user
- adds demo users, orders, reviews, coupons, wishlist data, and menus

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

This runs:

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

Use the default admin account:

- Email: `admin@gmail.com`
- Password: `Password@123`

## Demo Data

The setup script seeds demo data so you can test:

- dashboard charts
- reports
- customer list
- orders
- reviews
- coupons
- menu management

If you want to reseed everything, run:

```bash
npm run setup
```

## Available Scripts

### Root

- `npm start` -> starts frontend and backend using batch file
- `npm run setup` -> creates database and demo data

### Frontend

- `npm start`
- `npm run build`
- `npm test`

### Backend

- `npm start`
- `npm run dev`
- `npm run setup-db`

## Main Admin Modules

- Dashboard
- Products
- Categories
- Menus
- Orders
- Users
- Reviews
- Coupons
- Reports
- Settings

## Notes

- Frontend uses proxy to backend at `http://localhost:5000`
- Menu management is database-driven
- User deletion requires deactivation first
- Some advanced modules are scaffolded and can be extended further inside the admin settings area

## Build Check

Frontend production build:

```bash
cd frontend
npm run build
```

## License

This project is for learning, development, and customization use.
