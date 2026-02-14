# Real Estate ERP — API Specification

## Conventions

- **Base URL**: `https://{tenant}.erp.example.com/api/v1`
- **Auth**: `Authorization: Bearer <access_token>`
- **Tenant**: Resolved from subdomain or `X-Tenant-ID` header
- **Idempotency**: `X-Idempotency-Key: <uuid>` on all POST/PUT/PATCH
- **Pagination**: `?page=1&limit=25` (offset) or `?cursor=<token>&limit=25` (cursor)
- **Filtering**: `?filter[status]=available&filter[project_id]=<uuid>`
- **Sorting**: `?sort=-created_at,unit_code` (prefix `-` for DESC)
- **Includes**: `?include=project,customer` (eager load relations)
- **Fields**: `?fields=id,unit_code,status,total_price` (sparse fieldsets)

### Response Envelope
```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 25, "total": 150, "cursor": "..." },
  "errors": []
}
```

### Error Format
```json
{
  "errors": [{
    "code": "UNIT_NOT_AVAILABLE",
    "message": "Unit is already reserved",
    "field": "unit_id",
    "details": { "current_status": "reserved" }
  }]
}
```

### HTTP Status Codes
| Code | Usage |
|---|---|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (no permission) |
| 404 | Not found |
| 409 | Conflict (concurrency, duplicate) |
| 422 | Business rule violation |
| 429 | Rate limited |
| 500 | Server error |

---

## A) Authentication & Users

### POST /auth/login
```json
// Request
{ "email": "admin@acme.com", "password": "securePass123!" }
// Response 200
{
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 900,
    "user": { "id": "uuid", "email": "admin@acme.com", "first_name": "Admin", "roles": ["tenant_admin"] }
  }
}
```

### POST /auth/refresh
```json
// Request
{ "refresh_token": "eyJ..." }
// Response 200
{ "data": { "access_token": "eyJ...", "refresh_token": "eyJ...", "expires_in": 900 } }
```

### POST /auth/logout
Invalidates refresh token. Returns 204.

### GET /auth/me
Returns current user profile with roles, permissions, assigned companies/branches/projects.

### CRUD /users
- `GET /users` — List users (filterable by role, company, branch, status)
- `POST /users` — Create user (Tenant Admin+)
- `GET /users/:id` — Get user details
- `PATCH /users/:id` — Update user
- `DELETE /users/:id` — Soft delete user
- `POST /users/:id/roles` — Assign role `{ role_id, company_id?, branch_id?, project_id? }`
- `DELETE /users/:id/roles/:roleAssignmentId` — Remove role

### CRUD /roles
- `GET /roles` — List roles
- `POST /roles` — Create custom role `{ name, permissions: [{ module, action, scope }] }`
- `PATCH /roles/:id` — Update role
- `DELETE /roles/:id` — Delete custom role (not system roles)

---

## B) Organization

### CRUD /companies
```json
// POST /companies
{
  "name": "Acme Real Estate",
  "legal_name": "Acme RE LLC",
  "tax_id": "123456789",
  "default_currency_code": "AED",
  "fiscal_year_start_month": 1,
  "address": { "line1": "123 Main St", "city": "Dubai", "country": "AE" }
}
// Response 201
{ "data": { "id": "uuid", "name": "Acme Real Estate", ... } }
```

### CRUD /companies/:companyId/branches
### CRUD /master-data/currencies
### CRUD /master-data/exchange-rates
### CRUD /master-data/tax-rules
### CRUD /master-data/payment-methods
### GET/PUT /settings (scope query params)

---

## C) Property Catalog

### CRUD /projects
```json
// POST /projects
{
  "company_id": "uuid", "branch_id": "uuid",
  "name": "Sunset Gardens", "code": "SG",
  "project_type": "residential",
  "location": { "city": "Dubai", "country": "AE", "lat": 25.2, "lng": 55.3 },
  "expected_start": "2026-03-01", "expected_end": "2028-12-31",
  "revenue_recognition_method": "delivery_based",
  "default_price_per_sqm": 15000, "default_currency_code": "AED",
  "settings": { "booking_validity_days": 14, "soft_reservation_minutes": 30 }
}
```

### CRUD /projects/:projectId/phases
### CRUD /projects/:projectId/buildings
### CRUD /buildings/:buildingId/floors
### CRUD /floors/:floorId/units

### GET /units
List with full filtering: `?filter[project_id]=uuid&filter[status]=available&filter[unit_type]=apartment&filter[bedrooms_gte]=2&filter[total_price_lte]=2000000&sort=-total_area&limit=50`

### POST /units/bulk-import
```json
// Multipart form: file (CSV/Excel)
// Response 200
{ "data": { "imported": 45, "errors": [{ "row": 3, "field": "unit_type", "message": "Invalid value" }] } }
```

### POST /units/:id/soft-reserve
```json
// Response 200
{ "data": { "unit_id": "uuid", "status": "soft_reserved", "expires_at": "2026-02-10T22:00:00Z" } }
```

### PATCH /units/:id/status
```json
{ "status": "blocked", "reason": "Legal dispute" }
// Validates state machine transitions
```

### GET /units/:id/history
Returns status change history.

### CRUD /price-lists
### CRUD /price-lists/:id/items
### CRUD /promotions

---

## D) CRM & Sales

### CRUD /leads
```json
// POST /leads
{
  "first_name": "Ahmed", "last_name": "Hassan",
  "phone": "+971501234567", "email": "ahmed@example.com",
  "source": "website", "campaign_id": "uuid",
  "interested_project_id": "uuid", "interested_unit_type": "apartment",
  "budget_min": 1000000, "budget_max": 2000000
}
// Response 201 — includes auto-assigned agent if rules configured
```

### POST /leads/:id/activities
```json
{ "activity_type": "call", "subject": "Initial contact", "outcome": "interested", "description": "Customer interested in 2BR" }
```

### POST /leads/:id/convert-to-opportunity
Converts lead to opportunity. Returns opportunity.

### CRUD /opportunities
### POST /opportunities/:id/quotations
```json
{
  "unit_id": "uuid",
  "discount_type": "percentage", "discount_value": 5,
  "payment_plan_template_id": "uuid",
  "freeze_price": true
}
// Response 201 — quotation with calculated prices and frozen price expiry
```

### POST /opportunities/:id/convert-to-booking
Validates unit availability, creates booking atomically.

### CRUD /brokers
### CRUD /broker-agreements
### GET /brokers/:id/commissions
### GET /brokers/:id/statement

### CRUD /campaigns
### GET /campaigns/:id/analytics

---

## E) Booking & Contracting

### POST /bookings
```json
{
  "customer_id": "uuid", "unit_id": "uuid",
  "unit_price": 1500000, "discount_amount": 75000, "net_price": 1425000,
  "currency_code": "AED",
  "booking_fee": 50000, "booking_fee_type": "deducted_from_first",
  "payment_plan_template_id": "uuid",
  "broker_id": "uuid",
  "notes": "Customer prefers corner unit"
}
// Response 201
// Side effects: unit → reserved, booking receipt generated, audit log, journal entry (if booking fee paid)
```
Auth: `bookings:create` permission + unit in assigned project.

### POST /bookings/:id/cancel
```json
{ "reason": "Customer changed mind", "cancellation_fee": 5000 }
// Requires approval if configured. Returns approval_request_id or cancelled booking.
```

### CRUD /customers
### POST /customers/:id/documents (multipart upload)
### GET /customers/:id/co-buyers

### POST /contracts
```json
{
  "booking_id": "uuid",
  "contract_date": "2026-02-15",
  "expected_delivery": "2028-06-30",
  "warranty_months": 12,
  "maintenance_deposit": 25000,
  "terms": { "penalty_clause": "...", "force_majeure": "..." }
}
// Response 201 — contract in 'draft' status
```

### POST /contracts/:id/sign
```json
{ "signed_by_customer": true, "signed_by_company": true }
// Side effects: status → signed/active, unit → sold, installment schedule generated, journal entries
```

### POST /contracts/:id/addendums
```json
{
  "addendum_type": "price_change",
  "description": "Price reduction per negotiation",
  "new_values": { "net_price": 1400000 }
}
```

### POST /contracts/:id/cancel
### POST /contracts/:id/transfer
```json
{ "new_customer_id": "uuid", "transfer_fee": 10000 }
```

---

## F) Installments & Collections

### GET /contracts/:id/installments
Returns full installment schedule with status, paid amounts, penalties.

### POST /contracts/:id/installments/reschedule
```json
{
  "method": "extend",
  "extend_months": 6,
  "reason": "Customer financial difficulty"
}
// Requires approval. Returns new proposed schedule for review.
```

### POST /receipts
```json
{
  "customer_id": "uuid", "contract_id": "uuid",
  "amount": 50000, "currency_code": "AED",
  "payment_method": "bank_transfer",
  "payment_date": "2026-02-10",
  "reference_number": "TRF-2026-001",
  "bank_account_id": "uuid",
  "allocations": [
    { "installment_id": "uuid", "amount": 45000, "penalty_amount": 5000 }
  ]
}
// Response 201 — receipt confirmed, installment updated, journal entry created
```

### POST /receipts (auto-allocate)
Omit `allocations` — system allocates FIFO.

### POST /receipts/:id/reverse
```json
{ "reason": "Cheque bounced" }
```

### CRUD /cheques
### PATCH /cheques/:id/status
```json
{ "new_status": "deposited", "deposited_to_bank_id": "uuid" }
// Validates lifecycle transitions
```

### GET /customers/:id/aging
### GET /aging-report?filter[project_id]=uuid
### POST /dunning-actions
### GET /customers/:id/statement

### POST /refunds
```json
{
  "customer_id": "uuid", "contract_id": "uuid",
  "reason": "Contract cancellation",
  "total_paid": 500000, "penalty_amount": 50000, "admin_fee": 10000,
  "refund_amount": 440000, "refund_method": "bank_transfer",
  "bank_details": { "bank_name": "ABC Bank", "iban": "AE..." }
}
// Requires approval workflow
```

---

## G) Finance & Accounting

### CRUD /chart-of-accounts
```json
// POST /chart-of-accounts
{
  "company_id": "uuid", "account_code": "1100",
  "name": "Accounts Receivable", "name_ar": "الذمم المدينة",
  "account_type": "asset", "sub_type": "accounts_receivable",
  "parent_id": "uuid", "normal_balance": "debit"
}
```

### CRUD /journal-entries
```json
// POST /journal-entries
{
  "company_id": "uuid", "entry_date": "2026-02-10",
  "reference": "Manual adjustment",
  "description": "Accrue Q1 utilities",
  "currency_code": "AED",
  "lines": [
    { "account_id": "uuid", "debit": 10000, "credit": 0, "description": "Utilities expense", "project_id": "uuid" },
    { "account_id": "uuid", "debit": 0, "credit": 10000, "description": "Accrued expenses" }
  ]
}
// Validation: total_debit must equal total_credit
```

### POST /journal-entries/:id/post
### POST /journal-entries/:id/reverse

### GET /general-ledger?account_id=uuid&from=2026-01-01&to=2026-12-31
### GET /trial-balance?company_id=uuid&as_of=2026-02-28
### GET /income-statement?company_id=uuid&from=2026-01-01&to=2026-03-31&project_id=uuid
### GET /balance-sheet?company_id=uuid&as_of=2026-02-28
### GET /cash-flow?company_id=uuid&from=2026-01-01&to=2026-03-31

### CRUD /fiscal-periods
### POST /fiscal-periods/:id/close
### POST /fiscal-periods/:id/reopen

### CRUD /bank-accounts
### CRUD /cashboxes
### POST /bank-transfers `{ from_id, to_id, amount, date }`
### POST /bank-reconciliations
### POST /bank-reconciliations/:id/import-statement (CSV upload)
### POST /bank-reconciliations/:id/match

### CRUD /accounting-rules
### POST /revenue-recognition/run `{ company_id, period_date }`
### GET /revenue-recognition/schedules?contract_id=uuid

### CRUD /vendor-bills
### POST /vendor-payments
### GET /vendors/:id/aging

### CRUD /fixed-assets
### POST /depreciation/run `{ company_id, period_date }`

### CRUD /budgets
### GET /budget-vs-actual?budget_id=uuid

---

## H) Procurement & Inventory

### CRUD /purchase-requisitions
### POST /purchase-requisitions/:id/approve
### POST /purchase-requisitions/:id/convert-to-po

### CRUD /vendors
### CRUD /rfqs
### POST /rfqs/:id/responses

### CRUD /purchase-orders
### POST /purchase-orders/:id/approve
### POST /purchase-orders/:id/receive (creates GRN)

### CRUD /grns
### POST /grns/:id/confirm

### CRUD /warehouses
### CRUD /items
### GET /stock-balances?warehouse_id=uuid&item_id=uuid
### POST /stock-movements
```json
{
  "item_id": "uuid", "warehouse_id": "uuid",
  "movement_type": "issue",
  "quantity": 100, "unit_cost": 25.50,
  "project_id": "uuid", "wbs_item_id": "uuid",
  "contractor_id": "uuid",
  "reason": "Issue cement to Building A contractor"
}
```

### POST /inventory-counts
### POST /inventory-counts/:id/lines
### POST /inventory-counts/:id/approve (creates adjustment movements)

---

## I) Project Costing & Contractors

### CRUD /projects/:projectId/wbs
### CRUD /wbs/:id/budgets
### GET /projects/:projectId/cost-summary

### CRUD /contractors
### CRUD /contractor-contracts
### CRUD /progress-claims
```json
// POST /progress-claims
{
  "contractor_contract_id": "uuid",
  "period_from": "2026-01-01", "period_to": "2026-01-31",
  "lines": [
    { "wbs_item_id": "uuid", "description": "Foundation work", "current_quantity": 500, "uom": "sqm", "current_amount": 250000 }
  ]
}
// Auto-calculates: advance_recovery, retention, deductions
```

### POST /progress-claims/:id/submit
### POST /progress-claims/:id/approve
### POST /progress-claims/:id/pay

### CRUD /change-orders

---

## J) Handover & After-Sales

### CRUD /handover-checklists
### POST /handovers
### POST /handovers/:id/inspect
```json
{
  "items": [
    { "checklist_item_code": "PAINT-01", "result": "pass" },
    { "checklist_item_code": "PLUMB-01", "result": "fail", "notes": "Leak in kitchen", "photos": ["url"] }
  ]
}
// Auto-generates snag list from failed items
```
### POST /handovers/:id/complete
### GET /handovers/:id/report (PDF)

### CRUD /maintenance-tickets
### POST /maintenance-tickets/:id/assign
### POST /maintenance-tickets/:id/resolve
### GET /maintenance-tickets/analytics

### GET /maintenance-deposits/:contractId
### POST /maintenance-deposits/:contractId/transactions

---

## K) HR & Payroll

### CRUD /employees
### CRUD /attendance
### CRUD /leave-requests
### POST /leave-requests/:id/approve

### CRUD /salary-structures
### POST /payroll-runs
### POST /payroll-runs/:id/calculate
### POST /payroll-runs/:id/approve
### POST /payroll-runs/:id/post (creates journal entries)
### GET /payroll-runs/:id/payslips/:employeeId (PDF)

### CRUD /employee-advances
### CRUD /employee-custody

---

## L) Reports & Exports

### GET /reports/sales-summary?from=&to=&project_id=
### GET /reports/collections-summary?from=&to=&project_id=
### GET /reports/aging?type=ar|ap&as_of=
### GET /reports/unit-analytics?project_id=
### GET /reports/broker-commissions?broker_id=&from=&to=
### GET /reports/project-cost-summary?project_id=
### GET /reports/inventory-valuation?warehouse_id=

All reports accept `format` query param: `?format=json|csv|pdf`

---

## M) Approvals & Audit

### GET /approvals/pending (current user's pending approvals)
### POST /approvals/:id/approve `{ comment: "Approved" }`
### POST /approvals/:id/reject `{ comment: "Discount too high" }`
### POST /approvals/:id/delegate `{ delegated_to: "uuid" }`

### GET /audit-logs?entity_type=contract&entity_id=uuid&from=&to=&user_id=

---

## N) Documents & Notifications

### POST /documents/upload (multipart)
```json
// Form fields: entity_type, entity_id, tags[], description
// File: attachment
// Response 201: { data: { id, file_name, storage_key, version, url } }
```
### GET /documents?entity_type=contract&entity_id=uuid
### GET /documents/:id/download
### DELETE /documents/:id

### POST /documents/generate-pdf
```json
{ "template": "contract", "entity_id": "uuid", "language": "en" }
// Response 200: { data: { url: "presigned S3 URL" } }
```

### GET /notifications?is_read=false
### PATCH /notifications/:id/read
### PATCH /notifications/read-all

---

## Rate Limiting

| Endpoint Pattern | Limit |
|---|---|
| POST /auth/login | 10/min per IP |
| POST /auth/refresh | 30/min per user |
| GET /* | 100/min per user |
| POST/PUT/PATCH /* | 60/min per user |
| POST /units/bulk-import | 5/hour per tenant |
| GET /reports/* | 30/min per user |
