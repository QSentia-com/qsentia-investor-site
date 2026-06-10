# QSentia Investor Platform

## Overview

QSentia is a data-driven investor intelligence and analytics platform built using Next.js, Supabase, and internal API services.

The project currently contains:

- Frontend dashboard and landing pages
- Admin and analytics systems
- Authentication flows
- Internal API routes
- Telemetry and model-related services

This repository is under active restructuring to improve:

- architecture consistency
- security enforcement
- backend separation
- deployment stability
- maintainability

---

# Tech Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS

## Backend / APIs

- Next.js API Routes
- Planned dedicated backend service (`/backend`)

## Database & Auth

- Supabase
- PostgreSQL

## Deployment

- Vercel (Frontend)
- Supabase Cloud

---

# Project Structure

```txt
root/
│
├── app/                # Next.js app router pages and APIs
├── components/         # Shared UI components
├── lib/                # Utilities, services, temporary business logic
├── public/             # Static assets
├── backend/            # Dedicated backend services (in progress)
├── styles/             # Global styling
├── middleware.ts       # Route middleware
└── README.md
```

---

# Development Status

This project is currently undergoing:

- backend restructuring
- authentication hardening
- removal of mock integrations
- service isolation
- CI/CD stabilization

Some parts of the system may still contain:

- temporary mock data
- incomplete integrations
- experimental routes
- legacy implementation patterns

---

# Setup

## 1. Clone Repository

```bash
git clone <repo-url>
cd <project-name>
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Environment Variables

Create a `.env.local` file in the root directory.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

> Never commit secrets or production keys to the repository.

---

## 4. Run Development Server

```bash
npm run dev
```

Application runs at:

```txt
http://localhost:3000
```

---

# Backend Migration Plan

A dedicated backend structure is being introduced under:

```txt
/backend
```

Future responsibilities:

- secure API handling
- admin services
- telemetry processing
- analytics aggregation
- cron jobs
- websocket services
- business logic isolation

New backend-related logic should be added there whenever possible.

---

# Engineering Rules

## Required Practices

- Avoid adding business logic inside UI components
- Avoid hardcoded mock data unless clearly labeled
- Keep secrets and privileged operations server-side
- Use environment variables for all API keys and credentials

---

# Known Issues

- Certain services are still tightly coupled to frontend logic
- Backend extraction is ongoing

---

# Recommended Workflow

```bash
git checkout -b feature/<feature-name>
```

```bash
git add .
git commit -m "feat: description"
git push
```

Notify the team after pushing changes affecting:

- shared routes
- deployment
- environment variables
- authentication
- CI/CD

---

# Goals of Current Refactor

- Improve architectural clarity
- Separate frontend and backend concerns
- Reduce technical debt
- Improve deployment reliability
- Enforce security boundaries
- Create maintainable scaling paths

---

# Contributors

Internal development team and collaborators.

---
