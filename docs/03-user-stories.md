# Real Estate ERP — Epics, User Stories & Acceptance Criteria

## Epic A: Platform Core

### A1: Multi-Tenancy
**US-A1.1** As a **System Admin**, I want to create a new tenant so that a new client can start using the platform.
- AC: Tenant created with name, subdomain, admin email; admin user receives activation email; default settings applied.

**US-A1.2** As a **Tenant Admin**, I want to configure tenant settings (logo, timezone, currency, fiscal year) so the system matches our organization.
- AC: Settings saved; logo displayed in header; dates/currency formatted per settings; fiscal year used in accounting periods.

**US-A1.3** As a **Tenant Admin**, I want complete data isolation so no other tenant can see our data.
- AC: Queries always filter by tenant_id; RLS enforced at DB level; API returns 404 for cross-tenant IDs.

### A2: Organizational Hierarchy
**US-A2.1** As a **Tenant Admin**, I want to create companies with independent accounting settings so we can manage multiple legal entities.
- AC: Company created with name, legal name, tax ID, default currency, COA; company-level reports available.

**US-A2.2** As a **Company Admin**, I want to create branches under my company so we can manage regional operations.
- AC: Branch created with name, address, contact; inherits company settings; branch-specific users assignable.

**US-A2.3** As a **Branch Manager**, I want to create projects under my branch so we can track real estate developments.
- AC: Project created with name, code, location, type, expected dates, assigned users; hierarchy (phase/building/floor/unit) manageable from project.

### A3: Master Data
**US-A3.1** As a **Tenant Admin**, I want to manage lookup values (unit types, finishing levels, orientations, view types) so the system reflects our business.
- AC: CRUD operations on all lookup tables; values used in dropdowns across the system; soft-delete prevents data loss.

**US-A3.2** As a **Finance Manager**, I want to manage currencies and exchange rates so we can handle multi-currency transactions.
- AC: Currencies with ISO codes; daily exchange rates; auto-conversion in transactions; forex gain/loss calculated.

**US-A3.3** As a **Finance Manager**, I want to configure tax rules so invoices and journals include correct tax treatment.
- AC: Tax types (VAT, stamp duty, etc.) with rates, effective dates; tax applied in contracts, invoices, payments.

**US-A3.4** As a **Tenant Admin**, I want customizable document number sequences per company so each entity has its own numbering.
- AC: Pattern like `{prefix}-{year}-{seq:5}`; separate sequences per document type per company; no gaps on committed transactions.

### A4: Approval Workflows
**US-A4.1** As a **Tenant Admin**, I want to configure approval workflows per action type and threshold so the right people approve the right things.
- AC: Workflow definition: action type, condition (field, operator, value), approvers (role or user), sequence; workflows triggered automatically.

**US-A4.2** As an **Approver**, I want to see my pending approvals and act on them so I don't block business processes.
- AC: Approval inbox with details; approve/reject with comments; requester notified of decision; entity status updates.

**US-A4.3** As a **Tenant Admin**, I want approval delegation so absences don't block workflows.
- AC: Delegate to another user for date range; delegate receives notifications; both can approve during overlap.

### A5: Audit & Compliance
**US-A5.1** As an **Auditor**, I want to search audit logs by entity, user, date, and action so I can investigate activity.
- AC: Logs include: entity_type, entity_id, action, user_id, timestamp, IP, old_values, new_values; filterable; non-deletable.

**US-A5.2** As a **Tenant Admin**, I want immutable financial event logs so we have a tamper-proof record.
- AC: Financial events (bookings, contracts, payments, journals) stored in append-only log; no update/delete; hash chain optional.

### A6: Document Management
**US-A6.1** As a **User**, I want to attach files to any business entity so supporting documents are always accessible.
- AC: Upload to S3; metadata stored (name, type, size, uploaded_by, date); linked to entity; accessible from entity detail page.

**US-A6.2** As a **User**, I want to generate printable documents (contracts, receipts, invoices) from templates so I can produce professional output.
- AC: Templates with merge fields; generate PDF; download or email; template versioning; bilingual (EN/AR) support.

---

## Epic B: Property Catalog & Availability

### B1: Unit Registry
**US-B1.1** As a **Project Manager**, I want to define the project hierarchy (phases, buildings, floors, units) so the full inventory is catalogued.
- AC: Hierarchy created; each level has appropriate fields; navigation tree in UI.

**US-B1.2** As a **Project Manager**, I want to import units from Excel so I can bulk-load large inventories.
- AC: Template downloadable; upload validates data; preview before commit; error report for invalid rows; units created with all attributes.

**US-B1.3** As a **Sales Agent**, I want to view unit availability with filters so I can find suitable units for customers.
- AC: Filter by project, type, bedrooms, area range, price range, floor, orientation, view, status; results in grid/card view; real-time status.

**US-B1.4** As a **System**, unit status transitions must follow the defined state machine so invalid transitions are prevented.
- AC: Only valid transitions allowed (see Workflows doc); each transition logged in history; reason required for cancellation/block.

### B2: Pricing
**US-B2.1** As a **Sales Manager**, I want to create price lists with effective dates so prices are versioned and auditable.
- AC: Price list with name, effective date, expiry; per-unit/per-sqm prices; override hierarchy (project → phase → building → unit).

**US-B2.2** As a **Sales Manager**, I want to create promotions with discount rules and validity periods so we can run sales campaigns.
- AC: Promotion with discount type, value, applicable units, start/end date; auto-applied in quotations; approval required if exceeds threshold.

**US-B2.3** As a **Sales Agent**, I want price freezing on a quotation so the customer has time to decide at the quoted price.
- AC: Price frozen for configurable duration; countdown visible; auto-expire releases freeze; only one active freeze per unit.

### B3: Availability
**US-B3.1** As a **System**, concurrent booking attempts for the same unit must be prevented so we never double-book.
- AC: Advisory lock acquired during booking; second attempt gets "unit not available" error; lock released on transaction end.

**US-B3.2** As a **System**, soft reservations must auto-expire so units are not held indefinitely.
- AC: Background job runs every minute; expired reservations → unit status back to Available; notification sent to agent.

---

## Epic C: CRM & Sales

### C1: Leads
**US-C1.1** As a **Sales Agent**, I want to create leads with source and interest details so I can track my pipeline.
- AC: Lead created with name, phone, email, source, campaign, interested project/type/budget; duplicate check on phone/email.

**US-C1.2** As a **Sales Manager**, I want auto-assignment of leads to agents so distribution is fair and fast.
- AC: Rules configurable (round-robin, by project, by source); new leads auto-assigned; notification sent to agent.

**US-C1.3** As a **Sales Manager**, I want SLA tracking on lead follow-up so no lead goes cold.
- AC: Timer starts on lead creation; alert if not contacted within SLA; escalation to manager after second breach.

### C2: Opportunities
**US-C2.1** As a **Sales Agent**, I want to create opportunities from qualified leads so I can track deals through the pipeline.
- AC: Opportunity linked to lead, contact, interested units; pipeline stage, expected close date, probability; activity log.

**US-C2.2** As a **Sales Agent**, I want to generate quotations with unit details, price, and payment plan so I can present a formal offer.
- AC: Quotation with unit, price, discount, payment plan, validity; PDF generation; version tracking; price freeze triggered.

**US-C2.3** As a **Sales Agent**, I want to convert an opportunity to a booking with one click so the process is seamless.
- AC: Pre-fills booking form from opportunity/quotation; validates unit availability; creates booking + reservation atomically.

### C3: Brokers
**US-C3.1** As a **Sales Manager**, I want to register brokers and define commission agreements so broker relationships are formalized.
- AC: Broker profile with company, contact, license; agreement with commission terms, validity, approved units/projects.

**US-C3.2** As a **System**, commissions must be auto-calculated based on agreement rules when a booking/contract/handover event occurs.
- AC: Commission calculated per method (fixed, %, tiered, milestone); pending approval; visible in broker statement.

**US-C3.3** As a **Finance Manager**, I want to approve and schedule broker commission payouts so payments are controlled.
- AC: Commission approval workflow; approved commissions added to payout batch; withholding tax deducted; payment recorded; journal entry created.

### C4: Marketing
**US-C4.1** As a **Sales Manager**, I want to track campaign costs and link leads to campaigns so I can calculate ROI.
- AC: Campaign with channel, budget, dates; leads linked to campaign; cost per lead, cost per booking calculated; dashboard widget.

---

## Epic D: Booking → Contracting → Legal

### D1: Booking
**US-D1.1** As a **Sales Agent**, I want to create a booking for a customer on a specific unit so the unit is reserved.
- AC: Booking created with customer, unit, price, discount, booking fee, payment plan, validity date; unit status → Reserved; booking receipt generated.

**US-D1.2** As a **System**, expired bookings must be auto-cancelled so units become available again.
- AC: Job checks booking validity; expired bookings → Cancelled; unit → Available; customer notified; booking fee handled per policy.

### D2: Customer KYC
**US-D2.1** As a **Sales Agent**, I want to create/update customer profiles with KYC documents so customer data is complete.
- AC: Customer with personal info, IDs, documents; verification workflow; co-buyers with ownership %; beneficiary info.

### D3: Contracts
**US-D3.1** As a **Sales Manager**, I want to generate a contract from a booking so the sale is formalized.
- AC: Contract pre-filled from booking; template with merge fields; editable before finalization; requires approval.

**US-D3.2** As a **System**, contract signing must trigger installment schedule generation and accounting entries.
- AC: Schedule auto-generated from payment plan; debit AR, credit deferred revenue; unit status → Sold; all in one transaction.

**US-D3.3** As a **Sales Manager**, I want to create contract addendums for amendments so changes are tracked.
- AC: Addendum with change details; original + amendments versioned; approval required; accounting adjustments if price changes.

### D4: Cancellations & Transfers
**US-D4.1** As a **Sales Manager**, I want to cancel a booking/contract with proper penalty and refund calculation.
- AC: Cancellation policy applied (fees, penalties); refund amount calculated; approval required; journal entries created; unit → Available.

**US-D4.2** As a **Sales Manager**, I want to transfer a contract to a new customer so ownership changes are handled.
- AC: Old contract closed; new contract created for new customer; transfer fee collected; all payments re-allocated; audit trail complete.

**US-D4.3** As a **Sales Manager**, I want to swap a customer's unit so they can move to a different unit.
- AC: Old unit released; new unit reserved; price difference handled; schedule adjusted; approval required; journal entries created.

---

## Epic E: Installments & Collections

**US-E1.1** As a **Finance Manager**, I want to define payment plan templates so they can be reused across contracts.
- AC: Template with components (down payment %, installment count/frequency, handover %, maintenance deposit); grace period; penalty rules.

**US-E2.1** As a **System**, installment schedules must be auto-generated from contracts with correct dates and amounts.
- AC: Schedule with installment number, due date, amount, type; rounding applied; total matches contract value exactly.

**US-E2.2** As a **Finance Manager**, I want to reschedule installments with approval so we can accommodate customers.
- AC: Rescheduling options: extend, defer, restructure; new schedule generated; approval required; old vs new comparison; audit logged.

**US-E3.1** As a **Cashier**, I want to create a receipt for a customer payment so collections are recorded.
- AC: Receipt with amount, method, reference; auto-allocate to installments (FIFO) or manual; receipt number generated; journal entry created.

**US-E3.2** As an **Accountant**, I want to manage the cheque lifecycle so cheque status is always accurate.
- AC: Cheque: received → under collection → deposited → cleared OR bounced; each transition logged; bounced cheque reverses payment and creates penalty.

**US-E3.3** As a **Collections Officer**, I want to see aging reports and trigger dunning actions so overdue amounts are collected.
- AC: Aging by customer, project, bucket; dunning workflow: auto-email at 30 days, SMS at 60, legal notice at 90; configurable.

**US-E5.1** As a **Finance Manager**, I want to process refunds with approval so cancelled contracts are settled.
- AC: Refund calculated (payments received - penalties - fees); approval required; payment issued; journal entries reverse AR and record cash outflow.

---

## Epic F: Finance & Accounting

**US-F1.1** As a **Finance Manager**, I want a pre-configured Chart of Accounts that I can customize so setup is fast.
- AC: Template COA loaded on company creation; accounts addable/editable; hierarchy maintained; segments configurable.

**US-F2.1** As an **Accountant**, I want to create and post journal entries so manual accounting adjustments are possible.
- AC: Journal with date, lines (account, debit, credit, description, dimensions); balanced validation; draft/posted/reversed status.

**US-F3.1** As a **System**, business events must auto-generate correct journal entries so the books are always in sync.
- AC: Configurable mapping per event type; entries created atomically with business transaction; entries reference source document.

**US-F4.1** As a **Finance Manager**, I want to run revenue recognition so revenue is recognized per our accounting policy.
- AC: Monthly run calculates recognition per method (delivery, POC, milestone); entries created for recognized revenue; deferred revenue reduced.

**US-F5.1** As an **Accountant**, I want to reconcile bank statements so bank and book balances match.
- AC: Import bank statement; auto-match by reference/amount/date; manual match for exceptions; reconciliation report; status tracked.

**US-F6.1** As an **Accountant**, I want to enter vendor bills and process payments so AP is managed.
- AC: Bill entry with line items; 3-way match (PO-GRN-Bill); payment scheduling; batch payment; withholding tax; journal entries.

**US-F8.1** As a **Finance Manager**, I want to generate financial statements (TB, P&L, BS, CF) so I can report to management.
- AC: Statements generated for any period; drill-down from summary to detail; export to Excel/PDF; comparative periods.

---

## Epic G: Procurement & Inventory

**US-G1.1** As a **Procurement Officer**, I want to create purchase requisitions so material needs are formalized.
- AC: PR with items, quantities, estimated cost, project/WBS, justification; approval workflow; approved PRs can generate RFQs/POs.

**US-G1.2** As a **Procurement Manager**, I want to create POs and track deliveries so procurement is controlled.
- AC: PO from PR/RFQ; vendor, items, prices, delivery date; approval; GRN against PO; partial deliveries tracked; PO status updated.

**US-G3.1** As a **Warehouse Keeper**, I want to manage stock movements so inventory is accurate.
- AC: Receive (GRN), issue (to project), transfer (between warehouses), adjust (with reason); real-time balance; movement history.

**US-G3.2** As a **Warehouse Keeper**, I want to issue materials to contractors/projects linked to WBS items so job costing is accurate.
- AC: Issue with project, WBS item, contractor; cost debited to WBS; inventory reduced; journal entry created.

---

## Epic H: Project Costing & Contractors

**US-H1.1** As a **Construction Manager**, I want to define WBS with budgets so I can track project costs.
- AC: WBS hierarchy; budget per item; committed (from POs), actual (from issues + claims); variance calculation; alerts on overrun.

**US-H2.1** As a **Construction Manager**, I want to manage contractor progress claims so payments are verified.
- AC: Claim with work items, quantities, rates; deductions (advance, retention, penalties); approval workflow; payment triggers journal entries.

**US-H2.2** As a **Construction Manager**, I want to track retention and release it per schedule so contractor payments are correct.
- AC: Retention calculated per claim; running total tracked; release schedule (e.g., 50% at completion, 50% after defect liability); approval required.

---

## Epic I: Handover & After-Sales

**US-I1.1** As a **Handover Officer**, I want to conduct handover inspections with checklists so quality is verified.
- AC: Checklist per unit type; items with pass/fail/NA; photos; snag list auto-generated from failures; assigned to contractor.

**US-I1.2** As a **Handover Officer**, I want to complete final handover with customer sign-off so ownership is transferred.
- AC: All snags resolved; final inspection passed; customer signs digitally; handover report PDF; unit status → Delivered; revenue recognition triggered.

**US-I2.1** As a **Customer Service Agent**, I want to manage maintenance tickets so customer issues are resolved.
- AC: Ticket with customer, unit, category, priority, SLA; assignment; status tracking; warranty check; resolution notes; customer notification.

---

## Epic J: HR & Payroll

**US-J1.1** As an **HR Manager**, I want to manage employee records and leave balances so HR data is centralized.
- AC: Employee profile; leave types and balances; leave request workflow; attendance tracking; documents.

**US-J2.1** As an **HR Manager**, I want to run monthly payroll so employees are paid correctly.
- AC: Salary calculation (basic + allowances - deductions); payslip generation; bank file; GL posting (salary expense, bank, deductions).

---

## Epic K: BI & Reporting

**US-K1.1** As an **Executive**, I want a dashboard showing key metrics so I have a real-time business overview.
- AC: Widgets: total sales, collections, overdue, units available/sold, project status; date range filter; auto-refresh.

**US-K2.1** As a **User**, I want to generate and export reports so I can analyze data offline.
- AC: Report parameters (date range, project, etc.); table/chart view; Excel/CSV/PDF export; print-friendly layout.

---

## Story Point Estimation Summary

| Epic | Stories | Est. Total Points |
|---|---|---|
| A: Platform Core | 15 | 120 |
| B: Property Catalog | 10 | 80 |
| C: CRM & Sales | 12 | 95 |
| D: Booking/Contracting | 10 | 110 |
| E: Installments/Collections | 10 | 100 |
| F: Finance & Accounting | 12 | 150 |
| G: Procurement & Inventory | 8 | 80 |
| H: Project Costing | 6 | 60 |
| I: Handover & After-Sales | 5 | 40 |
| J: HR & Payroll | 4 | 40 |
| K: BI & Reporting | 5 | 30 |
| **Total** | **~97** | **~905** |
