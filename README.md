markdown
# 🚚 TransitOps — Enterprise Fleet & Logistics Management Platform

<p align="center">
  <img src="docs/images/banner.png" alt="TransitOps Banner" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Next.js-Frontend-black?logo=nextdotjs" alt="Next.js">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-Cache-red?logo=redis" alt="Redis">
  <img src="https://img.shields.io/badge/JWT-Authentication-orange" alt="JWT">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## 📖 Project Description

**TransitOps** is a modern, enterprise-grade Fleet & Logistics Management Platform built to streamline commercial transportation and supply chain operations. 

The platform connects multiple organizational departments—from fleet registrars and dispatchers to safety compliance officers and financial analysts—on a single, centralized workspace. Permissions and features are isolated and enforced at both the API and UI levels using secure, JWT-based Role-Based Access Control (RBAC).

---

## 🏗️ System Architecture

<p align="center">
  <img src="docs/images/architecture.png" alt="TransitOps System Architecture" width="100%">
</p>

The TransitOps architecture is split into a modular decoupled frontend and backend:
* **Frontend**: Next.js App Router workspace utilizing React, TypeScript, and Tailwind CSS.
* **Backend**: FastAPI microservices framework using SQLAlchemy ORM for transaction management.
* **Storage & Caching**: PostgreSQL for persistence, and Redis for distributed caching, session token storage, and rate-limiting.

---

## ⚙️ Operational Workflow

text
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
Create Trip       Register Fleet     Schedule        Manage Expenses
Dispatch Trip     Add Drivers        Maintenance     Fuel Logs
     │                 │                 │                │
     └─────────────────┴─────────────────┼────────────────┘
                                         ▼
                                PostgreSQL Database
                                         │
                                         ▼
                            Financial Analytics Engine


---

## 👥 User Roles & Capabilities

### 🛠️ Safety Officer
* **Scheduled Maintenance**: Schedule servicing tasks for vehicles (routine checks, engine/brake repairs).
* **Servicing Lifecycle**: Transactionally transition records from `SCHEDULED` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `CANCELLED`.
* **Automated Safeguards**:
  * Starting maintenance automatically updates the vehicle state to `IN_SHOP` and renders it unavailable for trip assignment.
  * Restores the vehicle to `AVAILABLE` automatically upon completion of the final active maintenance log.
  * Blocks starting maintenance on any vehicle currently `ON_TRIP` or `RETIRED`.
* **Driver Safety Roster**: Read-only compliance portal tracking CDL validity statuses (`EXPIRED`, `EXPIRING SOON`, `VALID`) and highlights safety alerts for scores under `60%`.

### 🚚 Dispatcher
* **Trip Lifecycle**: Manage assignment logs through `DRAFT` ➔ `DISPATCHED` ➔ `COMPLETED` / `CANCELLED`.
* **Resource Assignment**: Dispatch loads to vehicles and drivers while validating availability checks (e.g. blocking `IN_SHOP` or `SUSPENDED` assets).

### 🚛 Fleet Manager
* **Vehicle Registry**: Manage fleet vehicle records (model, type, load capacity, odometer, cost).
* **Driver Directory**: Register commercial drivers, license classifications, and manage shift states.

### 💰 Financial Analyst
* **Cost Auditing**: Record transactional trip expenses and fuel consumption logs.
* **Analytics Engine**: View total fleet revenue, operating margins, vehicle profitability (ROI), and fuel efficiency metrics.

---

## 📂 Repository Structure

text
TransitOps/
│
├── backend/
│   ├── app/               # FastAPI Application Core
│   │   ├── enums.py       # Global Domain Enums (UserRoles, VehicleStatus)
│   │   ├── schemas.py     # Pydantic Validation Schemas
│   │   └── oauth2.py      # JWT Authenticator & RBAC Dependencies
│   ├── db/                # Database & SQLAlchemy Models
│   ├── routes/            # API Route Handlers (Trips, Vehicles, Safety)
│   ├── alembic/           # Database Migration Scripts
│   ├── requirements.txt   # Python Dependencies
│   └── main.py            # App Entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js Pages & Route Handlers
│   │   ├── components/    # Reusable UI Blocks (Shadcn/UI components)
│   │   └── lib/           # Axios / Fetch API client
│   ├── package.json       # Node.js Dependencies
│   └── tailwind.config.ts # Styling Tokens
│
├── docker-compose.yml
└── README.md


---

## 🛠️ Tech Stack

* **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
* **Backend**: FastAPI, SQLAlchemy, Alembic, Pydantic, PyJWT.
* **Persistence**: PostgreSQL, Redis.
* **DevOps**: Docker, Docker Compose, Git.



## 🚀 Installation & Local Setup

### Prerequisites
* Python 3.12+
* Node.js 18+
* PostgreSQL & Redis instances (or run via Docker)

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

### Run with Docker Compose
To launch the entire platform, including database dependencies, with a single command:
```bash
docker compose up --build
```

---

## 📚 API Documentation

Once the backend is running, interactive API docs are auto-generated at:
* **Swagger UI**: `http://localhost:8000/docs`
* **ReDoc**: `http://localhost:8000/redoc`

---

## 👨‍💻 Team

* **Mohit Kumar**
* **Sahil**
* **Mohit**
* **Chandrika Pandey**
```
