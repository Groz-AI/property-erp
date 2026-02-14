# Real Estate ERP — Definition of Done Checklist

## 1. Module Completion Checklist

### A) Platform Core
- [ ] Tenant CRUD with RLS enforcement verified
- [ ] Company / Branch / Project hierarchy CRUD
- [ ] User registration, login, JWT auth, refresh token rotation
- [ ] RBAC: roles, permissions, role templates, per-module privileges
- [ ] Row-level access: users see only assigned companies/branches/projects
- [ ] Audit log interceptor captures all mutations with who/what/when/IP
- [ ] Immutable financial event log with hash chain
- [ ] Approval workflow engine: configurable matrix, multi-step, delegation
- [ ] Document upload/download/versioning to S3
- [ ] Document template engine (HTML→PDF) for contracts, receipts, invoices
- [ ] Settings key-value store (tenant/company/branch/project scope)
- [ ] Sequence counter service (customizable numbering patterns)
- [ ] Master data: currencies, exchange rates, tax rules, payment methods
- [ ] Notification system (in-app + email stubs)
- [ ] i18n: EN/AR with RTL support on all screens

### B) Property Catalog & Availability
- [ ] Project → Phase → Building → Floor → Unit hierarchy CRUD
- [ ] Unit attributes: type, areas, orientation, view, finishing, price
- [ ] Unit status state machine with validation (all transitions)
- [ ] Unit status history tracking with reason and reference
- [ ] Bulk import units from CSV/Excel with validation and error report
- [ ] Price lists with effective dates and override hierarchy
- [ ] Promotions with discount rules, validity, and approval threshold
- [ ] Price freeze on quotation with configurable duration
- [ ] Soft reservation with auto-expiry (cron job)
- [ ] Concurrency lock preventing double booking (advisory lock + optimistic version)
- [ ] Unit availability filters (project, type, beds, area, price, status)
- [ ] Visual availability map (grid by building/floor)

### C) CRM & Sales
- [ ] Lead CRUD with source, channel, campaign, interest
- [ ] Lead scoring, auto-assignment (round-robin), SLA timers
- [ ] Lead duplicate detection on phone/email
- [ ] Lead activities (calls, meetings, visits, notes)
- [ ] Opportunity pipeline (stages, Kanban UI)
- [ ] Quotation generation with price and payment plan
- [ ] Convert lead → opportunity → booking flow
- [ ] Broker profiles and agreements
- [ ] Commission calculation: fixed, percentage, tiered, milestone
- [ ] Commission approval workflow and payout scheduling
- [ ] Withholding tax on commissions
- [ ] Campaign management with ROI metrics

### D) Booking → Contracting → Legal
- [ ] Booking creation: customer + unit + price + plan + fee
- [ ] Booking fee handling (refundable/non-refundable/deducted)
- [ ] Booking validity with auto-expiry (cron)
- [ ] Booking cancellation with fee calculation
- [ ] Customer CRUD with KYC fields and document uploads
- [ ] Co-buyers and beneficiaries
- [ ] Contract creation from booking
- [ ] Contract template with merge fields → PDF
- [ ] Contract signing triggers: unit→sold, schedule generated, JE posted
- [ ] Contract addendums (versioned, approved)
- [ ] Contract cancellation with penalty, refund calculation, approval
- [ ] Ownership transfer (old contract closed, new created, fees)
- [ ] Unit swap (price adjustment, new schedule, approval)

### E) Installments & Collections
- [ ] Payment plan templates (configurable components)
- [ ] Installment schedule engine with rounding and exact total match
- [ ] Rescheduling: extend, defer, restructure — with approval
- [ ] Receipt creation with payment method and reference
- [ ] Auto-allocation (FIFO) and manual allocation override
- [ ] Partial payments update installment to partially_paid
- [ ] Cheque lifecycle: received → deposited → cleared/bounced
- [ ] Bounced cheque: reversal + penalty application
- [ ] Cheque replacement flow
- [ ] Installment status cron (upcoming → due → overdue)
- [ ] Penalty calculation (fixed/percentage/daily, with cap and grace)
- [ ] Penalty waiver with approval
- [ ] Customer statement generation
- [ ] Aging report (current, 1-30, 31-60, 61-90, 90+)
- [ ] Dunning actions (configurable escalation)
- [ ] Refund workflow: request → approve → pay
- [ ] Settlement agreements (partial refund + new schedule)

### F) Finance & Accounting
- [ ] Chart of accounts: hierarchical, template-loaded, customizable
- [ ] Fiscal period management (open/close/lock)
- [ ] Journal entry CRUD with balanced validation
- [ ] Journal posting, reversal
- [ ] Accounting rules engine: event → debit/credit mapping
- [ ] Auto-JE for all business events (booking, contract, receipt, penalty, refund, cheque, procurement, payroll)
- [ ] General ledger view (account drilldown)
- [ ] Trial balance (summary + detailed)
- [ ] Income statement (P&L) with period/project filters
- [ ] Balance sheet as of date
- [ ] Cash flow statement (indirect method)
- [ ] Bank account and cashbox management
- [ ] Internal transfers (bank ↔ cashbox)
- [ ] Bank reconciliation (import CSV, auto-match, manual match)
- [ ] Vendor bill entry with line items and tax
- [ ] Vendor payment with withholding tax
- [ ] 3-way match (PO-GRN-Bill)
- [ ] Vendor aging report
- [ ] Revenue recognition engine (delivery, POC, milestone)
- [ ] Monthly rev rec run with deferred revenue schedule
- [ ] Fixed asset register with depreciation (straight-line, declining)
- [ ] Monthly depreciation run → JE
- [ ] Budget entry and budget vs actual report
- [ ] Multi-currency with forex gain/loss
- [ ] Cost center dimension on journal lines
- [ ] Intercompany journal entries

### G) Procurement & Inventory
- [ ] Vendor master CRUD
- [ ] Purchase requisition with approval
- [ ] RFQ and vendor response comparison
- [ ] Purchase order with approval workflow
- [ ] GRN (receive against PO, partial delivery tracking)
- [ ] Item master with categories, UoM, reorder levels
- [ ] Warehouse and location management
- [ ] Stock movements: receive, issue, transfer, adjust
- [ ] Material issue to project/WBS with job costing
- [ ] Real-time stock balances
- [ ] Weighted average cost calculation
- [ ] Inventory count (cycle and full) with variance adjustment
- [ ] Auto-JE for all inventory events

### H) Project Costing & Contractors
- [ ] WBS tree with hierarchy per project
- [ ] WBS budget entry (planned, committed, actual)
- [ ] Variance tracking and alerts on overrun
- [ ] Contractor master CRUD
- [ ] Contractor contract with milestones, retention, penalties
- [ ] Progress claim creation with line items
- [ ] Auto-deductions: advance recovery, retention, penalties, back-charges
- [ ] Claim approval workflow (multi-level)
- [ ] Retention tracking and release schedule
- [ ] Change orders with cost/time impact and approval
- [ ] Site overhead allocation
- [ ] Auto-JE for contractor events

### I) Handover & After-Sales
- [ ] Handover checklists (configurable per project/unit type)
- [ ] Initial inspection with pass/fail per item, photos
- [ ] Snag list auto-generated from failed items
- [ ] Snag assignment to contractor
- [ ] Final handover with customer signature capture
- [ ] Handover report PDF
- [ ] Unit status → Delivered on handover completion
- [ ] Revenue recognition trigger on delivery
- [ ] Maintenance ticket CRUD with SLA tracking
- [ ] Ticket assignment and workflow (open → closed)
- [ ] Warranty period check (auto-flag)
- [ ] Maintenance deposit separate ledger
- [ ] Maintenance deposit spending with approval

### J) HR & Payroll
- [ ] Employee profiles with department, job info, documents
- [ ] Attendance tracking (check-in/out)
- [ ] Leave types, balances, requests, approvals
- [ ] Salary structure (basic + components)
- [ ] Monthly payroll run: calculate, approve, post
- [ ] Payslip PDF generation
- [ ] Payroll journal entry to GL
- [ ] Employee advances with salary deduction
- [ ] Employee custody tracking

### K) BI & Reporting
- [ ] Executive dashboard (KPI widgets)
- [ ] Sales dashboard (funnel, trends, agent performance)
- [ ] Collections dashboard (targets, DSO, aging chart)
- [ ] Project cost dashboard (budget vs actual)
- [ ] All reports exportable to Excel/CSV
- [ ] PDF generation with branded templates
- [ ] Customer statement, broker statement, contractor statement
- [ ] Unit analytics (velocity, avg price, availability)

---

## 2. Cross-Cutting Quality Checklist

### Security
- [ ] All API endpoints require authentication (except login, health)
- [ ] RBAC enforced on every endpoint
- [ ] Tenant isolation verified (no cross-tenant data access)
- [ ] Row-level security tested with multiple tenants
- [ ] Input validation on all DTOs (class-validator)
- [ ] SQL injection prevention (parameterized queries only)
- [ ] XSS prevention (output encoding)
- [ ] CORS configured per tenant domain
- [ ] Rate limiting per tenant/user
- [ ] Passwords hashed with bcrypt (cost factor 12)
- [ ] JWT secrets are strong (32+ chars)
- [ ] Refresh token rotation implemented
- [ ] Account lockout after failed login attempts
- [ ] Sensitive fields encrypted at rest
- [ ] No secrets in code or logs
- [ ] Security headers (HSTS, CSP, X-Frame-Options)

### Data Integrity
- [ ] All financial operations create audit logs
- [ ] All status changes create history records
- [ ] Immutable financial event log with checksums
- [ ] Optimistic locking on concurrent entities (units, contracts)
- [ ] Advisory locks for booking concurrency
- [ ] Idempotency keys prevent duplicate operations
- [ ] Journal entries always balanced (debit = credit)
- [ ] Installment schedule total matches contract amount exactly
- [ ] Payment allocation total matches receipt amount
- [ ] No orphaned records (FK constraints enforced)
- [ ] Soft deletes prevent data loss

### Performance
- [ ] API P95 response time < 500ms
- [ ] Dashboard load < 3 seconds
- [ ] Batch operations (bulk import) handle 1000+ records
- [ ] Database indexes on all query paths
- [ ] N+1 query prevention (eager loading where needed)
- [ ] Connection pooling configured
- [ ] Redis caching for hot data (settings, permissions)
- [ ] Background jobs for heavy operations (reports, rev rec)
- [ ] Load tested with 100+ concurrent users

### UI/UX
- [ ] All screens responsive (mobile, tablet, desktop)
- [ ] RTL layout works correctly for Arabic
- [ ] All user-facing text is translatable (i18n keys)
- [ ] Form validation shows inline errors
- [ ] Loading states on all async operations
- [ ] Error messages are user-friendly (not stack traces)
- [ ] Navigation breadcrumbs on all pages
- [ ] Consistent component usage (shadcn/ui)
- [ ] Print-friendly layouts for statements and reports
- [ ] Keyboard navigation support
- [ ] Color-coded status badges consistent across modules

### Testing
- [ ] Unit test coverage > 80% for business logic
- [ ] Integration tests for all API endpoints
- [ ] E2E tests for 15 critical user flows
- [ ] Concurrency tests for booking/payment
- [ ] Tenant isolation test suite
- [ ] Accounting balance tests (TB balances, JE balanced)
- [ ] Seed data loads without errors
- [ ] All tests pass in CI pipeline

### DevOps
- [ ] Docker Compose runs locally with `docker-compose up`
- [ ] CI pipeline: lint → type-check → unit test → integration test → build
- [ ] Docker images build successfully
- [ ] Health check endpoint returns status of all dependencies
- [ ] Prometheus metrics endpoint exposed
- [ ] Grafana dashboards configured (API, DB, Redis)
- [ ] Backup script tested (backup + restore)
- [ ] Environment variables documented in .env.example
- [ ] README with setup instructions
- [ ] Database migrations run cleanly from scratch
- [ ] Seed script creates demo data successfully

### Documentation
- [ ] Architecture document complete
- [ ] PRD with roles and permissions matrix
- [ ] User stories with acceptance criteria
- [ ] Database schema with all tables, fields, indexes
- [ ] API specification with request/response examples
- [ ] UI specification with screen list and flows
- [ ] Accounting mapping (event → journal entries)
- [ ] Workflow diagrams (state machines)
- [ ] Implementation plan with sprints
- [ ] Testing strategy
- [ ] DevOps guide (Docker, CI/CD, deployment)
- [ ] Demo scenarios and seed data
- [ ] This Definition of Done checklist
- [ ] OpenAPI/Swagger spec auto-generated from code

---

## 3. Launch Readiness Checklist

### Pre-Launch
- [ ] All module checklists above are complete
- [ ] UAT sign-off from product owner
- [ ] Security penetration test passed
- [ ] Load test passed at expected capacity
- [ ] Data migration tool tested (if migrating from existing system)
- [ ] Backup and restore verified end-to-end
- [ ] Monitoring and alerting configured and tested
- [ ] Runbook for common operations documented
- [ ] Support team trained on system
- [ ] End-user training materials prepared
- [ ] DNS and SSL certificates configured
- [ ] Production environment provisioned and hardened

### Launch Day
- [ ] Final backup of any existing data
- [ ] Data migration executed (if applicable)
- [ ] Application deployed to production
- [ ] Smoke test all critical flows in production
- [ ] Monitoring dashboards verified — all green
- [ ] Admin accounts created for client
- [ ] Communication sent to users
- [ ] Support channel open (Slack/Teams/helpdesk)

### Post-Launch (Week 1)
- [ ] Monitor error rates — target < 0.1%
- [ ] Monitor response times — target P95 < 500ms
- [ ] Address any critical bugs within 4 hours
- [ ] Collect user feedback
- [ ] Review audit logs for anomalies
- [ ] Verify backup jobs running on schedule
- [ ] Performance baseline established
