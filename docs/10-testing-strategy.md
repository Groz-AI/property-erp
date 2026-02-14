# Real Estate ERP — Testing Strategy

## 1. Testing Pyramid

```
        ┌───────────┐
        │   E2E     │  ~50 tests (Playwright)
        │  Tests    │  Critical user flows
        ├───────────┤
        │Integration│  ~200 tests (Supertest + DB)
        │  Tests    │  API endpoints, DB operations
        ├───────────┤
        │  Unit     │  ~500+ tests (Jest)
        │  Tests    │  Services, validators, state machines
        └───────────┘
```

## 2. Unit Tests (Jest)

### Coverage Targets
| Layer | Target | Focus |
|---|---|---|
| Services (business logic) | 90% | State machines, calculations, validations |
| Validators/Pipes | 95% | Input validation, data transformation |
| Guards | 90% | Auth, RBAC, tenant isolation |
| Utils/Helpers | 95% | Date calculations, formatting, rounding |
| Controllers | 70% | Request routing (integration tests cover more) |

### Key Unit Test Scenarios

#### Installment Schedule Engine
```typescript
describe('InstallmentScheduleEngine', () => {
  it('generates correct schedule for 40/60 plan', () => {
    const schedule = engine.generate({
      totalAmount: 1_500_000,
      plan: { downPayment: 40, installments: { count: 24, frequency: 'monthly', pct: 50 }, handover: 10 },
      contractDate: new Date('2026-03-01'),
      roundingRule: 'nearest_10',
    });
    expect(schedule).toHaveLength(26); // 1 DP + 24 inst + 1 handover
    expect(schedule[0].amount).toBe(600_000); // 40%
    expect(schedule[1].amount).toBe(31_250); // 750k / 24 rounded
    expect(schedule.reduce((s, i) => s + i.amount, 0)).toBe(1_500_000); // exact total
  });

  it('handles rounding remainder in last installment');
  it('generates maintenance deposit as separate line');
  it('applies booking fee deduction to first installment');
  it('validates total matches contract amount');
});
```

#### Unit State Machine
```typescript
describe('UnitStateMachine', () => {
  it('allows available → soft_reserved');
  it('allows available → reserved');
  it('allows reserved → sold');
  it('allows sold → delivered');
  it('rejects available → sold (must go through reserved)');
  it('rejects delivered → available');
  it('allows sold → available on contract cancellation');
  it('allows blocked → available');
  it('rejects any → soft_reserved except available');
});
```

#### Penalty Calculation
```typescript
describe('PenaltyCalculator', () => {
  it('calculates fixed penalty correctly');
  it('calculates percentage penalty on overdue amount');
  it('calculates daily rate penalty for N days overdue');
  it('caps penalty at maximum amount');
  it('respects grace period (no penalty within grace)');
  it('handles multiple overdue installments independently');
});
```

#### Commission Calculator
```typescript
describe('CommissionCalculator', () => {
  it('calculates fixed amount commission');
  it('calculates percentage of contract value');
  it('calculates tiered commission (volume-based)');
  it('calculates milestone-based commission');
  it('deducts withholding tax');
  it('handles multi-milestone payouts');
});
```

#### Accounting Rules Engine
```typescript
describe('AccountingRulesEngine', () => {
  it('generates correct JE for booking fee (refundable)');
  it('generates correct JE for contract signing');
  it('generates correct JE for cash receipt');
  it('generates correct JE for cheque received');
  it('generates correct JE for cheque cleared');
  it('generates correct JE for cheque bounced');
  it('generates correct JE for contract cancellation');
  it('generates correct JE for refund payment');
  it('generates balanced entries (debit = credit)');
  it('tags entries with source_type and source_id');
  it('handles multi-currency with forex entries');
});
```

#### Revenue Recognition
```typescript
describe('RevenueRecognition', () => {
  it('recognizes full revenue at delivery (delivery-based)');
  it('recognizes proportional revenue (POC)');
  it('recognizes at milestones (milestone-based)');
  it('tracks deferred revenue correctly');
  it('handles cancellation reversal');
  it('matches COGS with recognized revenue');
});
```

---

## 3. Integration Tests (Supertest + PostgreSQL)

Uses a test database, seeded per test suite, transactions rolled back after each test.

### Setup
```typescript
// test/setup.ts
beforeAll(async () => {
  testApp = await Test.createTestingModule({ imports: [AppModule] })
    .compile();
  app = testApp.createNestApplication();
  await app.init();
  // Seed test tenant, company, users
});

afterAll(async () => {
  await app.close();
});
```

### Key Integration Test Scenarios

#### Auth Flow
```typescript
describe('POST /api/v1/auth/login', () => {
  it('returns tokens for valid credentials');
  it('returns 401 for invalid password');
  it('locks account after 5 failed attempts');
  it('rejects inactive user');
  it('sets tenant context from login');
});

describe('Protected endpoints', () => {
  it('returns 401 without token');
  it('returns 401 with expired token');
  it('returns 403 without required permission');
  it('filters data by tenant_id (RLS)');
});
```

#### Booking Flow (end-to-end API)
```typescript
describe('Booking Flow', () => {
  it('creates booking: unit → reserved, receipt generated', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${agentToken}`)
      .set('X-Idempotency-Key', uuidv4())
      .send({ customerId, unitId, netPrice: 1500000, bookingFee: 50000, ... });
    
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('active');
    
    // Verify unit status changed
    const unit = await getUnit(unitId);
    expect(unit.status).toBe('reserved');
    
    // Verify audit log created
    const logs = await getAuditLogs('booking', res.body.data.id);
    expect(logs).toHaveLength(1);
  });

  it('rejects booking for non-available unit');
  it('prevents concurrent booking of same unit');
  it('auto-cancels expired booking');
});
```

#### Collections Flow
```typescript
describe('Receipt & Allocation', () => {
  it('creates receipt and allocates FIFO');
  it('handles partial payment correctly');
  it('updates installment status to paid when fully paid');
  it('creates journal entry on receipt confirmation');
  it('reverses receipt and restores installment');
  it('handles cheque receipt and lifecycle');
});
```

#### Tenant Isolation
```typescript
describe('Tenant Isolation', () => {
  it('tenant A cannot see tenant B data');
  it('tenant A cannot update tenant B records');
  it('cross-tenant ID returns 404 not 403');
  it('RLS prevents direct SQL bypass');
});
```

#### Concurrency Tests
```typescript
describe('Concurrency', () => {
  it('prevents double booking with parallel requests', async () => {
    const [res1, res2] = await Promise.all([
      createBooking(unitId, customer1),
      createBooking(unitId, customer2),
    ]);
    const successes = [res1, res2].filter(r => r.status === 201);
    const conflicts = [res1, res2].filter(r => r.status === 409);
    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(1);
  });
});
```

---

## 4. E2E Tests (Playwright)

### Critical User Flows

| # | Flow | Steps |
|---|---|---|
| 1 | **Login → Dashboard** | Login → see dashboard widgets → navigate sidebar |
| 2 | **Create Project + Units** | Create project → phase → building → floor → bulk import units |
| 3 | **Lead → Booking** | Create lead → log activity → create opportunity → quotation → booking |
| 4 | **Booking → Contract** | Open booking → convert to contract → sign → verify schedule |
| 5 | **Collect Payment** | Create receipt → allocate to installments → verify statement |
| 6 | **Cheque Lifecycle** | Receive cheque → deposit → clear → verify bank balance |
| 7 | **Cancel Contract** | Cancel → approve → verify refund → verify unit available |
| 8 | **Procurement** | Create PR → approve → create PO → receive GRN → verify stock |
| 9 | **Progress Claim** | Create claim → submit → approve → pay → verify contractor statement |
| 10 | **Handover** | Create handover → inspect → snag → resolve → final → deliver |
| 11 | **Journal Entry** | Create manual JE → post → verify GL → trial balance |
| 12 | **Report Export** | Navigate to aging report → filter → export Excel → verify file |
| 13 | **AR/EN Toggle** | Switch language → verify RTL layout → verify translated text |
| 14 | **Role Restriction** | Login as cashier → verify cannot access admin pages |
| 15 | **Payroll Run** | Calculate → review → approve → post → verify payslips |

### Playwright Config
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

---

## 5. Test Data & Seed Scripts

### Seed Script Structure
```
backend/src/database/seeds/
├── 01-tenant.seed.ts
├── 02-users-roles.seed.ts
├── 03-master-data.seed.ts
├── 04-projects-units.seed.ts
├── 05-customers.seed.ts
├── 06-bookings-contracts.seed.ts
├── 07-installments-collections.seed.ts
├── 08-accounting.seed.ts
├── 09-procurement-inventory.seed.ts
├── 10-contractors.seed.ts
├── 11-hr-payroll.seed.ts
└── index.ts (run all in order)
```

### Seed Data Summary
- **1 Tenant**: "Acme Real Estate Group"
- **2 Companies**: "Acme RE Development", "Acme RE Commercial"
- **3 Branches**: HQ, North Branch, South Branch
- **2 Projects**: "Sunset Gardens" (residential), "Business Park One" (commercial)
- **4 Phases**: 2 per project
- **6 Buildings**: across projects
- **50 Units**: mix of apartments, villas, offices, shops
- **20 Customers**: with KYC data
- **10 Bookings**: various statuses
- **8 Contracts**: active, completed, cancelled
- **Installment schedules**: for all contracts
- **30 Receipts**: cash, bank transfer, cheque
- **5 Cheques**: various lifecycle stages
- **Chart of Accounts**: full template ~100 accounts
- **15 Journal Entries**: auto + manual
- **5 Vendors**: with POs and bills
- **3 Contractors**: with contracts and claims
- **10 Inventory items**: with movements
- **5 Employees**: with salary and leave data
- **3 Brokers**: with agreements and commissions

---

## 6. Test Environment Strategy

| Environment | Purpose | Data | Refresh |
|---|---|---|---|
| **Local** | Development | Seed data | On demand |
| **Test** | CI/CD automated tests | Fresh seed per run | Every pipeline run |
| **Staging** | UAT, demo | Production-like seed | Weekly |
| **Production** | Live | Real data | — |

### CI Pipeline Test Stages
```yaml
test:
  stage: test
  steps:
    - name: Lint
      run: npm run lint
    - name: Type Check
      run: npm run type-check
    - name: Unit Tests
      run: npm run test:unit -- --coverage
    - name: Start Test DB
      run: docker-compose -f docker-compose.test.yml up -d postgres redis
    - name: Run Migrations
      run: npm run migration:run
    - name: Seed Test Data
      run: npm run seed:test
    - name: Integration Tests
      run: npm run test:integration
    - name: E2E Tests
      run: npx playwright test
    - name: Coverage Report
      run: npm run test:coverage-report
```

---

## 7. Performance Testing

### Tool: k6

```javascript
// load-tests/booking-flow.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp up
    { duration: '3m', target: 50 },   // sustained
    { duration: '1m', target: 100 },  // peak
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95th percentile < 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: `agent${__VU}@test.com`, password: 'test123',
  }), { headers: { 'Content-Type': 'application/json' } });
  
  const token = loginRes.json('data.access_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  
  // List available units
  const units = http.get(`${BASE_URL}/units?filter[status]=available&limit=10`, { headers });
  check(units, { 'units listed': (r) => r.status === 200 });
  
  sleep(1);
}
```

### Performance Targets
| Metric | Target |
|---|---|
| API response P95 | < 500ms |
| API response P99 | < 1000ms |
| Concurrent users per tenant | 500 |
| Booking transaction time | < 2s |
| Report generation (standard) | < 5s |
| Report generation (large) | < 30s |
| Dashboard load | < 3s |
