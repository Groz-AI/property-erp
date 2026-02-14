# Real Estate ERP — Product Requirements Document (PRD)

## 1. Product Vision

A multi-tenant, cloud-native SaaS ERP purpose-built for real estate developers, covering the full lifecycle from land acquisition through unit sales, construction, handover, and after-sales service. The system unifies CRM, contracting, finance, procurement, project costing, and HR into a single platform with accounting-grade accuracy and full audit compliance.

---

## 2. User Roles & Permissions Matrix

### 2.1 Role Definitions

| Role | Description | Scope |
|---|---|---|
| **System Admin** | Platform-level admin, manages tenants | Global |
| **Tenant Admin** | Full access within tenant, manages companies/branches/users | Tenant |
| **Company Admin** | Manages a specific company and its branches | Company |
| **Branch Manager** | Manages a specific branch and its projects | Branch |
| **Project Manager** | Full control over assigned projects | Project |
| **Sales Manager** | Manages sales team, approves discounts, views all sales data | Branch/Project |
| **Sales Agent** | Creates leads, bookings, manages own pipeline | Own records + assigned projects |
| **Finance Manager** | Full accounting access, approves journals, manages GL | Company |
| **Accountant** | Posts journals, manages AR/AP, reconciliation | Company |
| **Cashier** | Receives payments, manages cashbox | Branch |
| **Collections Officer** | Manages installment follow-ups, dunning | Company/Branch |
| **Procurement Manager** | Approves POs, manages vendors | Company |
| **Procurement Officer** | Creates PRs, RFQs, POs | Branch |
| **Warehouse Keeper** | Manages inventory, receives goods, issues materials | Warehouse |
| **Construction Manager** | Manages contractors, WBS, progress claims | Project |
| **Site Engineer** | Updates progress, creates snag lists | Project |
| **Handover Officer** | Manages handover process, checklists | Project |
| **Customer Service Agent** | Manages maintenance tickets, customer inquiries | Branch |
| **HR Manager** | Manages employees, payroll | Company |
| **Broker** | External: views own commissions, assigned units (portal) | Own records |
| **Customer** | External: views own statements, installments (portal) | Own records |
| **Auditor** | Read-only access to all financial data and audit logs | Company |

### 2.2 Permission Matrix (Module × Action)

Permissions follow the pattern: `module:action` with scope qualifiers.

| Module | Actions | System Admin | Tenant Admin | Finance Mgr | Sales Mgr | Sales Agent | Accountant | Cashier |
|---|---|---|---|---|---|---|---|---|
| **Tenants** | CRUD | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Companies** | CRUD | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Branches** | CRUD | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Users** | CRUD, assign roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Projects** | CRUD | ✅ | ✅ | R | R | R | R | ❌ |
| **Units** | CRUD, status change | ✅ | ✅ | R | RU | R | R | ❌ |
| **Price Lists** | CRUD | ✅ | ✅ | R | RU | R | ❌ | ❌ |
| **Leads** | CRUD | ✅ | ✅ | ❌ | CRUD | CRUD(own) | ❌ | ❌ |
| **Opportunities** | CRUD | ✅ | ✅ | ❌ | CRUD | CRUD(own) | ❌ | ❌ |
| **Bookings** | Create, Cancel | ✅ | ✅ | R | CRUD | C,R(own) | R | ❌ |
| **Contracts** | CRUD | ✅ | ✅ | R | CRUD | R(own) | R | ❌ |
| **Installments** | View, Reschedule | ✅ | ✅ | CRUD | R | R(own) | CRUD | ❌ |
| **Collections** | Receive, Allocate | ✅ | ✅ | CRUD | R | ❌ | CRUD | C,R |
| **Cheques** | Lifecycle mgmt | ✅ | ✅ | CRUD | ❌ | ❌ | CRUD | R |
| **Refunds** | Request, Approve, Pay | ✅ | ✅ | CRUD | R | ❌ | CRU | ❌ |
| **COA** | CRUD | ✅ | ✅ | CRUD | ❌ | ❌ | R | ❌ |
| **Journal Entries** | CRUD, Post, Reverse | ✅ | ✅ | CRUD | ❌ | ❌ | CRUD | ❌ |
| **Bank Recon** | Reconcile | ✅ | ✅ | CRUD | ❌ | ❌ | CRUD | ❌ |
| **AP / Vendor Bills** | CRUD | ✅ | ✅ | CRUD | ❌ | ❌ | CRUD | ❌ |
| **Procurement** | PR→PO flow | ✅ | ✅ | R | ❌ | ❌ | R | ❌ |
| **Inventory** | Stock ops | ✅ | ✅ | R | ❌ | ❌ | R | ❌ |
| **Contractors** | CRUD, Claims | ✅ | ✅ | R | ❌ | ❌ | R | ❌ |
| **Handover** | Process mgmt | ✅ | ✅ | R | R | ❌ | ❌ | ❌ |
| **Maintenance** | Tickets | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **HR/Payroll** | CRUD | ✅ | ✅ | R | ❌ | ❌ | R | ❌ |
| **Reports** | View, Export | ✅ | ✅ | ✅ | ✅(sales) | R(own) | ✅(fin) | R(own) |
| **Audit Logs** | View | ✅ | ✅ | R | ❌ | ❌ | ❌ | ❌ |
| **Approvals** | Approve/Reject | ✅ | ✅ | ✅(fin) | ✅(sales) | ❌ | ❌ | ❌ |

*Legend: C=Create, R=Read, U=Update, D=Delete, (own)=own records only*

### 2.3 Custom Roles

Tenant admins can create custom roles by selecting granular permissions from the permission catalog. Each permission is defined as:
```
{
  "module": "units",
  "action": "update_status",
  "scope": "own_project"  // all | own_company | own_branch | own_project | own
}
```

---

## 3. Functional Requirements by Module

### A) Platform Core

#### A1. Multi-Tenancy
- **FR-A1.1**: System supports multiple tenants with complete data isolation
- **FR-A1.2**: Each tenant has custom subdomain (e.g., `acme.erp.example.com`)
- **FR-A1.3**: Tenant-level settings: logo, colors, timezone, default currency, fiscal year start
- **FR-A1.4**: Tenant subscription management (plan, limits, billing — stub for MVP)
- **FR-A1.5**: Tenant data export capability for compliance

#### A2. Organizational Hierarchy
- **FR-A2.1**: Tenant → Company → Branch → Project → Phase → Building → Floor → Unit
- **FR-A2.2**: Companies can operate independently with separate COA and fiscal settings
- **FR-A2.3**: Branches inherit company settings but can override specific configs
- **FR-A2.4**: Users can be assigned to multiple companies/branches/projects
- **FR-A2.5**: Cross-company intercompany transactions supported

#### A3. Master Data
- **FR-A3.1**: Unit types (apartment, villa, duplex, studio, office, shop, parking, storage, land)
- **FR-A3.2**: Finishing levels (core & shell, semi-finished, finished, fully furnished)
- **FR-A3.3**: Orientations (N, S, E, W, NE, NW, SE, SW)
- **FR-A3.4**: View types (garden, pool, street, sea, city, park, internal)
- **FR-A3.5**: Area types (built-up area, land area, garden area, terrace, roof)
- **FR-A3.6**: Currency management with daily exchange rates
- **FR-A3.7**: Tax rules: VAT, stamp duty, registration fees, withholding tax — configurable per jurisdiction
- **FR-A3.8**: Payment methods: cash, bank transfer, cheque, credit card, online gateway
- **FR-A3.9**: Bank accounts and cashboxes per branch
- **FR-A3.10**: Sequence generators for document numbering (customizable patterns per company)

#### A4. Approval Workflows
- **FR-A4.1**: Configurable approval chains per action type
- **FR-A4.2**: Threshold-based routing (e.g., discount > 5% needs sales manager, > 10% needs GM)
- **FR-A4.3**: Multi-level approvals with sequential or parallel steps
- **FR-A4.4**: Delegation and escalation rules
- **FR-A4.5**: Approval history with comments, timestamps
- **FR-A4.6**: Email/push notifications for pending approvals

#### A5. Audit & Compliance
- **FR-A5.1**: Every create/update/delete operation logged with: user, timestamp, IP, user-agent, before/after values
- **FR-A5.2**: Financial operations are immutable (append-only event log)
- **FR-A5.3**: Audit log search and filtering by entity, user, date range, action
- **FR-A5.4**: Data retention policies configurable per tenant
- **FR-A5.5**: Personal data anonymization capability (GDPR)

#### A6. Document Management
- **FR-A6.1**: Upload/download attachments for any entity
- **FR-A6.2**: File versioning with change history
- **FR-A6.3**: Tag-based organization
- **FR-A6.4**: Access control per document (inherits from parent entity)
- **FR-A6.5**: Template engine for generating contracts, receipts, invoices, handover reports (HTML→PDF)
- **FR-A6.6**: Maximum file size and allowed types configurable per tenant

### B) Property Catalog & Availability

#### B1. Unit Registry
- **FR-B1.1**: Hierarchical unit catalog: Project → Phase → Building → Floor → Unit
- **FR-B1.2**: Auto-generated unit codes with configurable pattern (e.g., `PRJ-PH1-B2-F3-U401`)
- **FR-B1.3**: Unit attributes: type, areas (multiple), orientation, view, finishing, floor number, bedrooms, bathrooms
- **FR-B1.4**: Unit statuses with strict state machine (see Workflows doc)
- **FR-B1.5**: Status history with timestamps and reasons
- **FR-B1.6**: Bulk import units from Excel/CSV
- **FR-B1.7**: Unit gallery (photos, floor plans, 3D tours — links)
- **FR-B1.8**: Optional geolocation coordinates

#### B2. Pricing
- **FR-B2.1**: Base price per sqm at project level, overridable at phase/building/floor/unit level
- **FR-B2.2**: Price lists with effective dates and versioning
- **FR-B2.3**: Promotions: percentage discount, fixed amount discount, free upgrades — with validity dates
- **FR-B2.4**: Discount approval workflow when exceeding thresholds
- **FR-B2.5**: Price freeze on quotation for configurable duration (e.g., 7 days)
- **FR-B2.6**: Price history tracking

#### B3. Availability
- **FR-B3.1**: Soft reservation (holds unit for X minutes, auto-expires)
- **FR-B3.2**: Hard reservation (booking created, holds unit until booking validity expires)
- **FR-B3.3**: Concurrent booking prevention via database-level locking
- **FR-B3.4**: Bulk price update tool with preview and confirmation
- **FR-B3.5**: Availability dashboard with filters and map view optional

### C) CRM & Sales

#### C1. Leads
- **FR-C1.1**: Lead capture from: manual entry, website form, phone, social media, broker referral
- **FR-C1.2**: Lead fields: name, phone, email, source, channel, campaign, interest (project/unit type/budget)
- **FR-C1.3**: Lead scoring based on configurable criteria
- **FR-C1.4**: Auto-assignment rules (round-robin, by project, by source)
- **FR-C1.5**: SLA timers for first contact (e.g., must call within 1 hour)
- **FR-C1.6**: Lead status: New → Contacted → Qualified → Opportunity → Won / Lost / Disqualified
- **FR-C1.7**: Duplicate detection on phone/email

#### C2. Opportunities
- **FR-C2.1**: Pipeline stages: Discovery → Proposal → Negotiation → Booking → Won / Lost
- **FR-C2.2**: Activities: calls, meetings, site visits, emails — logged with timestamps
- **FR-C2.3**: Quotation generation with unit details, payment plan, discounts
- **FR-C2.4**: Quotation versioning and comparison
- **FR-C2.5**: Expected close date and probability for forecasting
- **FR-C2.6**: Convert opportunity to booking with one click

#### C3. Brokers
- **FR-C3.1**: Broker company and individual agent profiles
- **FR-C3.2**: Broker agreements with commission terms and validity
- **FR-C3.3**: Commission calculation methods:
  - Fixed amount per unit
  - Percentage of unit price (before/after discount)
  - Tiered: rate changes by volume or value thresholds
  - Milestone-based: X% at booking, Y% at contract, Z% at handover
- **FR-C3.4**: Commission approval workflow
- **FR-C3.5**: Payout schedule generation
- **FR-C3.6**: Withholding tax deduction on commission payments
- **FR-C3.7**: Broker portal: view assigned units, track commissions (future)

#### C4. Marketing
- **FR-C4.1**: Campaign management: name, channel, budget, date range
- **FR-C4.2**: Link leads to campaigns
- **FR-C4.3**: ROI calculation: cost per lead, cost per booking, cost per sale
- **FR-C4.4**: Attribution models: first-touch (default), last-touch, linear (optional)

### D) Booking → Contracting → Legal

#### D1. Booking
- **FR-D1.1**: Create booking with: customer, unit, price, discount, booking fee, payment plan, validity date
- **FR-D1.2**: Unit status changes to Reserved upon booking
- **FR-D1.3**: Booking fee types: refundable deposit, non-refundable fee, deducted from first installment
- **FR-D1.4**: Booking validity period (configurable per project, default: 14 days)
- **FR-D1.5**: Auto-cancel expired bookings (background job)
- **FR-D1.6**: Booking receipt generation (PDF)

#### D2. Customer KYC
- **FR-D2.1**: Customer profile: name, nationality, ID type/number, phone, email, address
- **FR-D2.2**: Co-buyers with ownership percentages
- **FR-D2.3**: Beneficiary designation
- **FR-D2.4**: Document uploads: ID copy, proof of address, POA
- **FR-D2.5**: Verification status: Pending → Verified → Flagged
- **FR-D2.6**: Risk flags and notes

#### D3. Contract Management
- **FR-D3.1**: Generate contract from booking with all terms
- **FR-D3.2**: Contract template engine with merge fields (customer name, unit details, schedule, etc.)
- **FR-D3.3**: Key contract fields: parties, unit, total price, payment plan, delivery date, penalties, warranty period, maintenance deposit
- **FR-D3.4**: Contract statuses: Draft → Under Review → Signed → Active → Completed → Cancelled → Transferred
- **FR-D3.5**: Addendums: price change, schedule change, clause change — versioned
- **FR-D3.6**: Unit status changes to Sold upon contract signing
- **FR-D3.7**: Contract signing triggers installment schedule generation and accounting entries

#### D4. Cancellations & Transfers
- **FR-D4.1**: Booking cancellation: reason, fees, refund calculation
- **FR-D4.2**: Contract cancellation: reason, penalty calculation per contract terms, refund schedule
- **FR-D4.3**: Ownership transfer: old customer → new customer, transfer fee, new contract generation
- **FR-D4.4**: Unit swap: move customer to different unit, price adjustment, new schedule
- **FR-D4.5**: All operations require approval workflow
- **FR-D4.6**: All operations generate reversal/new journal entries

### E) Installments & Collections

#### E1. Payment Plans
- **FR-E1.1**: Template payment plans per project/phase (e.g., "40/60", "10-80-10")
- **FR-E1.2**: Components: down payment, installments (monthly/quarterly/custom), handover payment, maintenance deposit
- **FR-E1.3**: Grace period per installment (days after due date before penalty)
- **FR-E1.4**: Penalty rules: fixed amount, percentage of overdue, daily accrual, capped amount
- **FR-E1.5**: Penalty waiver with approval

#### E2. Schedule Engine
- **FR-E2.1**: Auto-generate installment schedule from payment plan template + contract values
- **FR-E2.2**: Rounding rules for installment amounts (round to nearest 10/100)
- **FR-E2.3**: Rescheduling: extend by N months, defer specific installments, restructure remaining
- **FR-E2.4**: Rescheduling requires approval and creates audit trail
- **FR-E2.5**: Each installment: number, due date, amount, status (upcoming, due, overdue, paid, partially paid, waived)

#### E3. Collections
- **FR-E3.1**: Receipt creation with payment method, amount, reference, allocation
- **FR-E3.2**: Allocation logic: FIFO (oldest installment first) by default, manual override available
- **FR-E3.3**: Partial payments: installment status = partially paid, remaining tracked
- **FR-E3.4**: Cheque lifecycle: Received → Under Collection → Deposited → Cleared → OR → Bounced → Replaced/Written Off
- **FR-E3.5**: Bounced cheque handling: reverse collection, re-create installment, optional penalty
- **FR-E3.6**: Payment gateway integration stub (online payments)
- **FR-E3.7**: Advance payments (customer pays ahead of schedule)

#### E4. Aging & Dunning
- **FR-E4.1**: Aging buckets: current, 1-30, 31-60, 61-90, 90+ days
- **FR-E4.2**: Automated aging report generation
- **FR-E4.3**: Dunning actions configurable: email, SMS, phone call, legal notice
- **FR-E4.4**: Dunning workflow: auto-escalate after N days without payment
- **FR-E4.5**: Collections call log with notes and next action dates

#### E5. Refunds
- **FR-E5.1**: Refund request creation with reason, amount, bank details
- **FR-E5.2**: Refund approval workflow
- **FR-E5.3**: Refund methods: bank transfer, cheque, cash
- **FR-E5.4**: Settlement agreements: partial refund + new payment schedule
- **FR-E5.5**: Refund accounting entries (reverse revenue, reduce receivable, record payable)

### F) Finance & Accounting

#### F1. Chart of Accounts
- **FR-F1.1**: Hierarchical COA with account groups (Assets, Liabilities, Equity, Revenue, Expenses)
- **FR-F1.2**: Account types: control, detail, bank, cash, AR, AP, tax, intercompany
- **FR-F1.3**: Segment dimensions: company, branch, project, phase, cost center
- **FR-F1.4**: Template COA provided on tenant setup, fully customizable
- **FR-F1.5**: Account activation/deactivation (cannot delete if has transactions)

#### F2. General Ledger
- **FR-F2.1**: Manual and automatic journal entries
- **FR-F2.2**: Journal entry: date, reference, description, lines (account, debit, credit, dimensions)
- **FR-F2.3**: Balanced entry validation (total debits = total credits)
- **FR-F2.4**: Posting: Draft → Posted → Reversed
- **FR-F2.5**: Fiscal periods: open/closed, period locking
- **FR-F2.6**: Year-end closing entries (auto-generate P&L to retained earnings)
- **FR-F2.7**: Reversing entries for accruals
- **FR-F2.8**: Intercompany journal entries with auto-balancing

#### F3. Accounting Rules Engine
- **FR-F3.1**: Configurable event → journal entry mapping (see Accounting Mapping doc)
- **FR-F3.2**: Default mappings provided, tenant can customize account codes
- **FR-F3.3**: Rules support multi-currency with auto forex entries
- **FR-F3.4**: Rules evaluated on domain events, entries created in same transaction

#### F4. Revenue Recognition
- **FR-F4.1**: Support three methods: delivery-based, POC, milestone-based
- **FR-F4.2**: Default method configurable per project
- **FR-F4.3**: Delivery-based: recognize revenue at handover
- **FR-F4.4**: POC: recognize based on construction completion percentage
- **FR-F4.5**: Milestone-based: recognize at defined milestones (booking, contract, 50% paid, handover)
- **FR-F4.6**: Deferred revenue tracking with auto-release schedule
- **FR-F4.7**: Monthly revenue recognition run (background job)

#### F5. Cash & Bank
- **FR-F5.1**: Cashbox management: opening balance, daily transactions, closing
- **FR-F5.2**: Bank account register with all transactions
- **FR-F5.3**: Internal transfers between cashboxes and bank accounts
- **FR-F5.4**: Bank reconciliation: import bank statement (CSV/MT940), match transactions, handle exceptions
- **FR-F5.5**: Reconciliation status tracking per bank account per period

#### F6. Accounts Payable
- **FR-F6.1**: Vendor bill entry with line items, tax, due date
- **FR-F6.2**: Bill matching to PO/GRN (3-way match)
- **FR-F6.3**: Payment scheduling and batch payments
- **FR-F6.4**: Withholding tax calculation on payments
- **FR-F6.5**: Vendor aging report

#### F7. Fixed Assets
- **FR-F7.1**: Asset register: acquisition date, cost, useful life, salvage value, location
- **FR-F7.2**: Depreciation methods: straight-line, declining balance
- **FR-F7.3**: Monthly depreciation run (background job)
- **FR-F7.4**: Asset disposal/write-off with gain/loss calculation

#### F8. Financial Statements
- **FR-F8.1**: Trial balance (detailed and summary)
- **FR-F8.2**: Income statement (P&L) by period, project, cost center
- **FR-F8.3**: Balance sheet as of date
- **FR-F8.4**: Cash flow statement (indirect method)
- **FR-F8.5**: Budget entry by account, period, project
- **FR-F8.6**: Budget vs actual variance report

### G) Procurement & Inventory

#### G1. Procurement
- **FR-G1.1**: Purchase requisition (PR): requester, items, quantities, estimated cost, justification
- **FR-G1.2**: PR approval based on amount thresholds
- **FR-G1.3**: RFQ: send to multiple vendors, compare responses
- **FR-G1.4**: Purchase order (PO): vendor, items, quantities, prices, delivery date, terms
- **FR-G1.5**: PO approval workflow
- **FR-G1.6**: Goods received note (GRN): receive items against PO, quality check
- **FR-G1.7**: Partial deliveries with tracking of remaining quantities
- **FR-G1.8**: PO status: Draft → Approved → Partially Received → Received → Closed / Cancelled

#### G2. Vendors
- **FR-G2.1**: Vendor master: name, category, contact, tax ID, bank details, rating
- **FR-G2.2**: Vendor contracts with validity, payment terms, SLAs
- **FR-G2.3**: Vendor price lists for repeat items

#### G3. Inventory
- **FR-G3.1**: Warehouse and location hierarchy (warehouse → zone → bin)
- **FR-G3.2**: Item master: code, name, category, UoM, reorder level, images
- **FR-G3.3**: Stock movements: receive (GRN), issue (to project/contractor), transfer, adjustment
- **FR-G3.4**: Material issue linked to WBS item for job costing
- **FR-G3.5**: Stock balance by warehouse, location, item
- **FR-G3.6**: Cycle count and full inventory count support
- **FR-G3.7**: Stock valuation using weighted average cost method (FIFO as future option)

#### G4. Costing
- **FR-G4.1**: Weighted average cost calculation on each receipt
- **FR-G4.2**: Landed cost allocation (freight, customs) to item cost
- **FR-G4.3**: Cost of goods issued tracked per project/WBS item

### H) Project Costing & Contractors

#### H1. WBS & Budgets
- **FR-H1.1**: WBS structure per project: phase → category → line item
- **FR-H1.2**: Budget per WBS item: planned amount, committed (PO), actual (spent)
- **FR-H1.3**: Variance tracking: budget vs committed vs actual
- **FR-H1.4**: Budget revision with approval

#### H2. Contractors
- **FR-H2.1**: Contractor master: company info, specialization, insurance, bonding
- **FR-H2.2**: Contractor contract: scope, milestones, value, retention %, penalty terms
- **FR-H2.3**: Progress claims (mustakhlas): claim number, period, items, amounts, deductions
- **FR-H2.4**: Claim deductions: advance recovery, retention, penalties, back-charges
- **FR-H2.5**: Claim approval workflow (site engineer → construction manager → finance)
- **FR-H2.6**: Retention tracking and release schedule
- **FR-H2.7**: Change orders: scope change, cost impact, approval
- **FR-H2.8**: Contractor performance scoring

#### H3. Site Overhead
- **FR-H3.1**: Indirect cost categories (site office, utilities, security, insurance)
- **FR-H3.2**: Allocation rules: proportional to direct cost, by area, by unit count

### I) Handover & After-Sales

#### I1. Handover
- **FR-I1.1**: Pre-handover checklist (configurable per project/unit type)
- **FR-I1.2**: Initial inspection: checklist items with pass/fail, photos, notes
- **FR-I1.3**: Snag list generation from failed items
- **FR-I1.4**: Snag assignment to contractor for rectification
- **FR-I1.5**: Final handover after snag resolution
- **FR-I1.6**: Customer sign-off (digital signature capture)
- **FR-I1.7**: Handover report PDF generation
- **FR-I1.8**: Unit status → Delivered upon final handover

#### I2. Maintenance Tickets
- **FR-I2.1**: Ticket creation: customer, unit, category, description, priority, photos
- **FR-I2.2**: Auto-assignment based on category and availability
- **FR-I2.3**: SLA tracking: response time, resolution time
- **FR-I2.4**: Ticket workflow: Open → Assigned → In Progress → Resolved → Closed → Reopened
- **FR-I2.5**: Warranty period check: auto-flag if within/outside warranty
- **FR-I2.6**: Field visit scheduling and tracking
- **FR-I2.7**: Recurring issue detection and reporting

#### I3. Maintenance Deposit
- **FR-I3.1**: Separate ledger per unit for maintenance deposit
- **FR-I3.2**: Spending requests with approval
- **FR-I3.3**: Customer statement of maintenance deposit balance

### J) HR & Payroll

#### J1. Employees
- **FR-J1.1**: Employee profile: personal info, job info, department, manager, documents
- **FR-J1.2**: Attendance tracking: check-in/check-out, manual entry
- **FR-J1.3**: Leave management: types (annual, sick, unpaid), balances, requests, approvals
- **FR-J1.4**: Employee directory and org chart

#### J2. Payroll
- **FR-J2.1**: Salary structure: basic, allowances (housing, transport, etc.), deductions
- **FR-J2.2**: Monthly payroll run: calculate gross, deductions, net pay
- **FR-J2.3**: Deductions: tax, social insurance, loan installments, penalties
- **FR-J2.4**: Payslip generation (PDF)
- **FR-J2.5**: Payroll posting to GL (salary expense, payable, deductions)
- **FR-J2.6**: Bank file generation for salary transfers

#### J3. Custody & Advances
- **FR-J3.1**: Employee advance requests with approval
- **FR-J3.2**: Advance deduction from salary (installment-based)
- **FR-J3.3**: Custody items: assign company assets to employees
- **FR-J3.4**: Custody return and settlement

### K) BI & Reporting

#### K1. Dashboards
- **FR-K1.1**: Executive dashboard: total revenue, collections, overdue, units available/sold
- **FR-K1.2**: Sales dashboard: funnel, conversion rates, daily/weekly bookings, agent performance
- **FR-K1.3**: Collections dashboard: target vs actual, DSO, aging chart, top overdue
- **FR-K1.4**: Project dashboard: budget vs actual, completion %, contractor status
- **FR-K1.5**: Inventory dashboard: stock levels, top consumed items, wastage
- **FR-K1.6**: Unit analytics: velocity, avg price per sqm, availability by project/type

#### K2. Reports
- **FR-K2.1**: Customer statement (installments + payments + balance)
- **FR-K2.2**: Unit statement (booking history, contract, payments, status)
- **FR-K2.3**: Broker commission statement
- **FR-K2.4**: Contractor statement (claims, payments, retention)
- **FR-K2.5**: Aging report (AR and AP)
- **FR-K2.6**: Bounced cheques report
- **FR-K2.7**: General ledger detail by account
- **FR-K2.8**: Sales report by project, agent, period
- **FR-K2.9**: Collections report by project, method, period
- **FR-K2.10**: Inventory valuation report

#### K3. Exports
- **FR-K3.1**: All reports exportable to Excel/CSV
- **FR-K3.2**: PDF generation with branded templates
- **FR-K3.3**: Scheduled report delivery via email (optional)

### L) Integrations
- **FR-L1**: Email notifications via SMTP/SendGrid
- **FR-L2**: SMS notifications via configurable gateway (Twilio stub)
- **FR-L3**: WhatsApp Business API integration (stub)
- **FR-L4**: Payment gateway integration (stub for Stripe/PayTabs)
- **FR-L5**: SSO via OIDC (Google, Azure AD)
- **FR-L6**: Webhook system for external integrations
- **FR-L7**: REST API for third-party access (all endpoints)

### M) Security & Operations
- **FR-M1**: RBAC with granular permissions
- **FR-M2**: Row-level access control (user sees only assigned projects/branches)
- **FR-M3**: Input validation on all API endpoints
- **FR-M4**: Rate limiting (configurable per tenant/endpoint)
- **FR-M5**: Encryption: TLS in transit, AES-256 at rest for sensitive fields
- **FR-M6**: Automated backups (daily full, hourly incremental)
- **FR-M7**: Disaster recovery plan with RTO < 4h, RPO < 1h
- **FR-M8**: Monitoring: uptime, latency, error rates, queue depths
- **FR-M9**: Alerting: PagerDuty/Slack integration for critical issues
- **FR-M10**: API versioning (URL-based: /api/v1/)
- **FR-M11**: Data import tools (Excel/CSV) for migration
- **FR-M12**: Health check endpoints for load balancers

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Availability** | 99.9% uptime |
| **Response Time** | P95 < 500ms for API calls |
| **Concurrent Users** | 500 per tenant |
| **Data Volume** | 100K units, 1M transactions per tenant |
| **Backup RPO** | < 1 hour |
| **Backup RTO** | < 4 hours |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Mobile** | Responsive design, PWA-capable |
| **Languages** | English (default), Arabic (RTL) |
| **Accessibility** | WCAG 2.1 AA |

---

## 5. Constraints & Assumptions

1. MVP targets single-region deployment; multi-region is a post-MVP enhancement
2. E-signature integration is a stub (future: DocuSign/Adobe Sign)
3. GIS/maps integration is optional and uses embedded Google Maps/OpenStreetMap
4. WhatsApp/SMS are notification stubs; full conversational AI is out of scope
5. Customer/broker portals are post-MVP but API supports them from day one
6. Fiscal/tax rules are configurable; no country-specific tax engine built-in
7. Mobile native apps are out of scope; responsive web + PWA is the approach
