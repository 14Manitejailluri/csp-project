# FoodRescue — Food Waste Reduction & Surplus Donation Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Geospatial-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An end-to-end full-stack web platform connecting surplus-food donors (restaurants, supermarkets, hotels, households, caterers) with nearby verified NGOs and volunteer couriers to rescue safe edible food before it becomes waste.

---

## 📖 Table of Contents

1. [Product Problem & Solution](#1-product-problem--solution)
2. [Target Roles & Capabilities](#2-target-roles--capabilities)
3. [Complete Donation Lifecycle](#3-complete-donation-lifecycle)
4. [Technology Stack](#4-technology-stack)
5. [Architecture & Project Structure](#5-architecture--project-structure)
6. [Security & Atomic Claiming](#6-security--atomic-claiming)
7. [Installation & Setup](#7-installation--setup)
8. [Database Seeding](#8-database-seeding)
9. [Running Locally](#9-running-locally)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Docker Deployment](#11-docker-deployment)
12. [Automated Testing](#12-automated-testing)
13. [Food Safety Protocol](#13-food-safety-protocol)

---

## 1. Product Problem & Solution

### The Problem
Commercial restaurants, hotels, bakeries, event organizers, and supermarkets frequently produce safe, high-quality surplus food. Due to the lack of real-time local logistics and automated connection with non-profits, hundreds of thousands of meals end up in landfills every day, creating heavy methane emissions while nearby shelters and community pantries face food insecurity.

### The Solution
**FoodRescue** provides real-time geospatial matching:
- **Donors** post surplus batches in under 60 seconds with photos, expiration deadlines, and storage conditions.
- **Verified NGOs** receive push notifications and claim batches via atomic database locking.
- **Volunteer Couriers** accept pickup missions, navigate via GPS directions, and deliver directly to shelters.
- **Automated Sweepers** mark unclaimed items as expired past their deadlines.
- **Live Impact Engines** calculate CO₂ emissions diverted, kg of food saved, and meals provided.

---

## 2. Target Roles & Capabilities

| Role | Target Users | Primary Functionality |
| :--- | :--- | :--- |
| **Donor** | Restaurants, Hotels, Supermarkets, Caterers, Households | • Publish surplus food listings with quantity, category, and deadlines<br>• Interactive map coordinate selection & photo uploads<br>• Real-time status tracking & edit/cancel available listings<br>• Personal CSR environmental impact dashboard |
| **NGO** | Verified Non-Profits, Soup Kitchens, Shelters | • Proximity search for nearby available donations with radius filters<br>• Interactive Leaflet map exploration & atomic batch claiming<br>• Courier assignment tracking & delivery monitoring<br>• Nutrition & meal rescue distribution records |
| **Volunteer** | Community Couriers, Eco-Activists | • Browse open rescue pickup missions<br>• 1-click mission acceptance & live GPS map directions<br>• Transition states: *Mark Picked Up* → *Mark Delivered*<br>• Courier delivery achievements and personal kg rescued |
| **Admin** | Platform Administrators, Coordinators | • Review & approve/revoke NGO verification credentials<br>• Deactivate / suspend violating accounts<br>• System-wide donation & pickup transaction audits<br>• Aggregate environmental reports & CSV data exports |

---

## 3. Complete Donation Lifecycle

```
[AVAILABLE] ───────────────► [CLAIMED] ───────────────► [ASSIGNED] ───────────────► [PICKED_UP] ───────────────► [DELIVERED]
     │ (Created by Donor)         │ (Claimed by NGO)         │ (Courier accepts)        │ (Courier collects)       │ (Received at NGO)
     │                            │                          │                          │                          │
     ├──► [CANCELLED] (Donor)     └──────────────────────────┴──────────────────────────┴──────────────────────────┘
     │
     └──► [EXPIRED] (Background Cron Sweeper when pickupDeadline < now)
```

- **Atomic Lock Safety**: Prevents race conditions where two NGOs simultaneously claim the exact same batch.
- **Strict Role-Guards**: Only assigned couriers can advance delivery status; only donors/admins can edit or cancel available listings.

---

## 4. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS 3.4 (Modern glassmorphism, responsive grid, bespoke color tokens)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Notifications & Toasts**: React Hot Toast & custom in-app notification center
- **Mapping & Geolocation**: Leaflet & React-Leaflet with OpenStreetMap tiles, GPS geolocation, and reverse geocoding
- **HTTP Client**: Axios with interceptors and cookie credentials support

### Backend
- **Runtime**: Node.js (ES Modules `import/export`)
- **Server Framework**: Express.js
- **Database ODM**: Mongoose 8.x
- **Authentication**: JWT (JSON Web Tokens) stored in secure `HttpOnly` cookies + Bearer auth support
- **Encryption**: Bcrypt.js password hashing
- **File Uploads**: Multer with Cloudinary integration and local disk fallback
- **Automated Sweeper**: Node-Cron background workers
- **Email Service**: Nodemailer with Ethereal development mailer and production SMTP support
- **Security Middlewares**: Helmet, CORS, Express-Rate-Limit, central error handler

---

## 5. Architecture & Project Structure

```
food-rescue/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Sidebar, Footer, StatCard, StatusBadge, Modal
│   │   │   ├── map/             # MapView, LocationPickerModal, DirectionsLink
│   │   │   ├── donations/       # DonationCard, DonationForm, DonationFilters, Timeline
│   │   │   ├── pickups/         # PickupTaskCard, Courier modals
│   │   │   └── notifications/   # NotificationBell & dropdown
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── layouts/             # MainLayout, DashboardLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── donor/           # DonorDashboard, CreateDonation, MyDonations, EditDonation
│   │   │   ├── ngo/             # NgoDashboard, AvailableDonations, ClaimedDonations
│   │   │   ├── volunteer/       # VolunteerDashboard, AvailablePickups, MyDeliveries
│   │   │   ├── admin/           # AdminDashboard, UserManagement, Audit, Reports
│   │   │   └── LandingPage.jsx  # Hero, Impact metrics, How it works, Role portals
│   │   ├── services/            # Axios API services (auth, donations, claims, pickups, etc.)
│   │   ├── utils/               # Constants, formatters, geolocation helpers
│   │   ├── App.jsx              # Main router & routes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # DB connection, Cloudinary, Email, Env loader
│   │   ├── controllers/         # Auth, Donation, Claim, Pickup, Notification, Admin, Analytics
│   │   ├── middleware/          # Auth JWT, RBAC guards, Rate limiter, Central error handler
│   │   ├── models/              # User, Donation (2dsphere index), Claim, Pickup, Notification
│   │   ├── routes/              # Express REST routes
│   │   ├── services/            # Cron sweeper, Impact metrics, Notification & Email dispatch
│   │   ├── utils/               # ApiError, ApiResponse, JWT helpers, Database seeder
│   │   ├── validators/          # Express-validator schemas
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server listener with cron & DB bootstrapper
│   ├── tests/                   # Automated API integration tests (Node Test Runner + Supertest)
│   └── package.json
│
├── Dockerfile.server            # Multi-stage container for Node backend
├── Dockerfile.client            # Multi-stage container for React Vite build + Nginx
├── docker-compose.yml           # Full stack orchestration (MongoDB + Server + Client)
├── .env.example
├── package.json                 # Monorepo development scripts
└── README.md
```

---

## 6. Security & Atomic Claiming

1. **Atomic Database Locking**:
   Donation claims use MongoDB's atomic `findOneAndUpdate`:
   ```js
   const donation = await Donation.findOneAndUpdate(
     { _id: donationId, status: 'AVAILABLE', pickupDeadline: { $gt: new Date() } },
     { $set: { status: 'CLAIMED', claimedBy: ngoId, claimedAt: new Date() } },
     { new: true }
   );
   ```
   If two NGOs click "Claim" simultaneously, exactly one succeeds and the second receives a clean `409 Conflict` error.

2. **HttpOnly Cookie Authentication**:
   JWT tokens are stored in `HttpOnly`, `SameSite` cookies to prevent XSS credential theft. Passwords are salted and hashed with bcrypt (10 rounds) and excluded from all JSON API responses.

3. **Role-Based Access Control (RBAC)**:
   Routes are guarded by strict authorization middleware:
   ```js
   router.post('/', authenticate, authorizeRoles('donor', 'admin'), ...);
   ```

4. **NGO Verification Guard**:
   Only NGOs with `isVerified: true` (approved by an administrator) can claim surplus batches.

---

## 7. Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local community edition or MongoDB Atlas URI)
- [Git](https://git-scm.com/)

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/foodrescue.git
cd foodrescue

# Install all monorepo dependencies (root, backend, and frontend)
npm run install:all
```

### Step 2: Configure Environment Variables
Copy `.env.example` templates to `.env`:

**Server (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/foodrescue
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary credentials (fallback to local uploads if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: SMTP email credentials (fallback to Ethereal/mock logger if omitted)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=FoodRescue <noreply@foodrescue.org>
```

**Client (`client/.env`):**
```env
VITE_API_URL=/api
```

---

## 8. Database Seeding

Populate realistic demo donors, NGOs, volunteer couriers, active listings, and completed rescues:

```bash
npm --prefix server run seed
```

### Pre-Configured Demo Accounts:
| Role | Email | Password | Status |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@example.com` | `password123` | Active Restaurant Donor |
| **NGO (Verified)** | `hope@ngo.org` | `password123` | Verified Community Food Bank |
| **NGO (Pending)** | `shelter@ngo.org` | `password123` | Pending Verification by Admin |
| **Volunteer** | `sarah@volunteer.org` | `password123` | Active Courier |
| **Admin** | `admin@foodrescue.org` | `password123` | Platform Administrator |

*(The login screen also includes convenient **1-Click Demo Login** buttons).*

---

## 9. Running Locally

You can launch both frontend and backend concurrently from the root directory:

```bash
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend API (http://localhost:5000)
npm run server:dev

# Terminal 2: Frontend Client (http://localhost:5173)
npm run client:dev
```

- Web Application: **`http://localhost:5173`**
- API Health Endpoint: **`http://localhost:5000/api/health`**

---

## 10. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (donor, ngo, volunteer)
- `POST /api/auth/login` — Sign in and receive HttpOnly cookie & JWT
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Retrieve active authenticated user session
- `PUT /api/auth/profile` — Update name, phone, organization, or location

### Donations (`/api/donations`)
- `GET /api/donations/available` — Query available donations with geospatial proximity (`lat`, `lng`, `radiusKm`, `foodType`, `search`)
- `GET /api/donations` — Retrieve all donations (with status and pagination filters)
- `GET /api/donations/:id` — Retrieve detailed donation specifications & timeline
- `POST /api/donations` — Create surplus donation (Donor/Admin only, supports image upload)
- `PATCH /api/donations/:id` — Edit donation (Donor/Admin only, if status is `AVAILABLE`)
- `PATCH /api/donations/:id/cancel` — Cancel donation (Donor/Admin only)
- `PATCH /api/donations/:id/claim` — Claim donation (Verified NGO/Admin)
- `DELETE /api/donations/:id` — Delete donation record (Donor/Admin)

### Claims (`/api/claims`)
- `POST /api/claims` — Atomic claim creation by verified NGO
- `GET /api/claims` — List claims for active NGO
- `GET /api/claims/:id` — Get single claim details

### Pickups (`/api/pickups`)
- `GET /api/pickups` — List rescue pickups (filter by `availableOnly=true`, status, etc.)
- `GET /api/pickups/:id` — Get single pickup mission details
- `PATCH /api/pickups/:id/assign` — Volunteer self-assigns to pickup task
- `PATCH /api/pickups/:id/picked-up` — Mark food collected by volunteer
- `PATCH /api/pickups/:id/delivered` — Mark food delivered to NGO

### Analytics (`/api/analytics`)
- `GET /api/analytics/donor` — Total donations, active listings, kg saved, meals rescued
- `GET /api/analytics/ngo` — Claimed batches, meals distributed, food received
- `GET /api/analytics/volunteer` — Assigned tasks, completed deliveries, courier milestones
- `GET /api/analytics/admin` — System-wide user breakdown, CO₂ offsets, verification queues

### Admin Operations (`/api/admin`)
- `GET /api/admin/users` — Search and filter users by role, verification, status
- `PATCH /api/admin/users/:id/verify` — Approve or revoke NGO verification
- `PATCH /api/admin/users/:id/suspend` — Deactivate / suspend user account
- `GET /api/admin/donations` — System audit of all donations
- `GET /api/admin/reports` — Aggregated food category breakdown and environmental report

---

## 11. Docker Deployment

Launch the entire containerized architecture with a single command:

```bash
docker-compose up --build
```

This provisions:
- `foodrescue-mongodb`: MongoDB Database container with persistent volumes
- `foodrescue-server`: Node.js Express backend listening on `http://localhost:5000`
- `foodrescue-client`: Production Nginx SPA container serving React frontend on `http://localhost:3000`

---

## 12. Automated Testing

Run the automated integration test suite covering user authentication, donation creation, verified NGO requirements, atomic race-condition locks, and volunteer status transitions:

```bash
# Run server test suite
npm run test:server

# Run client component tests
npm run test:client

# Run full project test suite
npm test
```

---

## 13. Food Safety Protocol

> **Notice**: FoodRescue provides a rapid communication and coordination layer between certified businesses and community non-profits. Donors must comply with applicable local, state, and federal food-safety health codes. Food items must adhere to safe temperature holding requirements (Cold holding &lt;4°C / Hot holding &gt;60°C). Clear allergen information and pickup deadlines are visibly displayed to NGOs and volunteer couriers.

---

## 📄 License
This project is open-source under the **MIT License**.
