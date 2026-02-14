# Real Estate ERP — Accounting Mapping

## 1. Chart of Accounts Template

### Account Structure: `{Type}-{SubType}-{Sequence}`
Example: `1100` = Assets → Current Assets → Accounts Receivable

```
1000  ASSETS
├── 1100  Current Assets
│   ├── 1101  Cash on Hand
│   ├── 1102  Petty Cash - Branch 1
│   ├── 1110  Bank - Main Account (AED)
│   ├── 1111  Bank - USD Account
│   ├── 1120  Cheques Under Collection
│   ├── 1130  Accounts Receivable - Sales
│   ├── 1131  Accounts Receivable - Booking Fees
│   ├── 1132  Accounts Receivable - Penalties
│   ├── 1133  Accounts Receivable - Maintenance Deposits
│   ├── 1140  Advance to Contractors
│   ├── 1141  Advance to Suppliers
│   ├── 1142  Employee Advances
│   ├── 1150  Prepaid Expenses
│   ├── 1160  Inventory - Raw Materials
│   ├── 1161  Inventory - Consumables
│   └── 1170  Other Current Assets
├── 1200  Non-Current Assets
│   ├── 1210  Land
│   ├── 1220  Buildings
│   ├── 1221  Accumulated Depreciation - Buildings
│   ├── 1230  Vehicles
│   ├── 1231  Accumulated Depreciation - Vehicles
│   ├── 1240  Furniture & Equipment
│   ├── 1241  Accumulated Depreciation - F&E
│   ├── 1250  IT Equipment
│   ├── 1251  Accumulated Depreciation - IT
│   └── 1260  Projects Under Development (WIP)

2000  LIABILITIES
├── 2100  Current Liabilities
│   ├── 2110  Accounts Payable - Vendors
│   ├── 2111  Accounts Payable - Contractors
│   ├── 2120  Retention Payable
│   ├── 2130  Accrued Expenses
│   ├── 2140  VAT Payable
│   ├── 2141  Stamp Duty Payable
│   ├── 2142  Withholding Tax Payable
│   ├── 2150  Salaries Payable
│   ├── 2151  Social Insurance Payable
│   ├── 2160  Customer Deposits (Booking Fees - Refundable)
│   ├── 2170  Deferred Revenue - Unit Sales
│   ├── 2171  Deferred Revenue - Maintenance
│   ├── 2180  Maintenance Deposit Liability
│   ├── 2190  Advance from Customers
│   └── 2195  Broker Commissions Payable
├── 2200  Non-Current Liabilities
│   ├── 2210  Long-term Loans
│   └── 2220  End of Service Benefits

3000  EQUITY
├── 3100  Share Capital
├── 3200  Retained Earnings
├── 3300  Current Year Earnings
└── 3400  Reserves

4000  REVENUE
├── 4100  Unit Sales Revenue
├── 4110  Revenue - Apartments
├── 4120  Revenue - Villas
├── 4130  Revenue - Commercial
├── 4200  Penalty Income (Late Payments)
├── 4210  Cancellation Fee Income
├── 4220  Transfer Fee Income
├── 4230  Admin Fee Income
├── 4300  Interest Income
├── 4400  Forex Gain
└── 4500  Other Income

5000  COST OF SALES
├── 5100  Cost of Units Sold
├── 5110  Land Cost Allocated
├── 5120  Construction Cost Allocated
├── 5130  Infrastructure Cost Allocated
├── 5140  Design & Consultancy Allocated
└── 5150  Site Overhead Allocated

6000  OPERATING EXPENSES
├── 6100  Salaries & Wages
│   ├── 6110  Basic Salary
│   ├── 6120  Allowances
│   ├── 6130  Overtime
│   ├── 6140  Bonuses
│   └── 6150  End of Service Provision
├── 6200  Sales & Marketing
│   ├── 6210  Advertising
│   ├── 6220  Broker Commissions
│   ├── 6230  Sales Events
│   └── 6240  Promotional Materials
├── 6300  General & Administrative
│   ├── 6310  Rent
│   ├── 6320  Utilities
│   ├── 6330  Office Supplies
│   ├── 6340  Insurance
│   ├── 6350  Legal & Professional Fees
│   ├── 6360  Depreciation Expense
│   ├── 6370  IT & Software
│   └── 6380  Travel & Transportation
├── 6400  Finance Costs
│   ├── 6410  Bank Charges
│   ├── 6420  Interest Expense
│   └── 6430  Forex Loss
└── 6500  Project Costs (Direct)
    ├── 6510  Materials Consumed
    ├── 6520  Labor Cost (Direct)
    ├── 6530  Subcontractor Cost
    ├── 6540  Equipment Rental
    └── 6550  Site Overhead
```

---

## 2. Event-to-Journal Entry Mapping

### Legend
- **Dr** = Debit, **Cr** = Credit
- Accounts shown by code; actual account resolved from `accounting_rules` table per company
- All entries auto-generated on business event, tagged with `source_type` + `source_id`

---

### 2.1 Booking Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 1 | **Booking Fee Received (Refundable)** | 1101/1110 (Cash/Bank) | 2160 (Customer Deposits) | Booking fee amount | Liability until contract signed |
| 2 | **Booking Fee Received (Non-refundable)** | 1101/1110 (Cash/Bank) | 4210 (Cancellation Fee Income) | Booking fee amount | Recognized immediately |
| 3 | **Booking Fee Received (Deducted from 1st)** | 1101/1110 (Cash/Bank) | 2190 (Advance from Customers) | Booking fee amount | Applied to first installment later |
| 4 | **Booking Cancelled (Refundable fee)** | 2160 (Customer Deposits) | 1101/1110 (Cash/Bank) | Refund amount | Return deposit |
| 5 | **Booking Cancelled (Non-refundable)** | No entry | — | — | Already recognized as income |
| 6 | **Booking Expired (Refundable)** | 2160 (Customer Deposits) | 2110 (AP) or Cash | Deposit amount | Refund payable |

### 2.2 Contract Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 7 | **Contract Signed** | 1130 (AR - Sales) | 2170 (Deferred Revenue) | Total contract amount | AR created, revenue deferred |
| 8 | **Booking Fee Applied to Contract** | 2190 (Advance from Customers) | 1130 (AR - Sales) | Booking fee | Reduces AR |
| 9 | **Maintenance Deposit Invoiced** | 1133 (AR - Maint Deposit) | 2180 (Maint Deposit Liability) | Deposit amount | Separate ledger |
| 10 | **Contract Cancelled - Write off AR** | 2170 (Deferred Revenue) | 1130 (AR - Sales) | Remaining AR | Reverse unrealized |
| 10b | **Contract Cancelled - Penalty** | 1130 (AR - Sales) or Cash | 4210 (Cancellation Fee) | Penalty amount | Fee income |
| 10c | **Contract Cancelled - Refund Payable** | 2190 (Advance/Deposit) | 2110 (AP) | Refund amount | Create AP for refund |
| 11 | **Ownership Transfer** | Close old AR + new AR | — | — | Combined: reverse old, create new contract entries |
| 12 | **Unit Swap - Price Increase** | 1130 (AR - Sales) | 2170 (Deferred Revenue) | Difference | Additional AR |
| 12b | **Unit Swap - Price Decrease** | 2170 (Deferred Revenue) | 1130 (AR - Sales) | Difference | Reduce AR |

### 2.3 Collection Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 13 | **Cash Payment Received** | 1101 (Cash on Hand) | 1130 (AR - Sales) | Payment amount | Reduces AR |
| 14 | **Bank Transfer Received** | 1110 (Bank) | 1130 (AR - Sales) | Payment amount | Reduces AR |
| 15 | **Cheque Received** | 1120 (Cheques Under Collection) | 1130 (AR - Sales) | Cheque amount | Cheque in hand |
| 16 | **Cheque Deposited** | No new entry | — | — | Status change only (within 1120) |
| 17 | **Cheque Cleared** | 1110 (Bank) | 1120 (Cheques Under Collection) | Cheque amount | Move to bank |
| 18 | **Cheque Bounced** | 1130 (AR - Sales) | 1120 (Cheques Under Collection) | Cheque amount | Reverse collection |
| 18b | **Bounced Cheque Penalty** | 1132 (AR - Penalties) | 4200 (Penalty Income) | Penalty amount | Additional charge |
| 19 | **Payment Reversed (General)** | 1130 (AR - Sales) | 1101/1110 (Cash/Bank) | Original amount | Exact reversal |
| 20 | **Penalty Collected** | 1101/1110 (Cash/Bank) | 1132 (AR - Penalties) | Penalty amount | Reduces penalty AR |
| 21 | **Maintenance Deposit Collected** | 1101/1110 (Cash/Bank) | 1133 (AR - Maint Deposit) | Amount | Reduces maint AR |
| 22 | **Advance Payment (overpayment)** | 1101/1110 (Cash/Bank) | 2190 (Advance from Customers) | Excess amount | Liability until allocated |

### 2.4 Penalty & Installment Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 23 | **Installment Due (accrual)** | No entry on due | — | — | AR already exists from contract signing |
| 24 | **Late Penalty Applied** | 1132 (AR - Penalties) | 4200 (Penalty Income) | Penalty amount | Daily/monthly accrual |
| 25 | **Penalty Waived** | 4200 (Penalty Income) | 1132 (AR - Penalties) | Waived amount | Reversal of income |
| 26 | **Installment Waived** | 2170 (Deferred Revenue) | 1130 (AR - Sales) | Waived amount | Reduce both |

### 2.5 Refund Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 27 | **Refund Approved (create payable)** | 2190 (Advance from Cust) | 2110 (AP - Refund) | Net refund | After penalties deducted |
| 28 | **Refund Paid (cash)** | 2110 (AP - Refund) | 1101 (Cash) | Refund amount | Settle payable |
| 29 | **Refund Paid (bank)** | 2110 (AP - Refund) | 1110 (Bank) | Refund amount | Settle payable |

### 2.6 Revenue Recognition Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 30 | **Revenue Recognized (Delivery-based)** | 2170 (Deferred Revenue) | 4100 (Unit Sales Revenue) | Full contract amount | At handover |
| 31 | **Revenue Recognized (POC)** | 2170 (Deferred Revenue) | 4100 (Unit Sales Revenue) | % × contract amount | Monthly based on completion % |
| 32 | **Revenue Recognized (Milestone)** | 2170 (Deferred Revenue) | 4100 (Unit Sales Revenue) | Milestone % × amount | At each milestone |
| 33 | **Cost of Sales (at recognition)** | 5100 (COGS) | 1260 (WIP/Projects Under Dev) | Allocated cost | Match cost to revenue |

### 2.7 Procurement & Inventory Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 34 | **GRN Confirmed (Goods Received)** | 1160 (Inventory) | 2110 (AP - Vendors) | GRN cost | Inventory in, payable created |
| 35 | **Vendor Bill Matched** | No additional entry | — | — | Bill matched to GRN AP |
| 36 | **Vendor Payment** | 2110 (AP - Vendors) | 1110 (Bank) | Payment amount | Settle payable |
| 36b | **Vendor Payment - WHT** | 2110 (AP - Vendors) | 2142 (WHT Payable) | WHT amount | Withholding deducted |
| 37 | **Material Issued to Project** | 6510 (Materials Consumed) or 1260 (WIP) | 1160 (Inventory) | Issue cost | Job costing |
| 38 | **Inventory Adjustment (Gain)** | 1160 (Inventory) | 4500 (Other Income) | Adjustment cost | Count variance |
| 39 | **Inventory Adjustment (Loss)** | 6510 (Materials Consumed) | 1160 (Inventory) | Adjustment cost | Count variance |

### 2.8 Contractor Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 40 | **Advance to Contractor** | 1140 (Advance to Contractors) | 1110 (Bank) | Advance amount | Paid upfront |
| 41 | **Progress Claim Approved** | 1260 (WIP) or 6530 (Subcontractor) | 2111 (AP - Contractors) | Gross claim | Before deductions |
| 41b | **Claim - Advance Recovery** | 2111 (AP - Contractors) | 1140 (Advance to Contractors) | Recovery amount | Reduce advance |
| 41c | **Claim - Retention Held** | 2111 (AP - Contractors) | 2120 (Retention Payable) | Retention amount | Hold retention |
| 41d | **Claim - Penalty Deduction** | 2111 (AP - Contractors) | 4200 (Penalty Income) | Penalty amount | Contractor penalty |
| 42 | **Contractor Payment** | 2111 (AP - Contractors) | 1110 (Bank) | Net payment | After all deductions |
| 43 | **Retention Released** | 2120 (Retention Payable) | 1110 (Bank) | Released amount | Per schedule |

### 2.9 Broker Commission Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 44 | **Commission Accrued** | 6220 (Broker Commissions Exp) | 2195 (Commissions Payable) | Gross amount | On trigger event |
| 45 | **Commission Paid** | 2195 (Commissions Payable) | 1110 (Bank) | Net amount | After WHT |
| 45b | **Commission WHT** | 2195 (Commissions Payable) | 2142 (WHT Payable) | WHT amount | Deducted |

### 2.10 HR & Payroll Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 46 | **Salary Expense** | 6110-6150 (Salary accounts) | 2150 (Salaries Payable) | Gross salary | Per employee |
| 47 | **Salary Deductions** | 2150 (Salaries Payable) | 2151 (Social Insurance) | Deduction | Employee share |
| 47b | **Salary - Advance Deduction** | 2150 (Salaries Payable) | 1142 (Employee Advances) | Installment | Reduce advance |
| 48 | **Salary Payment** | 2150 (Salaries Payable) | 1110 (Bank) | Net salary | Bank transfer |
| 49 | **Employee Advance Given** | 1142 (Employee Advances) | 1110 (Bank) | Advance amount | Paid to employee |

### 2.11 Other Events

| # | Event | Debit Account | Credit Account | Amount | Notes |
|---|---|---|---|---|---|
| 50 | **Bank Transfer (internal)** | 1110-B (Destination Bank) | 1110-A (Source Bank) | Amount | Between own accounts |
| 51 | **Cash to Bank Deposit** | 1110 (Bank) | 1101 (Cash) | Amount | Cash deposit |
| 52 | **Depreciation** | 6360 (Depreciation Exp) | 1221/1231/etc (Accum Dep) | Monthly amount | Per asset |
| 53 | **Forex Gain** | Various | 4400 (Forex Gain) | Gain amount | On multi-currency settlement |
| 54 | **Forex Loss** | 6430 (Forex Loss) | Various | Loss amount | On multi-currency settlement |
| 55 | **Maint Deposit Spent** | 2180 (Maint Dep Liability) | 1101/1110 (Cash/Bank) | Spent amount | Approved spending |

---

## 3. Revenue Recognition Scenarios

### Scenario A: Delivery-Based (Default for off-plan sales)
- Contract signed for AED 1,500,000
- All collections go to AR reduction + Deferred Revenue
- At handover (delivery): full 1,500,000 recognized as revenue
- Cost of sales matched at same time

**Timeline:**
```
Contract Signed:  Dr AR 1,500,000  |  Cr Deferred Revenue 1,500,000
Collect 150,000:  Dr Bank 150,000  |  Cr AR 150,000
Collect 100,000:  Dr Bank 100,000  |  Cr AR 100,000
... (monthly collections over 2 years)
Handover:         Dr Deferred Revenue 1,500,000  |  Cr Revenue 1,500,000
                  Dr COGS 900,000                |  Cr WIP 900,000
```

### Scenario B: Percentage of Completion (POC)
- Same contract AED 1,500,000
- Project completion tracked monthly
- Revenue recognized proportionally

**Timeline:**
```
Contract Signed:  Dr AR 1,500,000  |  Cr Deferred Revenue 1,500,000
Month 3 (10% complete):
  Dr Deferred Revenue 150,000  |  Cr Revenue 150,000
  Dr COGS 90,000               |  Cr WIP 90,000
Month 6 (30% complete): additional 20% recognized
  Dr Deferred Revenue 300,000  |  Cr Revenue 300,000
  Dr COGS 180,000              |  Cr WIP 180,000
... continues monthly
```

### Scenario C: Milestone-Based
- Milestones defined: Booking 5%, Contract 10%, 50% Paid 25%, Handover 60%
- Revenue recognized at each milestone

**Timeline:**
```
Contract Signed:  Dr AR 1,500,000  |  Cr Deferred Revenue 1,500,000
At Booking (5%):
  Dr Deferred Revenue 75,000  |  Cr Revenue 75,000
At Contract (10%):
  Dr Deferred Revenue 150,000  |  Cr Revenue 150,000
At 50% Paid (25%):
  Dr Deferred Revenue 375,000  |  Cr Revenue 375,000
At Handover (60%):
  Dr Deferred Revenue 900,000  |  Cr Revenue 900,000
```

---

## 4. Multi-Currency Handling

When a transaction occurs in a foreign currency:
1. Record in both foreign currency and base (functional) currency
2. Use exchange rate at transaction date
3. On settlement, calculate forex gain/loss

**Example: USD contract, AED functional**
```
Contract (1 USD = 3.67 AED):
  Dr AR (USD) 100,000 / AR (AED) 367,000
  Cr Deferred Revenue (USD) 100,000 / (AED) 367,000

Collection when 1 USD = 3.70 AED:
  Dr Bank (AED) 37,000  (10,000 USD × 3.70)
  Cr AR (AED) 36,700    (10,000 USD × 3.67)
  Cr Forex Gain (AED) 300
```

---

## 5. Tax Treatment

### VAT on Unit Sales
- If VAT applicable: contract total_amount includes VAT
- VAT portion separated in journal entry

```
Contract with 5% VAT:
  Unit Price: 1,000,000
  VAT: 50,000
  Total: 1,050,000

  Dr AR 1,050,000
  Cr Deferred Revenue 1,000,000
  Cr VAT Payable 50,000
```

### Withholding Tax on Payments
- Applied when paying brokers/contractors
- Reduces payment, creates WHT payable

```
Broker Commission 100,000 with 10% WHT:
  Dr Commission Expense 100,000
  Cr WHT Payable 10,000
  Cr Commission Payable 90,000

Payment:
  Dr Commission Payable 90,000
  Cr Bank 90,000
```
