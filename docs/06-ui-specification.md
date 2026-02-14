# Real Estate ERP — UI/UX Specification

## 1. Design System

- **Framework**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Tables**: TanStack Table (React Table v8)
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (global), React Query (server state)
- **Routing**: React Router v6
- **i18n**: react-i18next (EN/AR with RTL)
- **PDF**: @react-pdf/renderer for client-side, Puppeteer on server
- **Date**: date-fns with locale support
- **Toast**: Sonner

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  Top Bar: Logo | Search | Notifications | Language | │
│           Company Selector | User Menu               │
├──────┬──────────────────────────────────────────────┤
│ Side │  Breadcrumb                                   │
│ Nav  │  ┌──────────────────────────────────────────┐ │
│      │  │  Page Header + Actions                   │ │
│ (col │  │  ┌──────────────────────────────────────┐│ │
│ laps │  │  │  Content Area                        ││ │
│ ible)│  │  │  (Tables, Forms, Dashboards, etc.)   ││ │
│      │  │  │                                      ││ │
│      │  │  └──────────────────────────────────────┘│ │
│      │  └──────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────┘
```

### Responsive Breakpoints
| Breakpoint | Width | Sidebar |
|---|---|---|
| Mobile | < 768px | Hidden (hamburger) |
| Tablet | 768-1024px | Collapsed (icons only) |
| Desktop | > 1024px | Expanded |

---

## 2. Screen List by Module

### A) Platform Core
| # | Screen | Route | Description |
|---|---|---|---|
| A1 | Login | `/login` | Email/password, SSO buttons |
| A2 | Forgot Password | `/forgot-password` | Email input, reset link |
| A3 | Reset Password | `/reset-password/:token` | New password form |
| A4 | Tenant Setup Wizard | `/setup` | First-time tenant config (logo, company, admin) |
| A5 | Company List | `/companies` | CRUD table |
| A6 | Company Form | `/companies/:id` | Company details + settings tabs |
| A7 | Branch List | `/branches` | CRUD table filtered by company |
| A8 | Branch Form | `/branches/:id` | Branch details |
| A9 | User List | `/users` | Table with role badges, status |
| A10 | User Form | `/users/:id` | Profile + role assignments + permissions |
| A11 | Role List | `/roles` | Roles with permission count |
| A12 | Role Form | `/roles/:id` | Permission matrix checkbox grid |
| A13 | Settings | `/settings` | Tabs: General, Currencies, Taxes, Sequences, Integrations |
| A14 | Audit Logs | `/audit-logs` | Filterable log table with JSON diff viewer |
| A15 | Approval Workflows | `/workflows` | Workflow builder (action, conditions, steps) |
| A16 | My Approvals | `/approvals` | Inbox: pending, history. Approve/reject with comments |
| A17 | Document Templates | `/templates` | Template editor with merge field picker |
| A18 | Notifications Center | `/notifications` | List, mark read, link to entity |

### B) Property Catalog
| # | Screen | Route | Description |
|---|---|---|---|
| B1 | Project List | `/projects` | Cards/table with stats (units, sold %, value) |
| B2 | Project Detail | `/projects/:id` | Overview tab, phases, buildings, settings |
| B3 | Phase Manager | `/projects/:id/phases` | Accordion with buildings/floors |
| B4 | Building Detail | `/projects/:id/buildings/:bid` | Floors and units tree |
| B5 | Unit List | `/units` | Advanced filter table with status badges |
| B6 | Unit Detail | `/units/:id` | Tabs: Details, History, Documents, Contract |
| B7 | Unit Availability Map | `/units/map` | Visual grid by building/floor, color-coded status |
| B8 | Bulk Import Units | `/units/import` | Upload, preview, error review, confirm |
| B9 | Price Lists | `/pricing/lists` | CRUD with effective dates |
| B10 | Price List Editor | `/pricing/lists/:id` | Table editor: unit/building overrides |
| B11 | Promotions | `/pricing/promotions` | CRUD with validity and approval status |

### C) CRM & Sales
| # | Screen | Route | Description |
|---|---|---|---|
| C1 | Lead List | `/leads` | Table with status chips, assigned agent |
| C2 | Lead Detail | `/leads/:id` | Info + activity timeline + convert buttons |
| C3 | Lead Import | `/leads/import` | CSV upload |
| C4 | Opportunity Pipeline | `/opportunities` | Kanban board (drag between stages) |
| C5 | Opportunity Detail | `/opportunities/:id` | Info + activities + quotations |
| C6 | Quotation Detail | `/quotations/:id` | Unit, price, payment plan, freeze status |
| C7 | Broker List | `/brokers` | Table with rating, agreement status |
| C8 | Broker Detail | `/brokers/:id` | Profile + agreements + commission history |
| C9 | Commission List | `/commissions` | Filterable by broker, status, period |
| C10 | Campaign List | `/campaigns` | Table with ROI metrics |
| C11 | Campaign Detail | `/campaigns/:id` | Linked leads, cost analysis |
| C12 | Sales Dashboard | `/dashboards/sales` | Funnel, conversion, daily bookings, agent leaderboard |

### D) Booking & Contracting
| # | Screen | Route | Description |
|---|---|---|---|
| D1 | Booking Form | `/bookings/new` | Multi-step: customer → unit → price → payment plan → confirm |
| D2 | Booking List | `/bookings` | Table with status, validity countdown |
| D3 | Booking Detail | `/bookings/:id` | Summary + receipt + convert to contract |
| D4 | Customer List | `/customers` | Search, filter, KYC status badges |
| D5 | Customer Detail | `/customers/:id` | Tabs: Profile, KYC, Bookings, Contracts, Payments, Statement |
| D6 | Contract List | `/contracts` | Table with status, project, customer |
| D7 | Contract Detail | `/contracts/:id` | Tabs: Terms, Schedule, Payments, Addendums, Documents |
| D8 | Contract Form | `/contracts/new` | From booking or manual |
| D9 | Cancellation Form | `/contracts/:id/cancel` | Penalty calc, refund preview, approval |
| D10 | Transfer Form | `/contracts/:id/transfer` | New customer, fee, preview |

### E) Collections
| # | Screen | Route | Description |
|---|---|---|---|
| E1 | Installment Schedule | `/contracts/:id/schedule` | Table with status colors, paid/remaining |
| E2 | Receipt Form | `/receipts/new` | Customer search → contract → amount → allocate |
| E3 | Receipt List | `/receipts` | Table with filters |
| E4 | Receipt Detail | `/receipts/:id` | Allocations, journal entry link, print |
| E5 | Cheque List | `/cheques` | Status filters, lifecycle actions |
| E6 | Cheque Detail | `/cheques/:id` | Status timeline, actions (deposit, clear, bounce) |
| E7 | Reschedule Form | `/contracts/:id/reschedule` | Current vs proposed schedule comparison |
| E8 | Aging Report | `/reports/aging` | Buckets table, drilldown to customer |
| E9 | Collections Dashboard | `/dashboards/collections` | Target vs actual, DSO, overdue chart |
| E10 | Customer Statement | `/customers/:id/statement` | Printable statement with all transactions |
| E11 | Refund Form | `/refunds/new` | Calculation, approval, payment method |
| E12 | Refund List | `/refunds` | Status filters |

### F) Finance & Accounting
| # | Screen | Route | Description |
|---|---|---|---|
| F1 | Chart of Accounts | `/accounting/coa` | Tree view with expand/collapse, search |
| F2 | Account Form | `/accounting/coa/:id` | Account details, link to GL |
| F3 | Journal Entry List | `/accounting/journals` | Filters: status, period, source |
| F4 | Journal Entry Form | `/accounting/journals/new` | Date, lines (account, debit, credit, dims), balance check |
| F5 | Journal Entry Detail | `/accounting/journals/:id` | Lines, source link, post/reverse actions |
| F6 | General Ledger | `/accounting/gl` | Account drilldown: transactions list |
| F7 | Trial Balance | `/accounting/trial-balance` | Summary and detailed views |
| F8 | Income Statement | `/accounting/pnl` | Period selector, project filter, comparative |
| F9 | Balance Sheet | `/accounting/balance-sheet` | As-of date, comparative |
| F10 | Cash Flow | `/accounting/cash-flow` | Indirect method |
| F11 | Fiscal Periods | `/accounting/periods` | Open/close controls |
| F12 | Bank Accounts | `/banking/accounts` | List with balances |
| F13 | Bank Transactions | `/banking/accounts/:id/transactions` | Register view |
| F14 | Bank Reconciliation | `/banking/reconciliation` | Side-by-side: book vs statement, match UI |
| F15 | Cashbox Management | `/banking/cashboxes` | Balance, daily transactions |
| F16 | Vendor Bill List | `/accounting/bills` | Status, due date filters |
| F17 | Vendor Bill Form | `/accounting/bills/new` | Line items, PO match, tax |
| F18 | Vendor Payment | `/accounting/payments/new` | Bill selection, batch payment |
| F19 | Accounting Rules | `/accounting/rules` | Event → debit/credit mapping config |
| F20 | Revenue Recognition | `/accounting/revenue-recognition` | Schedules, run history |
| F21 | Fixed Assets | `/accounting/assets` | Register, depreciation status |
| F22 | Budget Entry | `/accounting/budgets` | Period × account grid |
| F23 | Budget vs Actual | `/accounting/budgets/:id/variance` | Comparison with charts |

### G) Procurement & Inventory
| # | Screen | Route | Description |
|---|---|---|---|
| G1 | PR List | `/procurement/requisitions` | Status filters |
| G2 | PR Form | `/procurement/requisitions/new` | Items, quantities, justification |
| G3 | RFQ Manager | `/procurement/rfqs` | Vendor responses comparison |
| G4 | PO List | `/procurement/orders` | Status, vendor filters |
| G5 | PO Form | `/procurement/orders/new` | From PR/RFQ, line items |
| G6 | PO Detail | `/procurement/orders/:id` | Lines, GRN history, status |
| G7 | GRN Form | `/procurement/grn/new` | Receive against PO, quality check |
| G8 | Vendor List | `/vendors` | Rating, category filters |
| G9 | Vendor Detail | `/vendors/:id` | Profile, contracts, PO history, aging |
| G10 | Item Master | `/inventory/items` | Search, category filter |
| G11 | Stock Balances | `/inventory/balances` | Warehouse × item matrix |
| G12 | Stock Movement | `/inventory/movements/new` | Issue/transfer/adjust form |
| G13 | Movement History | `/inventory/movements` | Filterable log |
| G14 | Inventory Count | `/inventory/counts/new` | Count sheet, variance review |
| G15 | Inventory Dashboard | `/dashboards/inventory` | Stock levels, consumption trends |

### H) Project Costing & Contractors
| # | Screen | Route | Description |
|---|---|---|---|
| H1 | WBS Tree | `/projects/:id/wbs` | Expandable tree with budget bars |
| H2 | WBS Budget Editor | `/projects/:id/wbs/:wbsId/budget` | Budget types, planned vs actual |
| H3 | Cost Summary | `/projects/:id/cost-summary` | Dashboard: planned vs committed vs actual |
| H4 | Contractor List | `/contractors` | Table with specialization, rating |
| H5 | Contractor Detail | `/contractors/:id` | Profile, contracts, claims, performance |
| H6 | Contractor Contract | `/contractor-contracts/:id` | Milestones, retention, claims history |
| H7 | Progress Claim Form | `/claims/new` | Line items against contract, auto-deductions |
| H8 | Claim Approval | `/claims/:id` | Review, approve/reject, deduction breakdown |
| H9 | Change Order Form | `/change-orders/new` | Cost/time impact, approval |

### I) Handover & After-Sales
| # | Screen | Route | Description |
|---|---|---|---|
| I1 | Handover List | `/handovers` | Status filters, search |
| I2 | Handover Inspection | `/handovers/:id/inspect` | Checklist with pass/fail, photo upload |
| I3 | Snag List | `/handovers/:id/snags` | Items with assignment, status |
| I4 | Handover Completion | `/handovers/:id/complete` | Final check, signature capture |
| I5 | Ticket List | `/maintenance/tickets` | Priority, status, SLA indicators |
| I6 | Ticket Detail | `/maintenance/tickets/:id` | Timeline, assignment, resolution |
| I7 | Ticket Form | `/maintenance/tickets/new` | Customer, unit, category, photos |
| I8 | Maintenance Dashboard | `/dashboards/maintenance` | Open tickets, SLA compliance, categories |
| I9 | Maintenance Deposit | `/maintenance/deposits/:contractId` | Balance, transactions |

### J) HR & Payroll
| # | Screen | Route | Description |
|---|---|---|---|
| J1 | Employee List | `/hr/employees` | Department filter, status |
| J2 | Employee Detail | `/hr/employees/:id` | Tabs: Profile, Attendance, Leaves, Salary, Custody |
| J3 | Attendance Sheet | `/hr/attendance` | Monthly grid view |
| J4 | Leave Calendar | `/hr/leaves` | Calendar view with team leaves |
| J5 | Leave Request | `/hr/leaves/new` | Type, dates, balance check |
| J6 | Salary Structure | `/hr/salary/:employeeId` | Components breakdown |
| J7 | Payroll Run | `/hr/payroll` | List of runs, status |
| J8 | Payroll Calculator | `/hr/payroll/:id` | Employee lines, calculate, approve, post |
| J9 | Payslip View | `/hr/payroll/:id/payslips/:empId` | Printable payslip |
| J10 | Advance Request | `/hr/advances` | Request, approval, repayment tracking |

### K) Dashboards
| # | Screen | Route | Description |
|---|---|---|---|
| K1 | Executive Dashboard | `/dashboards/executive` | KPIs, revenue, collections, units |
| K2 | Sales Dashboard | `/dashboards/sales` | Funnel, agent perf, bookings trend |
| K3 | Collections Dashboard | `/dashboards/collections` | Target vs actual, DSO, aging |
| K4 | Project Dashboard | `/dashboards/project` | Budget vs actual, completion % |
| K5 | Finance Dashboard | `/dashboards/finance` | Revenue, expenses, cash position |

---

## 3. Key UI Flows

### Flow 1: Lead → Booking → Contract
```
Lead List → Create Lead → Lead Detail → Log Activities →
  Convert to Opportunity → Opportunity Pipeline →
  Create Quotation (select unit, price, plan) →
  Convert to Booking (confirm, pay fee) →
  Booking Detail → Convert to Contract →
  Contract Form (review terms) → Sign Contract →
  Installment Schedule Generated → Customer Statement
```

### Flow 2: Receipt Collection
```
Receipt Form → Search Customer → Select Contract →
  Enter Amount + Method → Auto-allocate or Manual →
  Review Allocations → Confirm →
  Receipt Created → Installments Updated →
  Journal Entry Posted → Print Receipt
```

### Flow 3: Procurement → Inventory → Job Costing
```
Create PR → Approve PR → Create PO (from PR) →
  Approve PO → Send to Vendor →
  Receive Goods (GRN) → Items in Stock →
  Issue Materials (to project/WBS) →
  Stock Reduced → WBS Actual Cost Updated →
  Journal Entry: Debit WBS Cost, Credit Inventory
```

### Flow 4: Contractor Progress Claim
```
Contractor Contract → Create Claim →
  Enter Line Items (quantities, amounts) →
  System Calculates Deductions (advance, retention, penalties) →
  Submit for Approval → Site Engineer Reviews →
  Construction Manager Approves → Finance Approves →
  Payment Processed → Journal Entry Posted
```

### Flow 5: Handover
```
Contract Active + Unit Ready → Create Handover →
  Schedule Initial Inspection → Conduct Inspection (checklist) →
  Failed Items → Snag List Generated → Assign to Contractor →
  Contractor Fixes → Verify Fix → All Snags Resolved →
  Final Inspection → Customer Signs → Handover Complete →
  Unit Status → Delivered → Revenue Recognized (if delivery-based)
```

---

## 4. Field Validation Rules

### Customer
| Field | Rules |
|---|---|
| first_name | Required, 2-100 chars |
| last_name | Required, 2-100 chars |
| phone | Required, E.164 format, unique per tenant |
| email | Optional, valid email format |
| id_number | Required for contract, alphanumeric |
| nationality | ISO 3166-1 alpha-3 |

### Booking
| Field | Rules |
|---|---|
| customer_id | Required, verified customer |
| unit_id | Required, status must be 'available' |
| net_price | Required, > 0, ≤ unit total_price (or with approved discount) |
| booking_fee | Required, ≥ 0 |
| valid_until | Required, must be future date, within project max validity |

### Contract
| Field | Rules |
|---|---|
| contract_date | Required, ≤ today |
| total_amount | Required, = net_price + tax_amount |
| expected_delivery | Required, must be future date |
| warranty_months | Required, ≥ 0 |
| payment_plan | Must sum to total_amount exactly |

### Receipt
| Field | Rules |
|---|---|
| amount | Required, > 0, ≤ outstanding balance |
| payment_date | Required, ≤ today, within open fiscal period |
| payment_method | Required, valid enum |
| reference_number | Required for bank_transfer and cheque |
| allocations.sum | Must equal receipt amount |

### Journal Entry
| Field | Rules |
|---|---|
| entry_date | Required, within open fiscal period |
| lines | Min 2 lines |
| total_debit | Must equal total_credit |
| account_id | Must be detail account (not header), active |

### Purchase Order
| Field | Rules |
|---|---|
| vendor_id | Required, active vendor |
| lines | Min 1 line |
| quantity | > 0 per line |
| unit_price | ≥ 0 per line |
| expected_delivery | Required, future date |

---

## 5. Component Library (Key Shared Components)

| Component | Usage |
|---|---|
| `DataTable` | All list views: sorting, filtering, pagination, selection, export |
| `FormBuilder` | Dynamic form generation from schema |
| `StatusBadge` | Color-coded status chips for all entities |
| `CurrencyInput` | Locale-aware number input with currency symbol |
| `DatePicker` | Date/date-range picker with locale |
| `FileUploader` | Drag-and-drop, preview, progress |
| `EntitySearch` | Debounced search with results dropdown (customers, units, accounts) |
| `ApprovalPanel` | Inline approve/reject with comment |
| `TimelineView` | Activity/history timeline |
| `TreeView` | COA, WBS, org hierarchy |
| `KanbanBoard` | Opportunity pipeline, ticket board |
| `StatCard` | Dashboard metric cards |
| `ChartWidget` | Recharts wrapper with loading/error states |
| `PrintLayout` | PDF-optimized layout for receipts, invoices, reports |
| `DiffViewer` | JSON diff for audit log inspection |
| `SignaturePad` | Digital signature capture for handover |
| `LanguageToggle` | EN/AR switch with RTL flip |
