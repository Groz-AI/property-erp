# Real Estate ERP System

A comprehensive multi-tenant Real Estate ERP system covering Development, Sales/CRM, Contracting, Procurement, Finance/Accounting, Handover & After-Sales, and HR/Payroll.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| **Backend** | NestJS (Node.js 20) + TypeScript |
| **Database** | PostgreSQL 16 |
| **ORM** | TypeORM |
| **Cache/Queue** | Redis 7 + BullMQ |
| **Auth** | JWT + Passport.js |
| **Storage** | MinIO (S3-compatible) |
| **Monitoring** | Prometheus + Grafana |
| **CI/CD** | GitHub Actions |
| **Deployment** | Docker Compose (MVP) → Kubernetes (prod) |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone & Configure
```bash
git clone <repo-url>
cd "ERP System"
cp .env.example .env
# Edit .env with your values (especially secrets!)
```

### 2. Start Infrastructure
```bash
docker-compose up -d postgres redis minio
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Access
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api/v1
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **MinIO Console**: http://localhost:9001

### Demo Login
- **Email**: `ahmad@groz.ae`
- **Password**: `Demo@2026!`

## Full Docker Setup
```bash
docker-compose up -d
```
This starts all services: PostgreSQL, Redis, MinIO, API, Worker, and Web.

For monitoring:
```bash
docker-compose --profile monitoring up -d
```

## Project Structure

```
ERP System/
├── docs/                          # All specification documents
│   ├── 01-architecture.md         # Architecture & domain boundaries
│   ├── 02-prd.md                  # Product requirements document
│   ├── 03-user-stories.md         # Epics, stories, acceptance criteria
│   ├── 04-database-schema-*.md    # Database schema (4 parts)
│   ├── 05-api-specification.md    # API endpoints & examples
│   ├── 06-ui-specification.md     # Screens, flows, validations
│   ├── 07-accounting-mapping.md   # Event→journal entries, COA, rev rec
│   ├── 08-workflows.md            # State machines, approval flows
│   ├── 09-implementation-plan.md  # Sprint breakdown, team, risks
│   ├── 10-testing-strategy.md     # Unit/integration/E2E strategy
│   ├── 11-devops.md               # Docker, CI/CD, monitoring, backups
│   ├── 12-demo-scenarios.md       # Demo data & walkthrough scenarios
│   └── 13-definition-of-done.md   # Completion checklists
├── backend/                       # NestJS API
│   ├── src/
│   │   ├── main.ts                # Entry point
│   │   ├── app.module.ts          # Root module
│   │   ├── common/                # Guards, decorators, interceptors
│   │   ├── shared/                # Enums, base entities
│   │   ├── modules/               # Feature modules (35 modules)
│   │   │   ├── auth/              # Authentication (JWT + refresh)
│   │   │   ├── tenants/           # Multi-tenancy
│   │   │   ├── users/             # User management
│   │   │   ├── roles/             # RBAC
│   │   │   ├── properties/        # Projects, units
│   │   │   ├── bookings/          # Booking flow
│   │   │   ├── contracts/         # Contract management
│   │   │   ├── collections/       # Receipts, cheques
│   │   │   ├── accounting/        # GL, COA, journal entries
│   │   │   ├── procurement/       # PR → PO → GRN
│   │   │   ├── inventory/         # Stock management
│   │   │   ├── contractors/       # Claims, retention
│   │   │   ├── handover/          # Inspection, snags
│   │   │   ├── maintenance/       # Tickets, SLA
│   │   │   ├── hr/                # Employees, attendance
│   │   │   ├── payroll/           # Salary, payslips
│   │   │   └── ...                # + 19 more modules
│   │   └── database/
│   │       ├── data-source.ts     # TypeORM config
│   │       ├── migrations/        # SQL migrations
│   │       └── seeds/             # Demo data seeder
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                      # React SPA
│   ├── src/
│   │   ├── main.tsx               # Entry point
│   │   ├── App.tsx                # Router config
│   │   ├── index.css              # Tailwind + CSS variables
│   │   ├── i18n/                  # EN/AR translations
│   │   ├── stores/                # Zustand stores
│   │   ├── services/              # API client (Axios)
│   │   ├── layouts/               # Admin & Auth layouts
│   │   └── pages/                 # Route pages (stubs)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── infra/
│   └── prometheus/                # Monitoring config
├── .github/workflows/ci.yml      # CI/CD pipeline
├── docker-compose.yml             # Full stack orchestration
├── .env.example                   # Environment template
└── README.md
```

## Modules

| # | Module | Description |
|---|---|---|
| A1 | Multi-tenancy | Tenant isolation with RLS |
| A2 | Org Hierarchy | Company → Branch → Project → Phase → Building → Unit |
| A3 | Master Data | Currencies, taxes, payment methods, sequences |
| A4 | Approvals | Configurable multi-step approval workflows |
| A5 | Audit | Immutable audit log for all mutations |
| A6 | Documents | S3 storage with versioning |
| B | Properties | Unit catalog, pricing, availability, bulk import |
| C | CRM | Leads, opportunities, brokers, commissions, campaigns |
| D | Contracting | Bookings, contracts, KYC, cancellations, transfers |
| E | Collections | Installments, receipts, cheques, aging, dunning, refunds |
| F | Finance | COA, GL, journal entries, rev rec, bank reconciliation |
| G | Procurement | PR → RFQ → PO → GRN, vendors, inventory |
| H | Project Costing | WBS, budgets, contractor claims, change orders |
| I | Handover | Inspections, snag lists, maintenance tickets |
| J | HR & Payroll | Employees, attendance, leaves, payroll |
| K | Reporting | Dashboards, exports, statements |

## Key Design Decisions

- **Multi-tenancy**: Shared database with `tenant_id` column + PostgreSQL RLS
- **Concurrency**: Advisory locks + optimistic versioning for unit booking
- **Accounting**: Configurable rules engine maps business events → journal entries
- **Revenue Recognition**: Supports delivery-based, POC, and milestone methods
- **i18n**: Full EN/AR support with RTL layout
- **State Machines**: Formal state machines for units, bookings, contracts, cheques, installments, POs, claims, tickets

## Development

```bash
# Backend
cd backend
npm run start:dev        # Dev server with hot reload
npm run test:unit        # Unit tests
npm run test:integration # Integration tests (needs DB)
npm run migration:run    # Run pending migrations

# Frontend
cd frontend
npm run dev              # Vite dev server
npm run build            # Production build
npm run lint             # ESLint
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `DB_*` | PostgreSQL connection |
| `REDIS_*` | Redis connection |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token key (min 32 chars) |
| `S3_*` | MinIO/S3 storage config |
| `CORS_ORIGINS` | Allowed CORS origins |

## License

UNLICENSED — Proprietary
