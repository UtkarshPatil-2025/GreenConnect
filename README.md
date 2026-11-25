# GreenConnect — 🌿 GreenCircuit — Intelligent E-Waste Management Platform

> **A regulatory-compliant, real-time e-waste management platform connecting waste generators (households, IT enterprises, institutions) with certified recyclers.**

---

## 🌟 Key Features

1. **Authentication & Multi-Role RBAC**
   - Generator vs. Recycler sign up
   - Password strength analyzer
   - OTP-based password recovery
   - Secure JWT tokens (access + refresh) with auto-rotation

2. **Smart E-Waste Categorization & Listing**
   - 12 comprehensive categories (Computers, Batteries, PCBs, Appliances, etc.)
   - Automated hazardous component disclosure (Lithium, Lead, Mercury)
   - Estimated weights, conditions, and photo uploads

3. **Doorstep Pickup Scheduling & Real-Time Logistics**
   - Multi-item batch bundling
   - Slot selection with driver instructions
   - Handover security OTP to prevent theft or unauthorized collection
   - Interactive live GPS tracking dashboard with stage-by-stage status pipeline

4. **Recycler Regulatory Verification Gateway**
   - 4-step compliance wizard
   - State Pollution Control Board (SPCB) & CPCB license tracking
   - Daily processing capacity declarations and permitted category filters
   - Certified Recycler tiers (`BASIC`, `VERIFIED`, `PREMIUM`, `CERTIFIED_GREEN`)

5. **Chain of Custody (CoC) & Impact Analytics**
   - QR-coded item manifests
   - ESG sustainability metrics (CO₂ emissions avoided, kg diverted from landfill)
   - Eco-credit reward points for circular economy participation
   - Public directory of verified recyclers with ratings & reviews

---

## 🏗️ Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Emerald/Eco theme
- **Database & ORM**: PostgreSQL + Prisma ORM (14 models)
- **Security**: bcryptjs + jsonwebtoken + Zod schema validation
- **Icons**: React Icons (Feather)
- **Notifications**: React Hot Toast

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database instance

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure your database connection string in `.env` is configured:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/greencircuit?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
```

### 3. Install Dependencies
```bash
npm.cmd install
```

### 4. Database Setup & Seeding
Push the database schema and load sample test data:
```bash
npm.cmd run db:push
npm.cmd run db:seed
```

### 5. Start Development Server
```bash
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Production Deployment (Vercel + Neon)

The Next.js app and its `/api` backend deploy together to Vercel. Neon provides
the PostgreSQL database.

1. Create a Neon project and copy its PostgreSQL connection string.
2. Create a GitHub repository, push this project to it, then import that
   repository into Vercel as a Next.js project.
3. In Vercel project settings, add these environment variables for Production
   (and Preview if needed):
   - `DATABASE_URL`: Neon PostgreSQL connection string.
   - `JWT_SECRET` and `JWT_REFRESH_SECRET`: generate two different random
     values, for example with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `NEXT_PUBLIC_APP_NAME`: `GreenCircuit`.
   - `NEXT_PUBLIC_APP_URL`: the deployed Vercel URL; update it if you later add
     a custom domain.
4. Configure the Neon connection string as `DATABASE_URL` in your local
   environment, then initialize the production database schema with
   `npm run db:push`.
5. Deploy from Vercel. The install step generates the Prisma client and
   `npm run build` builds the frontend and API together.

Do not run `npm run db:seed` against production: the seed script deletes
existing records and creates demo accounts. Keep secrets in provider
environment settings, never in the repository or `NEXT_PUBLIC_` variables.

---

## 🔑 Demo Accounts (Seeded)

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| **Waste Generator** | `generator@greencircuit.io` | `Password@123` | View dashboard, list items, schedule pickups, track live van |
| **Recycler** | `recycler1@greencircuit.io` | `Password@123` | View incoming batches, dispatch vans, update statuses |
| **Recycler (Pending)** | `recycler2@greencircuit.io` | `Password@123` | Complete statutory verification wizard |

---

## 📂 Project Directory Structure

```
greencircuit/
├── prisma/
│   ├── schema.prisma             # 14 Relational Models (Users, Listings, Pickups, Tracking)
│   └── seed.ts                   # Realistic seed data with demo users & pickups
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, Signup, OTP Verify, Forgot Password
│   │   ├── (dashboard)/          # Generator: Dashboard, Inventory Listings, Pickups, Live Tracking
│   │   ├── (recycler)/           # Recycler: Facility Operations Hub, SPCB Verification, Dispatches
│   │   ├── api/                  # 14+ Next.js REST API routes (Auth, Waste, Pickups, Recyclers)
│   │   ├── recyclers/            # Public Recycler Directory & Search
│   │   ├── layout.tsx            # Global HTML & Toast container
│   │   └── page.tsx              # Modern Hero Landing Page
│   ├── components/
│   │   ├── ui/                   # Reusable UI Primitives (Button, Input, Badge, Card, Modal, StatusBadge)
│   │   ├── Navbar.tsx            # Responsive Navigation with Role detection
│   │   ├── Sidebar.tsx           # Dashboard sidebar
│   │   └── DashboardLayout.tsx   # Authenticated Layout Wrapper
│   └── lib/
│       ├── api.ts                # Type-safe client fetcher with token rotation
│       ├── auth.ts               # JWT, bcrypt & OTP utilities
│       ├── middleware.ts         # Role-based API route guards
│       ├── prisma.ts             # Prisma client singleton
│       ├── utils.ts              # Environmental calculations & styling
│       └── validations.ts        # Zod input verification schemas
```
