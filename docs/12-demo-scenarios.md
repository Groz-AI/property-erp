# Real Estate ERP — Demo Dataset & Scenarios

## 1. Tenant & Organization

```
Tenant: "Groz Real Estate Group" (slug: groz)
├── Company 1: "Groz Residential Development LLC"
│   ├── Branch: Head Office (Dubai)
│   └── Branch: Abu Dhabi Office
├── Company 2: "Groz Commercial Properties LLC"
│   └── Branch: Head Office (Dubai)
```

### Currencies
| Code | Name | Symbol | Decimal | Is Default |
|---|---|---|---|---|
| AED | UAE Dirham | د.إ | 2 | ✅ |
| USD | US Dollar | $ | 2 | |
| EUR | Euro | € | 2 | |

### Exchange Rates (as of seed date)
| From | To | Rate |
|---|---|---|
| USD | AED | 3.6725 |
| EUR | AED | 3.9800 |

### Tax Rules
| Name | Type | Rate | Inclusive |
|---|---|---|---|
| UAE VAT | vat | 5% | No |
| Registration Fee | registration | 4% | No |
| Withholding Tax - Broker | withholding | 5% | No |

---

## 2. Users & Roles

| # | Name | Email | Role | Scope |
|---|---|---|---|---|
| 1 | Ahmad Al-Rashid | ahmad@groz.ae | Tenant Admin | All |
| 2 | Sarah Mitchell | sarah@groz.ae | Sales Manager | Company 1, All branches |
| 3 | Omar Hassan | omar@groz.ae | Sales Agent | Company 1, HQ Branch |
| 4 | Fatima Al-Zahra | fatima@groz.ae | Sales Agent | Company 1, Abu Dhabi |
| 5 | David Chen | david@groz.ae | Finance Manager | Company 1 |
| 6 | Layla Ibrahim | layla@groz.ae | Accountant | Company 1 |
| 7 | Mohammed Ali | moh@groz.ae | Cashier | Company 1, HQ |
| 8 | Priya Sharma | priya@groz.ae | Procurement Manager | Company 1 |
| 9 | James Wilson | james@groz.ae | Construction Manager | Project: Sunset Gardens |
| 10 | Nour El-Din | nour@groz.ae | Handover Officer | Company 1 |
| 11 | Rania Khalil | rania@groz.ae | Customer Service | Company 1 |
| 12 | Karim Youssef | karim@groz.ae | HR Manager | Company 1 |

Password for all demo users: `Demo@2026!`

---

## 3. Projects & Units

### Project 1: Sunset Gardens (Residential)
```
Company: Groz Residential Development LLC
Branch: Head Office
Code: SG
Type: Residential
Location: Dubai Hills, Dubai, UAE
Start: 2026-01-01 | Expected End: 2028-06-30
Completion: 35%
Revenue Recognition: Percentage of Completion
Default Price/sqm: AED 15,000
Currency: AED

Phases:
├── Phase 1 (SG-PH1) - "Garden Villas"
│   ├── Building A (SG-PH1-A) - 4 floors, 16 units
│   │   ├── Floor G: 4 garden apartments (3BR, 180sqm, garden view)
│   │   ├── Floor 1: 4 apartments (2BR, 120sqm, pool view)
│   │   ├── Floor 2: 4 apartments (2BR, 120sqm, city view)
│   │   └── Floor 3: 4 penthouses (3BR, 200sqm, panoramic)
│   └── Building B (SG-PH1-B) - 3 floors, 9 units
│       ├── Floor G: 3 garden duplexes (4BR, 280sqm)
│       ├── Floor 1: 3 apartments (1BR, 75sqm)
│       └── Floor 2: 3 apartments (2BR, 130sqm)
│
└── Phase 2 (SG-PH2) - "Lake Residences"  (Expected delivery: 2028-06)
    └── Building C (SG-PH2-C) - 5 floors, 25 units
        ├── Floor G: 5 studios (45sqm, garden view)
        ├── Floor 1: 5 apartments (1BR, 70sqm, lake view)
        ├── Floor 2: 5 apartments (2BR, 110sqm, lake view)
        ├── Floor 3: 5 apartments (2BR, 115sqm, lake view)
        └── Floor 4: 5 apartments (3BR, 160sqm, panoramic)
```

### Project 2: Business Park One (Commercial)
```
Company: Groz Commercial Properties LLC
Branch: Head Office
Code: BP1
Type: Commercial
Location: DIFC, Dubai, UAE
Start: 2026-03-01 | Expected End: 2027-12-31
Completion: 15%
Revenue Recognition: Delivery Based
Default Price/sqm: AED 25,000
Currency: AED

Phases:
└── Phase 1 (BP1-PH1) - "Tower Alpha"  (Expected delivery: 2027-12)
    └── Building T1 (BP1-PH1-T1) - Not yet available for demo, placeholder
        (no units seeded — to demonstrate creating units from scratch)
```

### Unit Inventory (50 units total across Sunset Gardens)

| Unit Code | Type | Beds | Area(sqm) | Price/sqm | Total Price | Status |
|---|---|---|---|---|---|---|
| SG-PH1-A-G01 | apartment | 3 | 180 | 15,000 | 2,700,000 | **sold** |
| SG-PH1-A-G02 | apartment | 3 | 180 | 15,000 | 2,700,000 | **reserved** |
| SG-PH1-A-G03 | apartment | 3 | 175 | 15,000 | 2,625,000 | available |
| SG-PH1-A-G04 | apartment | 3 | 185 | 15,000 | 2,775,000 | available |
| SG-PH1-A-101 | apartment | 2 | 120 | 14,500 | 1,740,000 | **sold** |
| SG-PH1-A-102 | apartment | 2 | 120 | 14,500 | 1,740,000 | **sold** |
| SG-PH1-A-103 | apartment | 2 | 118 | 14,500 | 1,711,000 | available |
| SG-PH1-A-104 | apartment | 2 | 122 | 14,500 | 1,769,000 | available |
| SG-PH1-A-201 | apartment | 2 | 120 | 14,000 | 1,680,000 | **sold** |
| SG-PH1-A-202 | apartment | 2 | 120 | 14,000 | 1,680,000 | available |
| SG-PH1-A-203 | apartment | 2 | 118 | 14,000 | 1,652,000 | blocked |
| SG-PH1-A-204 | apartment | 2 | 122 | 14,000 | 1,708,000 | available |
| SG-PH1-A-301 | apartment | 3 | 200 | 16,000 | 3,200,000 | **sold** |
| SG-PH1-A-302 | apartment | 3 | 200 | 16,000 | 3,200,000 | available |
| SG-PH1-A-303 | apartment | 3 | 195 | 16,000 | 3,120,000 | available |
| SG-PH1-A-304 | apartment | 3 | 205 | 16,000 | 3,280,000 | **reserved** |
| SG-PH1-B-G01 | duplex | 4 | 280 | 17,000 | 4,760,000 | **sold** |
| SG-PH1-B-G02 | duplex | 4 | 275 | 17,000 | 4,675,000 | available |
| SG-PH1-B-G03 | duplex | 4 | 285 | 17,000 | 4,845,000 | available |
| SG-PH1-B-101 | apartment | 1 | 75 | 13,000 | 975,000 | **sold** |
| SG-PH1-B-102 | apartment | 1 | 75 | 13,000 | 975,000 | available |
| SG-PH1-B-103 | apartment | 1 | 78 | 13,000 | 1,014,000 | available |
| SG-PH1-B-201 | apartment | 2 | 130 | 14,500 | 1,885,000 | available |
| SG-PH1-B-202 | apartment | 2 | 130 | 14,500 | 1,885,000 | available |
| SG-PH1-B-203 | apartment | 2 | 135 | 14,500 | 1,957,500 | available |
| SG-PH2-C-G01 | studio | 0 | 45 | 13,000 | 585,000 | available |
| SG-PH2-C-G02 | studio | 0 | 45 | 13,000 | 585,000 | available |
| SG-PH2-C-G03 | studio | 0 | 48 | 13,000 | 624,000 | available |
| SG-PH2-C-G04 | studio | 0 | 42 | 13,000 | 546,000 | available |
| SG-PH2-C-G05 | studio | 0 | 46 | 13,000 | 598,000 | available |
| SG-PH2-C-101 | apartment | 1 | 70 | 14,000 | 980,000 | available |
| SG-PH2-C-102 | apartment | 1 | 70 | 14,000 | 980,000 | available |
| SG-PH2-C-103 | apartment | 1 | 72 | 14,000 | 1,008,000 | available |
| SG-PH2-C-104 | apartment | 1 | 68 | 14,000 | 952,000 | available |
| SG-PH2-C-105 | apartment | 1 | 71 | 14,000 | 994,000 | available |
| SG-PH2-C-201 | apartment | 2 | 110 | 15,000 | 1,650,000 | available |
| SG-PH2-C-202 | apartment | 2 | 110 | 15,000 | 1,650,000 | available |
| SG-PH2-C-203 | apartment | 2 | 112 | 15,000 | 1,680,000 | available |
| SG-PH2-C-204 | apartment | 2 | 108 | 15,000 | 1,620,000 | available |
| SG-PH2-C-205 | apartment | 2 | 115 | 15,000 | 1,725,000 | available |
| SG-PH2-C-301 | apartment | 2 | 115 | 15,500 | 1,782,500 | available |
| SG-PH2-C-302 | apartment | 2 | 115 | 15,500 | 1,782,500 | available |
| SG-PH2-C-303 | apartment | 2 | 118 | 15,500 | 1,829,000 | available |
| SG-PH2-C-304 | apartment | 2 | 112 | 15,500 | 1,736,000 | available |
| SG-PH2-C-305 | apartment | 2 | 116 | 15,500 | 1,798,000 | available |
| SG-PH2-C-401 | apartment | 3 | 160 | 17,000 | 2,720,000 | available |
| SG-PH2-C-402 | apartment | 3 | 160 | 17,000 | 2,720,000 | available |
| SG-PH2-C-403 | apartment | 3 | 165 | 17,000 | 2,805,000 | available |
| SG-PH2-C-404 | apartment | 3 | 155 | 17,000 | 2,635,000 | available |
| SG-PH2-C-405 | apartment | 3 | 162 | 17,000 | 2,754,000 | available |

**Summary: 8 sold, 2 reserved, 1 blocked, 39 available = 50 units**

---

## 4. Customers (20)

| # | Name | Phone | Nationality | ID Type | Status | Notes |
|---|---|---|---|---|---|---|
| 1 | Khalid Al-Mansour | +971501001001 | AE | National ID | Verified | Has active contract |
| 2 | Elena Petrova | +971501001002 | RU | Passport | Verified | Has active contract |
| 3 | Rajesh Gupta | +971501001003 | IN | Passport | Verified | Has active contract |
| 4 | Aisha Mohammed | +971501001004 | AE | National ID | Verified | Has active contract |
| 5 | John Smith | +971501001005 | GB | Passport | Verified | Has completed contract |
| 6 | Li Wei | +971501001006 | CN | Passport | Verified | Has cancelled contract |
| 7 | Mariam Al-Hashimi | +971501001007 | AE | National ID | Verified | Has active contract + booking |
| 8 | Pierre Dubois | +971501001008 | FR | Passport | Verified | Has active booking |
| 9 | Nadia Al-Farsi | +971501001009 | OM | Passport | Verified | Has active booking |
| 10 | Carlos Rodriguez | +971501001010 | ES | Passport | Pending | Lead only |
| 11 | Yuki Tanaka | +971501001011 | JP | Passport | Pending | Lead only |
| 12 | Hassan Bazzi | +971501001012 | LB | Passport | Verified | Has active contract |
| 13 | Sofia Andersson | +971501001013 | SE | Passport | Verified | Transferred contract |
| 14 | Ahmed Saleh | +971501001014 | EG | Passport | Verified | Has active contract |
| 15 | Victoria Brown | +971501001015 | AU | Passport | Pending | Opportunity stage |
| 16 | Ali Reza | +971501001016 | IR | Passport | Flagged | Risk flagged |
| 17 | Anna Kowalski | +971501001017 | PL | Passport | Verified | Co-buyer with #1 |
| 18 | Tariq Al-Obaidi | +971501001018 | IQ | Passport | Verified | Referred by broker |
| 19 | Emily Watson | +971501001019 | US | Passport | Pending | Walk-in lead |
| 20 | Sami Haddad | +971501001020 | JO | Passport | Verified | Maintenance ticket |

---

## 5. Bookings (10)

| # | Booking# | Customer | Unit | Net Price | Fee | Status | Notes |
|---|---|---|---|---|---|---|---|
| 1 | BK-2026-0001 | Khalid (#1) | SG-PH1-A-G01 | 2,700,000 | 100,000 | **converted** | → Contract |
| 2 | BK-2026-0002 | Elena (#2) | SG-PH1-A-101 | 1,740,000 | 50,000 | **converted** | → Contract |
| 3 | BK-2026-0003 | Rajesh (#3) | SG-PH1-A-102 | 1,740,000 | 50,000 | **converted** | → Contract |
| 4 | BK-2026-0004 | Aisha (#4) | SG-PH1-A-201 | 1,680,000 | 50,000 | **converted** | → Contract |
| 5 | BK-2026-0005 | John (#5) | SG-PH1-A-301 | 3,200,000 | 150,000 | **converted** | → Completed contract |
| 6 | BK-2026-0006 | Li Wei (#6) | SG-PH1-B-G01 | 4,760,000 | 200,000 | **converted** | → Cancelled contract |
| 7 | BK-2026-0007 | Mariam (#7) | SG-PH1-B-101 | 975,000 | 30,000 | **converted** | → Active contract |
| 8 | BK-2026-0008 | Pierre (#8) | SG-PH1-A-G02 | 2,700,000 | 100,000 | **active** | Valid for 14 days |
| 9 | BK-2026-0009 | Nadia (#9) | SG-PH1-A-304 | 3,280,000 | 150,000 | **active** | Valid for 14 days |
| 10 | BK-2026-0010 | Hassan (#12) | SG-PH1-A-102 | 1,711,000 | 50,000 | **cancelled** | Customer changed mind |

---

## 6. Contracts (8)

| # | Contract# | Customer | Unit | Total | Status | Payment Plan |
|---|---|---|---|---|---|---|
| 1 | CT-2026-0001 | Khalid (#1) | SG-PH1-A-G01 | 2,700,000 | **active** | 10% DP, 24 monthly, 10% handover |
| 2 | CT-2026-0002 | Elena (#2) | SG-PH1-A-101 | 1,740,000 | **active** | 20% DP, 18 monthly, 10% handover |
| 3 | CT-2026-0003 | Rajesh (#3) | SG-PH1-A-102 | 1,740,000 | **active** | 10% DP, 24 monthly, 10% handover |
| 4 | CT-2026-0004 | Aisha (#4) | SG-PH1-A-201 | 1,680,000 | **active** | 30% DP, 12 quarterly, 10% handover |
| 5 | CT-2026-0005 | John (#5) | SG-PH1-A-301 | 3,200,000 | **completed** | 40% DP, 12 monthly, 20% handover |
| 6 | CT-2026-0006 | Li Wei (#6) | SG-PH1-B-G01 | 4,760,000 | **cancelled** | Was 10% DP, 36 monthly |
| 7 | CT-2026-0007 | Mariam (#7) | SG-PH1-B-101 | 975,000 | **active** | 20% DP, 12 monthly, 10% handover |
| 8 | CT-2026-0008 | Ahmed (#14)| SG-PH1-A-102 | 1,740,000 | **active** | 10% DP, 24 monthly, 10% handover |

---

## 7. Sample Installment Schedule (Contract CT-2026-0001, Khalid)

Total: AED 2,700,000 | Plan: 10% DP + 80% in 24 monthly + 10% handover + AED 25,000 maint deposit

| # | Type | Due Date | Amount | Paid | Status |
|---|---|---|---|---|---|
| 1 | Down Payment | 2026-01-15 | 270,000 | 270,000 | paid |
| 2 | Installment | 2026-02-15 | 90,000 | 90,000 | paid |
| 3 | Installment | 2026-03-15 | 90,000 | 45,000 | partially_paid |
| 4 | Installment | 2026-04-15 | 90,000 | 0 | overdue |
| 5 | Installment | 2026-05-15 | 90,000 | 0 | upcoming |
| ... | ... | ... | 90,000 | ... | upcoming |
| 25 | Installment | 2028-01-15 | 90,000 | 0 | upcoming |
| 26 | Handover | 2028-06-30 | 270,000 | 0 | upcoming |
| 27 | Maint Deposit | 2028-06-30 | 25,000 | 0 | upcoming |

---

## 8. Sample Receipts (30)

| # | Receipt# | Customer | Amount | Method | Date | Contract |
|---|---|---|---|---|---|---|
| 1 | RCP-2026-0001 | Khalid | 100,000 | Cash | 2026-01-10 | BK fee |
| 2 | RCP-2026-0002 | Khalid | 270,000 | Bank Transfer | 2026-01-15 | CT-0001 DP |
| 3 | RCP-2026-0003 | Khalid | 90,000 | Bank Transfer | 2026-02-15 | CT-0001 Inst#2 |
| 4 | RCP-2026-0004 | Khalid | 45,000 | Cheque | 2026-03-10 | CT-0001 Inst#3 partial |
| 5 | RCP-2026-0005 | Elena | 50,000 | Cash | 2026-01-12 | BK fee |
| 6 | RCP-2026-0006 | Elena | 348,000 | Bank Transfer | 2026-01-18 | CT-0002 DP |
| 7 | RCP-2026-0007 | Elena | 77,330 | Bank Transfer | 2026-02-18 | CT-0002 Inst |
| 8 | RCP-2026-0008 | Rajesh | 50,000 | Cash | 2026-01-14 | BK fee |
| 9 | RCP-2026-0009 | Rajesh | 174,000 | Bank Transfer | 2026-01-20 | CT-0003 DP |
| 10 | RCP-2026-0010 | Aisha | 50,000 | Cash | 2026-01-16 | BK fee |
| 11 | RCP-2026-0011 | Aisha | 504,000 | Bank Transfer | 2026-01-22 | CT-0004 DP (30%) |
| 12-20 | ... | Various | Various | Mix | Various | Mix |
| 21 | RCP-2026-0021 | John | 640,000 | Bank Transfer | 2025-12-01 | CT-0005 DP (40%) |
| 22 | RCP-2026-0022 | John | 3,200,000 | Various | Various | CT-0005 All paid |
| 23-30 | ... | Various | Various | Mix | Various | Mix |

### Sample Cheques (5)
| # | Cheque# | Customer | Amount | Due Date | Status |
|---|---|---|---|---|---|
| 1 | CHQ-001 | Khalid | 45,000 | 2026-03-10 | **cleared** |
| 2 | CHQ-002 | Rajesh | 60,000 | 2026-03-20 | **under_collection** |
| 3 | CHQ-003 | Aisha | 100,000 | 2026-04-01 | **received** |
| 4 | CHQ-004 | Mariam | 30,000 | 2026-02-28 | **bounced** |
| 5 | CHQ-005 | Mariam | 30,000 | 2026-03-15 | **received** (replacement) |

---

## 9. Brokers (3)

| # | Company | Contact | Commission Method | Rate | Agreements |
|---|---|---|---|---|---|
| 1 | Gulf Realty Partners | Ali Broker | Percentage | 3% of net price | Sunset Gardens PH1 |
| 2 | Prime Properties Int'l | Maria Agent | Tiered | 2% up to 2M, 3% above | All projects |
| 3 | Local Real Estate | Hassan Broker | Milestone | 1% booking, 1% contract, 1% handover | Sunset Gardens |

### Sample Commissions
| Broker | Contract | Trigger | Gross | WHT (5%) | Net | Status |
|---|---|---|---|---|---|---|
| Gulf Realty | CT-0001 (Khalid) | contract_signed | 81,000 | 4,050 | 76,950 | approved |
| Local RE | CT-0007 (Mariam) | booking_created | 9,750 | 487.50 | 9,262.50 | paid |

---

## 10. Procurement & Inventory

### Vendors (5)
| # | Name | Category | Payment Terms |
|---|---|---|---|
| 1 | Emirates Building Materials | Building materials | Net 30 |
| 2 | Gulf Steel Trading | Steel & rebar | Net 45 |
| 3 | Al Noor Electrical | Electrical supplies | Net 30 |
| 4 | Desert Sand & Aggregate | Sand & aggregate | COD |
| 5 | Premium Tiles & Finishes | Finishing materials | Net 60 |

### Items (10)
| Code | Name | Category | UoM | Avg Cost |
|---|---|---|---|---|
| MAT-001 | Portland Cement 50kg | Cement | Bag | AED 22 |
| MAT-002 | Steel Rebar 12mm | Steel | Ton | AED 2,800 |
| MAT-003 | Concrete Mix C30 | Concrete | m³ | AED 350 |
| MAT-004 | Red Brick Standard | Masonry | Piece | AED 0.85 |
| MAT-005 | Electrical Cable 2.5mm | Electrical | Meter | AED 3.50 |
| MAT-006 | PVC Pipe 4" | Plumbing | Meter | AED 12 |
| MAT-007 | Ceramic Tile 60x60 | Finishing | m² | AED 45 |
| MAT-008 | Paint Emulsion White | Finishing | Liter | AED 18 |
| MAT-009 | Sand Fine | Aggregate | Ton | AED 85 |
| MAT-010 | Gypsum Board 12mm | Finishing | Sheet | AED 28 |

### Sample PO
- PO-2026-0001: Vendor #1 (Emirates Building), Project: Sunset Gardens
  - 500 bags Cement @ AED 22 = 11,000
  - 200 m³ Concrete @ AED 350 = 70,000
  - Total: AED 81,000 | Status: partially_received

### Sample GRN
- GRN-2026-0001: Against PO-0001, 300 bags cement + 150 m³ concrete received

---

## 11. Contractors & Claims

### Contractors (3)
| # | Name | Specialization | Contract Value | Retention |
|---|---|---|---|---|
| 1 | Al Bina Construction | Main contractor (structure) | AED 15,000,000 | 10% |
| 2 | Spark Electrical Works | MEP - Electrical | AED 3,500,000 | 10% |
| 3 | Flow Plumbing Solutions | MEP - Plumbing | AED 2,800,000 | 10% |

### Sample Progress Claim
- Claim CLM-2026-0001: Contractor #1, Period Jan 2026
  - Gross: AED 2,500,000
  - Advance Recovery (10%): -250,000
  - Retention (10%): -250,000
  - Net Payable: AED 2,000,000
  - Status: approved, partially_paid (AED 1,500,000 paid)

---

## 12. HR/Payroll Sample

### Employees (5)
| # | Name | Department | Job Title | Basic Salary | Housing | Transport |
|---|---|---|---|---|---|---|
| 1 | Ahmad Al-Rashid | Management | CEO | 50,000 | 15,000 | 5,000 |
| 2 | Sarah Mitchell | Sales | Sales Manager | 25,000 | 8,000 | 3,000 |
| 3 | David Chen | Finance | Finance Manager | 30,000 | 10,000 | 3,000 |
| 4 | James Wilson | Construction | Construction Mgr | 28,000 | 9,000 | 3,000 |
| 5 | Rania Khalil | Customer Service | CS Agent | 12,000 | 5,000 | 2,000 |

### Sample Payroll Run
- Payroll PR-2026-01 (January 2026): 5 employees
  - Total Gross: AED 228,000
  - Total Deductions: AED 11,400 (5% social insurance)
  - Total Net: AED 216,600
  - Status: posted (JE created)

---

## 13. Demo Walkthrough Scenarios

### Scenario 1: New Sale (Happy Path)
1. Login as Sales Agent (Omar)
2. Create lead → Convert to opportunity
3. Generate quotation for SG-PH2-C-201 (2BR, AED 1,650,000)
4. Convert to booking → Pay booking fee AED 50,000 cash
5. Convert to contract → Sign
6. View installment schedule (27 installments generated)
7. Collect first installment via bank transfer
8. View customer statement

### Scenario 2: Cheque Bounce & Recovery
1. Login as Accountant (Layla)
2. View Mariam's cheque CHQ-004 (AED 30,000, bounced)
3. See reversed collection, installment back to overdue
4. Record replacement cheque CHQ-005
5. Deposit → Clear replacement cheque
6. Verify customer statement updated

### Scenario 3: Contract Cancellation & Refund
1. View Li Wei's contract CT-0006 (cancelled)
2. See penalty calculation (5% = AED 238,000)
3. See refund request (paid AED 676,000 - penalty AED 238,000 = refund AED 438,000)
4. Approve refund → Process bank payment
5. Verify journal entries (reverse AR, record refund)
6. Verify unit SG-PH1-B-G01 back to available (now sold again to customer #14)

### Scenario 4: Procurement to Job Costing
1. Login as Procurement Manager (Priya)
2. Create PR for 200 bags cement (project: Sunset Gardens, WBS: Foundation)
3. Approve PR → Create PO to vendor Emirates Building
4. Receive 200 bags (GRN) → Stock updated
5. Issue 150 bags to project → WBS actual cost updated
6. View project cost summary: planned vs actual
