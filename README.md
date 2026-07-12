# TransitOps — Enterprise Fleet & Logistics Management Platform

<p align="center">
  <img src="frontend/public/favicon.svg" alt="TransitOps Logo" width="150">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Next.js-Frontend-black?logo=nextdotjs" alt="Next.js">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/JWT-Authentication-orange" alt="JWT">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## Project Description

**TransitOps** is a modern, enterprise-grade Fleet & Logistics Management Platform built to streamline commercial transportation and supply chain operations. 

The platform connects multiple organizational departments—from fleet registrars and dispatchers to safety compliance officers and financial analysts—on a single, centralized workspace. Permissions and features are isolated and enforced at both the API and UI levels using secure, JWT-based Role-Based Access Control (RBAC).

---

## System Architecture

<p align="center">
  <img src="docs/images/architecture.png" alt="TransitOps System Architecture" width="100%">
</p>

The TransitOps architecture is split into a modular decoupled frontend and backend:
* **Frontend**: Next.js App Router workspace utilizing React, TypeScript, and Tailwind CSS.
* **Backend**: FastAPI microservices framework using SQLAlchemy ORM for transaction management.
* **Storage & Caching**: PostgreSQL for persistence.

---

## Operational Workflow

```text
                  User Login
                       │
                       ▼
               JWT Authentication
                       │
                       ▼
            Role Verification (RBAC)
                       │
     ┌─────────────────┼─────────────────┬────────────────┐
     ▼                 ▼                 ▼                ▼
 Dispatcher      Fleet Manager     Safety Officer  Financial Analyst
     │                 │                 │                │
 Manage Trips     Manage Vehicles   Manage          Manage Expenses
 (Create/Dispatch) (Register)        Maintenance     & Fuel Logs
 Manage Fleet     Manage Drivers    Monitor Drivers Monitor Fleet
 & Fuel           (Register)                        Analytics
     │                 │                 │                │
     └─────────────────┴─────────────────┼────────────────┘
                                         ▼
                                PostgreSQL Database
                                         │
                                         ▼
                            Financial Analytics Engine
```

---

## User Roles & Capabilities

### Safety Officer
* **Scheduled Maintenance**: Schedule servicing tasks for vehicles (routine checks, engine/brake repairs).
* **Servicing Lifecycle**: Transactionally transition records from `SCHEDULED` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `CANCELLED`.
* **Automated Safeguards**:
  * Starting maintenance automatically updates the vehicle state to `IN_SHOP` and renders it unavailable for trip assignment.
  * Restores the vehicle to `AVAILABLE` automatically upon completion of the final active maintenance log.
  * Blocks starting maintenance on any vehicle currently `ON_TRIP` or `RETIRED`.
* **Driver Safety Roster**: Read-only compliance portal tracking CDL validity statuses (`EXPIRED`, `EXPIRING SOON`, `VALID`) and highlights safety alerts for scores under `60%`.

### Dispatcher
* **Trip Lifecycle**: Manage assignment logs through `DRAFT` ➔ `DISPATCHED` ➔ `COMPLETED` / `CANCELLED`.
* **Resource Assignment**: Dispatch loads to vehicles and drivers while validating availability checks (e.g. blocking `IN_SHOP` or `SUSPENDED` assets).

### Fleet Manager
* **Vehicle Registry**: Manage fleet vehicle records (model, type, load capacity, odometer, cost).
* **Driver Directory**: Register commercial drivers, license classifications, and manage shift states.

### Financial Analyst
* **Cost Auditing**: Record transactional trip expenses and fuel consumption logs.
* **Analytics Engine**: View total fleet revenue, operating margins, vehicle profitability (ROI), and fuel efficiency metrics.

---

## Repository Structure

```text
TransitOps/
│
├── backend/
│   ├── alembic/           # Database Migration Scripts
│   ├── app/               # FastAPI Application Core (schemas, oauth2, enums)
│   │   └── services/      # Business logic (e.g. financial analytics)
│   ├── core/              # Application Settings
│   ├── db/                # Database & SQLAlchemy Models
│   ├── routes/            # API Route Handlers (auth, trips, vehicles, safety, etc.)
│   ├── scripts/           # Utility scripts (seed_demo_users)
│   ├── requirements.txt   # Python Dependencies
│   └── alembic.ini        # Alembic Configuration
│
├── frontend/
│   ├── public/            # Static Assets
│   ├── src/
│   │   ├── app/           # Next.js App Router (dispatcher, fleet-manager, safety-officer, financial-analyst)
│   │   ├── components/    # Reusable UI Blocks & Guards (Shadcn/UI, AuthGuard)
│   │   └── lib/           # Axios / Fetch API client & utilities
│   ├── package.json       # Node.js Dependencies
│   └── tailwind.config.ts # Styling Tokens
│
└── README.md
```

---

## Tech Stack

* **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
* **Backend**: FastAPI, SQLAlchemy, Alembic, Pydantic, PyJWT.
* **Persistence**: PostgreSQL.
* **DevOps**: Git.



## Installation & Local Setup

### Prerequisites
* Python 3.12+
* Node.js 18+
* PostgreSQL instance (or run via Docker)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On macOS/Linux
   source .venv/bin/activate
   # On Windows
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/transitops
   SECRET_KEY=your_jwt_signing_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the frontend app at `http://localhost:3000`.

---

## API Documentation

Once the backend is running, interactive API docs are auto-generated at:
* **Swagger UI**: `http://localhost:8000/docs`
* **ReDoc**: `http://localhost:8000/redoc`

---

## Team

* **Krish Gupta**
* **Sahil Mishra**
* **Mohit Kumar**
* **Chandrika Pandey**