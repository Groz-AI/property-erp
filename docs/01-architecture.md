# Real Estate ERP — System Architecture & Domain Boundaries

## 1. Technology Stack (Final Selection)

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Lucide Icons | Modern, fast DX, excellent i18n (EN/AR RTL), component library |
| **Backend** | NestJS (Node.js 20 LTS) + TypeScript | Same language as FE, strong DI/module system, TypeORM integration |
| **ORM** | TypeORM (with raw SQL for complex queries) | Mature, migration support, PostgreSQL-native features |
| **Database** | PostgreSQL 16 | JSONB, RLS, partitioning, excellent concurrency |
| **Cache** | Redis 7 | Session cache, rate limiting, pub/sub |
| **Queue** | BullMQ (Redis-backed) | Background jobs: reports, notifications, reconciliation |
| **Auth** | JWT (access + refresh) + Passport.js + optional OIDC | Stateless, scalable, SSO-ready |
| **Storage** | MinIO (S3-compatible) — prod: AWS S3 or equivalent | Document management, attachments |
| **Search** | PostgreSQL full-text search (upgrade path: Meilisearch) | Sufficient for MVP, low ops overhead |
| **Observability** | Pino (logs) + Prometheus (metrics) + OpenTelemetry (tracing) | Industry standard, Grafana dashboards |
| **Deployment** | Docker Compose (MVP) → Kubernetes (prod) | Progressive complexity |
| **CI/CD** | GitHub Actions | Widely adopted, easy Docker builds |
| **Testing** | Jest (unit/integration) + Playwright (E2E) + Supertest (API) | Full coverage pyramid |

---

## 2. Multi-Tenancy Strategy

**Decision: Shared database, tenant_id column + PostgreSQL Row-Level Security (RLS)**

### Justification
| Approach | Pros | Cons |
|---|---|---|
| Schema-per-tenant | Strong isolation | Migration complexity, connection pooling pain at scale |
| **tenant_id + RLS** ✅ | Simple migrations, single pool, RLS enforces isolation at DB level | Requires discipline; slightly less isolation |
| DB-per-tenant | Maximum isolation | Extremely complex ops |

### Implementation
- Every business table has `tenant_id UUID NOT NULL` as the first column after `id`.
- PostgreSQL RLS policies enforce `current_setting('app.tenant_id')` = `tenant_id`.
- Application sets `SET LOCAL app.tenant_id = '<uuid>'` at the start of every DB transaction.
- A `tenants` table stores config, domain mapping, feature flags, and subscription info.
- Indexes always include `tenant_id` as a leading column for query performance.

---

## 3. Domain-Driven Design — Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLATFORM CORE                             │
│  Tenants · Companies · Branches · Users · Roles · Permissions    │
│  Audit Logs · Approval Workflows · Document Mgmt · Notifications │
│  Settings · Master Data · Currencies · Taxes                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────────┐
    │                    │                         │
    ▼                    ▼                         ▼
┌──────────┐    ┌───────────────┐    ┌──────────────────────┐
│ PROPERTY │    │  CRM & SALES  │    │  FINANCE &           │
│ CATALOG  │    │               │    │  ACCOUNTING          │
│          │    │ Leads         │    │                      │
│ Projects │    │ Opportunities │    │ Chart of Accounts    │
│ Phases   │    │ Quotations    │    │ General Ledger       │
│ Buildings│    │ Brokers       │    │ Journal Entries      │
│ Floors   │    │ Campaigns     │    │ AR (Receivables)     │
│ Units    │    │ Commissions   │    │ AP (Payables)        │
│ Pricing  │    │               │    │ Cash & Bank          │
│          │    └───────┬───────┘    │ Revenue Recognition  │
└────┬─────┘            │            │ Fixed Assets         │
     │                  │            │ Financial Statements │
     │     ┌────────────┘            └──────────┬───────────┘
     │     │                                    │
     ▼     ▼                                    │
┌─────────────────┐                             │
│  CONTRACTING    │◄────────────────────────────┘
│                 │     (journal entries)
│ Bookings        │
│ Customers/KYC   │
│ Contracts       │
│ Payment Plans   │
│ Installments    │
│ Collections     │
│ Cancellations   │
│ Transfers       │
│ Refunds         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
│  HANDOVER &     │    │  PROCUREMENT &   │    │  HR &        │
│  AFTER-SALES    │    │  INVENTORY       │    │  PAYROLL     │
│                 │    │                  │    │              │
│ Handover Lists  │    │ Purchase Reqs    │    │ Employees    │
│ Snag Lists      │    │ RFQs / POs      │    │ Attendance   │
│ Maint. Tickets  │    │ GRN             │    │ Leaves       │
│ Warranty Track  │    │ Vendor Bills     │    │ Salary Struct│
│ Maint. Deposit  │    │ Vendors          │    │ Payroll Run  │
│                 │    │ Warehouses       │    │ Custody      │
└─────────────────┘    │ Stock Movements  │    └──────────────┘
                       │ Job Costing      │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  PROJECT COSTING │
                       │  & CONTRACTORS   │
                       │                  │
                       │ WBS / Budgets    │
                       │ Contractor Mgmt  │
                       │ Progress Claims  │
                       │ Change Orders    │
                       │ Site Overhead    │
                       └──────────────────┘
```

---

## 4. Hexagonal Architecture (per module)

```
              ┌─────────────────────────────┐
              │     Presentation Layer       │
              │  (REST Controllers / Guards) │
              └──────────┬──────────────────┘
                         │
              ┌──────────▼──────────────────┐
              │     Application Layer        │
              │  (Use Cases / Services)      │
              │  (Command/Query Handlers)    │
              └──────────┬──────────────────┘
                         │
              ┌──────────▼──────────────────┐
              │     Domain Layer             │
              │  (Entities, Value Objects,   │
              │   Domain Events, Rules)      │
              └──────────┬──────────────────┘
                         │
              ┌──────────▼──────────────────┐
              │     Infrastructure Layer     │
              │  (TypeORM Repos, Redis,      │
              │   S3, Email, Queue)          │
              └─────────────────────────────┘
```

Each NestJS module encapsulates one bounded context. Cross-module communication uses:
- **Synchronous**: Injected service interfaces (within same process)
- **Asynchronous**: Domain events via BullMQ (for side effects like journal entries, notifications)

---

## 5. API Architecture

- **RESTful** with consistent envelope: `{ data, meta, errors }`
- **Versioned**: `/api/v1/...`
- **Pagination**: cursor-based (default) or offset-based
- **Filtering**: `?filter[status]=available&filter[project_id]=uuid`
- **Sorting**: `?sort=-created_at,unit_code`
- **Idempotency**: `X-Idempotency-Key` header for all POST/PUT/PATCH (stored in Redis, 24h TTL)
- **Rate limiting**: per-tenant, per-user, configurable
- **Auth**: `Authorization: Bearer <access_token>`, refresh via `/auth/refresh`
- **Tenant resolution**: `X-Tenant-ID` header or subdomain extraction middleware

---

## 6. Database Architecture

### Key Design Decisions
1. **UUIDs** (v7 for time-sortability) as primary keys — no sequential IDs exposed
2. **Soft deletes** (`deleted_at TIMESTAMP`) on all business entities
3. **Optimistic locking** (`version INTEGER`) on concurrent entities (units, contracts)
4. **Temporal columns**: `created_at`, `updated_at`, `created_by`, `updated_by` on every table
5. **History tables** for status changes on critical entities (units, contracts, installments)
6. **JSONB columns** for flexible metadata/settings (with JSON Schema validation in app layer)
7. **Partitioning**: `audit_logs` partitioned by month; `journal_entries` partitioned by fiscal year
8. **Composite indexes**: `(tenant_id, ...)` on every query path

### Schema Groups
| Group | Est. Tables | Key Tables |
|---|---|---|
| Platform Core | ~20 | tenants, companies, branches, users, roles, permissions, audit_logs, approval_workflows, documents, settings |
| Property Catalog | ~15 | projects, phases, buildings, floors, units, unit_status_history, price_lists, price_list_items, promotions |
| CRM & Sales | ~12 | leads, lead_activities, opportunities, quotations, brokers, broker_agreements, commissions, campaigns |
| Contracting | ~15 | bookings, customers, customer_documents, contracts, contract_addendums, payment_plans, installments, collections, receipts, cheques, refunds |
| Finance | ~20 | chart_of_accounts, journal_entries, journal_lines, fiscal_periods, bank_accounts, cashboxes, bank_transactions, reconciliations, budgets, fixed_assets, depreciation_schedules |
| Procurement | ~12 | purchase_requisitions, rfqs, purchase_orders, po_lines, grns, grn_lines, vendors, vendor_contracts |
| Inventory | ~10 | warehouses, locations, items, stock_movements, stock_balances, inventory_counts |
| Project Costing | ~8 | wbs_items, wbs_budgets, contractors, contractor_contracts, progress_claims, claim_lines, change_orders |
| Handover | ~8 | handovers, handover_items, snag_lists, snag_items, maintenance_tickets, ticket_activities, maintenance_deposits |
| HR/Payroll | ~10 | employees, attendance, leaves, salary_structures, payroll_runs, payroll_lines, custody_items |
| **Total** | **~130** | |

---

## 7. Security Architecture

```
Internet → CloudFlare/WAF → Load Balancer → API Gateway (rate limit, auth)
                                                    │
                                              ┌─────┴─────┐
                                              │  NestJS    │
                                              │  App (N)   │
                                              └─────┬─────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    │               │               │
                                PostgreSQL      Redis          MinIO/S3
                                (encrypted)   (encrypted)    (encrypted)
```

- **Transport**: TLS 1.3 everywhere
- **At rest**: PostgreSQL TDE or volume encryption, S3 server-side encryption
- **Auth flow**: Login → access_token (15min) + refresh_token (7d, rotated)
- **RBAC**: Permission = `module:action:scope` (e.g., `units:update:own_project`)
- **Row-level**: Users see only data from their assigned companies/branches/projects
- **Audit**: Every mutating API call logged with user, IP, device, before/after payload hash
- **Input validation**: class-validator + class-transformer on every DTO
- **SQL injection**: Parameterized queries only (TypeORM + raw with parameters)
- **CORS**: Whitelist tenant domains only

---

## 8. Deployment Architecture (MVP → Production)

### MVP (Docker Compose)
```
docker-compose.yml
├── api          (NestJS app, 1 replica)
├── worker       (BullMQ worker, 1 replica)
├── web          (React SPA, nginx)
├── postgres     (PostgreSQL 16)
├── redis        (Redis 7)
├── minio        (S3-compatible storage)
└── prometheus   (metrics)
```

### Production (Kubernetes)
```
Namespace: re-erp
├── Deployments
│   ├── api (HPA: 2-10 pods)
│   ├── worker (2 pods)
│   └── web (2 pods, CDN-backed)
├── StatefulSets
│   ├── postgres (managed: RDS/CloudSQL preferred)
│   └── redis (managed: ElastiCache preferred)
├── Services + Ingress (TLS)
├── CronJobs (aging, dunning, report generation)
├── Secrets (env vars, DB creds, JWT keys)
└── PVCs (MinIO data, postgres data)
```

---

## 9. Module Communication & Event Flow

```
[User Action] → Controller → Service → Repository → DB
                                │
                                ├── Emit DomainEvent
                                │       │
                                │       ├── AuditLogListener → audit_logs table
                                │       ├── AccountingListener → journal_entries
                                │       ├── NotificationListener → BullMQ → email/SMS
                                │       └── SearchIndexListener → update search index
                                │
                                └── Return Response
```

**Critical domain events** (always produce journal entries):
- `BookingCreated`, `BookingCancelled`
- `ContractSigned`, `ContractCancelled`, `ContractTransferred`
- `PaymentReceived`, `ChequeCleared`, `ChequeBounced`
- `InstallmentDue`, `PenaltyApplied`
- `RefundApproved`, `RefundPaid`
- `PurchaseOrderApproved`, `GRNReceived`, `VendorBillPosted`
- `ProgressClaimApproved`, `RetentionReleased`
- `PayrollPosted`

---

## 10. Concurrency Strategy for Unit Booking

**Problem**: Two sales agents try to book the same unit simultaneously.

**Solution**: Pessimistic lock with advisory lock + optimistic version check.

```sql
-- Step 1: Acquire advisory lock on unit
SELECT pg_advisory_xact_lock(hashtext('unit:' || unit_id::text));

-- Step 2: Check unit status
SELECT status, version FROM units WHERE id = $1 AND tenant_id = $2;

-- Step 3: If Available, update to Reserved
UPDATE units SET status = 'reserved', version = version + 1
WHERE id = $1 AND version = $3;  -- optimistic check

-- Advisory lock auto-releases at transaction end
```

- Soft reservation expires after configurable timeout (e.g., 30 min).
- Background job sweeps expired reservations back to `available`.
- All status transitions validated by a state machine (see Workflows doc).

---

## 11. Internationalization (i18n)

- **Frontend**: react-i18next with namespace-per-module JSON files
- **Backend**: Accept-Language header, error messages localized
- **RTL**: Tailwind CSS RTL plugin for Arabic, `dir="rtl"` on `<html>`
- **Database**: Translatable fields stored as JSONB `{"en": "...", "ar": "..."}`
- **Dates**: ISO 8601 in DB/API, locale formatting in UI
- **Numbers**: Locale-aware formatting for currency, percentages
- **Reports**: PDF generation supports both LTR and RTL layouts

---

## 12. Folder Structure

```
erp-system/
├── docs/                          # All documentation deliverables
│   ├── 01-architecture.md
│   ├── 02-prd.md
│   ├── 03-user-stories.md
│   ├── 04-database-schema.md
│   ├── 05-api-specification.md
│   ├── 06-ui-specification.md
│   ├── 07-accounting-mapping.md
│   ├── 08-workflows.md
│   ├── 09-implementation-plan.md
│   ├── 10-testing-strategy.md
│   ├── 11-devops.md
│   ├── 12-demo-scenarios.md
│   └── 13-definition-of-done.md
├── backend/                       # NestJS application
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/                # Shared: guards, interceptors, decorators, pipes
│   │   ├── config/                # Configuration module
│   │   ├── database/              # TypeORM config, migrations, seeds
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tenants/
│   │   │   ├── companies/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── audit/
│   │   │   ├── approvals/
│   │   │   ├── documents/
│   │   │   ├── master-data/
│   │   │   ├── properties/        # Projects, phases, buildings, floors, units
│   │   │   ├── pricing/
│   │   │   ├── crm/               # Leads, opportunities, campaigns
│   │   │   ├── brokers/
│   │   │   ├── bookings/
│   │   │   ├── customers/
│   │   │   ├── contracts/
│   │   │   ├── installments/      # Payment plans, schedules
│   │   │   ├── collections/       # Receipts, cheques, allocation
│   │   │   ├── refunds/
│   │   │   ├── accounting/        # COA, GL, journal entries, fiscal periods
│   │   │   ├── cash-bank/
│   │   │   ├── accounts-payable/
│   │   │   ├── revenue-recognition/
│   │   │   ├── fixed-assets/
│   │   │   ├── reports/           # Financial statements, BI
│   │   │   ├── procurement/
│   │   │   ├── inventory/
│   │   │   ├── project-costing/
│   │   │   ├── contractors/
│   │   │   ├── handover/
│   │   │   ├── maintenance/
│   │   │   ├── hr/
│   │   │   ├── payroll/
│   │   │   └── notifications/
│   │   └── shared/                # DTOs, interfaces, enums, utils
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
├── frontend/                      # React application
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/            # Shared UI components
│   │   ├── layouts/               # Admin layout, auth layout
│   │   ├── pages/                 # One folder per module
│   │   ├── hooks/
│   │   ├── services/              # API client functions
│   │   ├── stores/                # Zustand state management
│   │   ├── i18n/                  # Locale files (en, ar)
│   │   ├── utils/
│   │   └── types/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/workflows/ci.yml
├── .env.example
└── README.md
```
