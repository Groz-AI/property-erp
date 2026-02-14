# Real Estate ERP — Implementation Plan

## 1. MVP Phasing Strategy

### Phase 1: Foundation (Sprints 1-4, 8 weeks)
Core platform, property catalog, basic CRM, booking flow.

### Phase 2: Contracting & Finance (Sprints 5-8, 8 weeks)
Contracts, installments, collections, GL, journal entries, basic reports.

### Phase 3: Procurement & Construction (Sprints 9-11, 6 weeks)
Procurement flow, inventory, contractors, WBS, project costing.

### Phase 4: Handover, HR & Polish (Sprints 12-14, 6 weeks)
Handover, after-sales, HR/payroll, dashboards, integrations.

### Phase 5: Hardening & Launch (Sprints 15-16, 4 weeks)
Performance, security audit, UAT, deployment, documentation.

**Total: ~32 weeks (8 months) with a 4-person engineering team.**

---

## 2. Sprint Breakdown

### Sprint 1 (Week 1-2): Project Setup & Auth
| Task | Priority | Est. |
|---|---|---|
| Monorepo setup (backend + frontend + docker) | High | 3d |
| NestJS scaffold: config, DB, Redis, S3 connections | High | 2d |
| React scaffold: Vite, Tailwind, shadcn/ui, routing, i18n | High | 2d |
| Auth module: register, login, JWT, refresh tokens | High | 3d |
| Auth guards, RBAC decorator, tenant middleware | High | 2d |
| Login/logout UI pages | High | 1d |
| Docker Compose (postgres, redis, minio, api, web) | High | 1d |
| CI pipeline (lint, test, build) | Medium | 1d |

### Sprint 2 (Week 3-4): Multi-Tenancy & Org Hierarchy
| Task | Priority | Est. |
|---|---|---|
| Tenant entity + RLS setup + tenant middleware | High | 3d |
| Company CRUD (API + UI) | High | 2d |
| Branch CRUD (API + UI) | High | 1d |
| User management (CRUD + role assignment) | High | 3d |
| Role management (CRUD + permission matrix UI) | High | 2d |
| Settings module (key-value store, API + UI) | Medium | 1d |
| Sequence counter service | Medium | 1d |
| Audit log interceptor + viewer UI | High | 2d |

### Sprint 3 (Week 5-6): Property Catalog
| Task | Priority | Est. |
|---|---|---|
| Project CRUD with hierarchy (phases, buildings, floors) | High | 3d |
| Unit entity with all attributes + status machine | High | 3d |
| Unit list with advanced filters (API + UI) | High | 2d |
| Unit detail page (tabs: details, history) | High | 1d |
| Unit status transitions with validation | High | 2d |
| Bulk import units (CSV/Excel parser + preview) | Medium | 2d |
| Unit availability map (visual grid) | Medium | 1d |

### Sprint 4 (Week 7-8): CRM & Booking
| Task | Priority | Est. |
|---|---|---|
| Currency + exchange rates + tax rules master data | High | 2d |
| Lead CRUD + activities + duplicate detection | High | 2d |
| Lead assignment rules (round-robin) | Medium | 1d |
| Opportunity pipeline (API + Kanban UI) | High | 2d |
| Quotation generation with price freeze | High | 2d |
| Customer CRUD + KYC + documents | High | 2d |
| Booking creation (multi-step form + concurrency lock) | High | 3d |
| Booking cancellation + expiry cron | High | 1d |
| Price lists + promotions (API + UI) | Medium | 2d |

### Sprint 5 (Week 9-10): Contracts & Payment Plans
| Task | Priority | Est. |
|---|---|---|
| Contract creation from booking | High | 3d |
| Contract signing flow + status transitions | High | 2d |
| Payment plan templates (API + UI) | High | 2d |
| Installment schedule engine (generation + rounding) | High | 3d |
| Contract detail page (tabs: terms, schedule, docs) | High | 2d |
| Contract addendums | Medium | 1d |
| Document template engine (HTML→PDF) | Medium | 2d |

### Sprint 6 (Week 11-12): Collections & AR
| Task | Priority | Est. |
|---|---|---|
| Receipt creation + auto-allocation (FIFO) | High | 3d |
| Manual allocation override | High | 1d |
| Cheque entity + lifecycle management | High | 2d |
| Cheque status transitions + bounced cheque handling | High | 2d |
| Installment status update cron (due/overdue) | High | 1d |
| Penalty calculation engine | High | 2d |
| Customer statement generation | High | 2d |
| Aging report | High | 1d |
| Dunning actions (basic) | Medium | 1d |

### Sprint 7 (Week 13-14): General Ledger & Accounting
| Task | Priority | Est. |
|---|---|---|
| Chart of Accounts (CRUD + tree UI) | High | 2d |
| Fiscal periods management | High | 1d |
| Journal entry (CRUD + balanced validation) | High | 3d |
| Journal posting + reversal | High | 2d |
| Accounting rules engine (event → JE mapping) | High | 3d |
| Auto-JE for: booking fee, contract sign, receipts | High | 2d |
| General ledger view (account drilldown) | High | 1d |
| Cost centers | Medium | 1d |

### Sprint 8 (Week 15-16): Financial Reports & Banking
| Task | Priority | Est. |
|---|---|---|
| Trial balance report | High | 2d |
| Income statement (P&L) | High | 2d |
| Balance sheet | High | 2d |
| Bank accounts + cashboxes management | High | 2d |
| Bank transaction register | High | 1d |
| Internal transfers (bank↔cashbox) | Medium | 1d |
| Bank reconciliation (import + match) | Medium | 3d |
| Auto-JE for: penalties, cheque clear/bounce, refunds | High | 2d |

### Sprint 9 (Week 17-18): Cancellations, Transfers, Refunds
| Task | Priority | Est. |
|---|---|---|
| Contract cancellation with penalty calc | High | 2d |
| Ownership transfer flow | High | 3d |
| Unit swap flow | High | 2d |
| Refund workflow (request → approve → pay) | High | 2d |
| Approval workflow engine (configurable) | High | 3d |
| Approval inbox UI | High | 1d |
| Broker module (profiles, agreements, commissions) | High | 2d |
| Commission calculation engine | Medium | 2d |

### Sprint 10 (Week 19-20): Procurement
| Task | Priority | Est. |
|---|---|---|
| Vendor master (CRUD + UI) | High | 1d |
| Purchase requisition (CRUD + approval) | High | 2d |
| RFQ + vendor response comparison | Medium | 2d |
| Purchase order (CRUD + approval + status) | High | 3d |
| GRN (receive against PO + partial delivery) | High | 2d |
| Vendor bills + 3-way match | High | 2d |
| Vendor payments | High | 1d |
| Auto-JE for procurement events | High | 1d |

### Sprint 11 (Week 21-22): Inventory & Project Costing
| Task | Priority | Est. |
|---|---|---|
| Item master + warehouses + locations | High | 2d |
| Stock movements (receive, issue, transfer, adjust) | High | 3d |
| Stock balances (real-time) | High | 1d |
| Material issue to project/WBS | High | 2d |
| Inventory count + variance | Medium | 2d |
| WBS tree + budgets | High | 2d |
| WBS cost tracking (committed + actual) | High | 1d |
| Auto-JE for inventory events | High | 1d |

### Sprint 12 (Week 23-24): Contractors & Handover
| Task | Priority | Est. |
|---|---|---|
| Contractor master + contracts | High | 2d |
| Progress claims (create, deductions, approval) | High | 3d |
| Retention tracking + release | High | 2d |
| Change orders | Medium | 1d |
| Handover checklists + inspection flow | High | 2d |
| Snag list management | High | 1d |
| Final handover + signature capture | High | 1d |
| Auto-JE for contractor/handover events | High | 1d |
| Revenue recognition engine | High | 2d |

### Sprint 13 (Week 25-26): HR, Payroll & After-Sales
| Task | Priority | Est. |
|---|---|---|
| Employee master + departments | Medium | 2d |
| Attendance tracking | Medium | 1d |
| Leave management (types, balances, requests) | Medium | 2d |
| Salary structures | Medium | 1d |
| Payroll run (calculate, approve, post) | Medium | 3d |
| Payslip generation (PDF) | Medium | 1d |
| Maintenance tickets (CRUD + SLA + workflow) | High | 2d |
| Maintenance deposit tracking | Medium | 1d |
| Employee advances + custody | Low | 1d |

### Sprint 14 (Week 27-28): Dashboards & Exports
| Task | Priority | Est. |
|---|---|---|
| Executive dashboard (KPI widgets) | High | 2d |
| Sales dashboard (funnel, trends, leaderboard) | High | 2d |
| Collections dashboard (targets, DSO, aging) | High | 2d |
| Project cost dashboard | Medium | 1d |
| Report export to Excel/CSV | High | 2d |
| Report export to PDF | High | 2d |
| Customer/broker/contractor statements | High | 2d |
| Notification system (in-app + email) | Medium | 2d |

### Sprint 15 (Week 29-30): Security & Performance
| Task | Priority | Est. |
|---|---|---|
| Security audit: injection, XSS, CSRF, auth bypass | High | 2d |
| Rate limiting implementation | High | 1d |
| Input validation review (all DTOs) | High | 2d |
| Performance profiling + query optimization | High | 2d |
| Database index tuning | High | 1d |
| Caching strategy (Redis for hot data) | Medium | 2d |
| Load testing (k6 or artillery) | High | 2d |
| API documentation (Swagger/OpenAPI) | High | 1d |
| Encryption at rest for sensitive fields | Medium | 1d |

### Sprint 16 (Week 31-32): UAT & Deployment
| Task | Priority | Est. |
|---|---|---|
| Seed data + demo scenarios | High | 2d |
| End-to-end testing (Playwright) | High | 3d |
| User acceptance testing support | High | 3d |
| Bug fixes from UAT | High | 3d |
| Production Docker/K8s setup | High | 2d |
| Monitoring + alerting setup | High | 1d |
| Backup + restore verification | High | 1d |
| Documentation finalization | Medium | 1d |
| Go-live checklist execution | High | 1d |

---

## 3. Team Composition

| Role | Count | Responsibility |
|---|---|---|
| Tech Lead / Architect | 1 | Architecture, code review, DB design, complex modules |
| Backend Developer | 1 | API development, business logic, integrations |
| Frontend Developer | 1 | UI implementation, state management, responsive |
| Full-Stack Developer | 1 | Across stack, accounting module, reports |
| QA Engineer | 0.5 | Test strategy, E2E tests, UAT coordination |
| DevOps | 0.5 | CI/CD, Docker, monitoring, deployment |

---

## 4. Risk Register

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Accounting logic complexity | High | High | Hire/consult with finance SME; extensive test scenarios |
| Concurrency bugs in booking | High | Medium | Advisory locks + optimistic locking + stress tests |
| Performance at scale | Medium | Medium | Early load testing, query profiling, caching |
| Scope creep | High | High | Strict MVP phases, change control process |
| Multi-tenancy data leak | Critical | Low | RLS + middleware + penetration testing |
| i18n/RTL issues | Medium | Medium | Early Arabic testing, RTL-first Tailwind config |
| Complex state machines | Medium | Medium | Comprehensive state machine tests, visual diagrams |
| Integration dependencies | Low | Medium | Stub all external integrations, feature flags |

---

## 5. Definition of Ready (per story)

- [ ] User story clearly written with acceptance criteria
- [ ] UI mockup/wireframe available (if UI story)
- [ ] API contract agreed (request/response shapes)
- [ ] Database schema changes identified
- [ ] Accounting impact documented (if applicable)
- [ ] Dependencies identified and resolved
- [ ] Estimated and sized

## 6. Definition of Done (per story)

- [ ] Code written, reviewed, merged
- [ ] Unit tests passing (>80% coverage for business logic)
- [ ] Integration test for API endpoint
- [ ] UI responsive and RTL tested
- [ ] Audit logging implemented
- [ ] Journal entry generated (if financial operation)
- [ ] Validation complete (DTO + business rules)
- [ ] Error handling with proper error codes
- [ ] API documentation updated
- [ ] No linting/type errors
