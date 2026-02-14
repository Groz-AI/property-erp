# Real Estate ERP — Workflows, State Machines & Concurrency

## 1. Unit Status State Machine

```
                    ┌──────────────┐
                    │  available   │◄──────────────────────────┐
                    └──────┬───────┘                           │
                           │                                    │
              soft_reserve │              expire/cancel          │
                           ▼                                    │
                    ┌──────────────┐        auto-expire         │
                    │ soft_reserved├─────────────────────────────┤
                    └──────┬───────┘                           │
                           │                                    │
                   booking │                                    │
                           ▼                                    │
                    ┌──────────────┐    cancel booking          │
                    │   reserved   ├────────────────────────────┤
                    └──────┬───────┘                           │
                           │                                    │
              sign contract│                                    │
                           ▼                                    │
                    ┌──────────────┐    cancel contract         │
                    │     sold     ├────────────────────────────┤
                    └──────┬───────┘                           │
                           │                                    │
                  handover │                                    │
                           ▼                                    │
                    ┌──────────────┐                           │
                    │  delivered   │                            │
                    └──────────────┘                           │
                                                                │
        (from any except delivered)                             │
                    ┌──────────────┐    unblock                │
              ┌────►│   blocked    ├────────────────────────────┘
              │     └──────────────┘
              │
              │     ┌──────────────┐    resolve
              ├────►│ legal_hold   ├────────────────────────────┐
              │     └──────────────┘                            │
              │                                                 │
              │     ┌──────────────────┐    complete             │
              └────►│under_maintenance ├────────────────────────┘
                    └──────────────────┘
```

### Valid Transitions Table

| From | To | Trigger | Auth Required | Side Effects |
|---|---|---|---|---|
| available | soft_reserved | Agent clicks reserve | sales:soft_reserve | Set expiry timer |
| available | reserved | Booking created | bookings:create | Create booking record |
| available | blocked | Admin blocks | units:block | Requires reason |
| available | legal_hold | Legal action | units:legal_hold | Requires reason |
| soft_reserved | available | Timer expires | system (cron) | Notify agent |
| soft_reserved | reserved | Booking created | bookings:create | Cancel soft reserve |
| soft_reserved | available | Agent releases | sales:soft_reserve | Manual release |
| reserved | sold | Contract signed | contracts:sign | Create installments, JE |
| reserved | available | Booking cancelled | bookings:cancel | May require approval |
| reserved | available | Booking expired | system (cron) | Auto-cancel |
| sold | delivered | Handover completed | handover:complete | Revenue recognition |
| sold | available | Contract cancelled | contracts:cancel | Requires approval, refund |
| blocked | available | Admin unblocks | units:block | Audit log |
| legal_hold | available | Legal resolves | units:legal_hold | Audit log |
| under_maintenance | available | Maintenance done | units:maintenance | Audit log |

---

## 2. Booking Status State Machine

```
  ┌────────┐    convert    ┌───────────┐
  │ active ├──────────────►│ converted │  (to contract)
  └───┬────┘               └───────────┘
      │
      ├── cancel ──────────►┌───────────┐
      │                     │ cancelled │
      │                     └───────────┘
      │
      └── expire (cron) ──►┌───────────┐
                            │  expired  │
                            └───────────┘
```

| From | To | Trigger | Approval | Side Effects |
|---|---|---|---|---|
| active | converted | Contract created | No | Unit → sold |
| active | cancelled | User/system cancels | If configured | Unit → available, refund calc |
| active | expired | valid_until passed | No (auto) | Unit → available, notify |

---

## 3. Contract Status State Machine

```
  ┌───────┐   submit    ┌──────────────┐   sign    ┌────────┐
  │ draft ├────────────►│ under_review ├──────────►│ signed │
  └───────┘             └──────┬───────┘           └───┬────┘
                               │ reject                 │
                               ▼                        │ activate
                        ┌───────────┐                   ▼
                        │  (back to │           ┌────────────┐
                        │   draft)  │           │   active   │
                        └───────────┘           └──┬──┬──┬───┘
                                                   │  │  │
                                    complete ──────┘  │  └──── cancel
                                                      │
                                               transfer│
                                                      ▼
                        ┌───────────┐          ┌─────────────┐
                        │ completed │          │ transferred │
                        └───────────┘          └─────────────┘

                                               ┌───────────┐
                                               │ cancelled │
                                               └───────────┘
```

| From | To | Trigger | Approval | Side Effects |
|---|---|---|---|---|
| draft | under_review | Submit for review | No | Notify reviewer |
| under_review | draft | Rejected | No | Notify creator |
| under_review | signed | Both parties sign | No | — |
| signed | active | Activation | No | Generate installments, JE |
| active | completed | All paid + delivered | No | Final revenue recognition |
| active | cancelled | Cancellation | **Yes** | Unit→available, refund, JE reversal |
| active | transferred | Transfer approved | **Yes** | New contract, old closed |

---

## 4. Cheque Lifecycle State Machine

```
  ┌──────────┐  deposit   ┌──────────────────┐  confirm  ┌───────────┐
  │ received ├───────────►│ under_collection ├──────────►│ deposited │
  └──────────┘            └────────┬─────────┘           └─────┬─────┘
                                   │                           │
                                   │ bounce                    │ clear
                                   ▼                           ▼
                           ┌─────────┐                 ┌─────────┐
                           │ bounced │                 │ cleared │
                           └────┬────┘                 └─────────┘
                                │
                    ┌───────────┼───────────┐
                    │ replace   │           │ write_off
                    ▼           │           ▼
             ┌──────────┐      │    ┌─────────────┐
             │ replaced │      │    │ written_off │
             └──────────┘      │    └─────────────┘
                               │
                          (new cheque with status 'received')
```

| From | To | Trigger | JE |
|---|---|---|---|
| received | under_collection | Send to bank | None |
| under_collection | deposited | Bank confirms deposit | None |
| deposited | cleared | Bank confirms clearance | Dr Bank, Cr Cheques Under Collection |
| under_collection | bounced | Bank returns | Dr AR, Cr Cheques Under Collection |
| deposited | bounced | Bank returns | Dr AR, Cr Bank (reverse) |
| bounced | replaced | New cheque received | New receipt created |
| bounced | written_off | Decision to write off | Dr Bad Debt, Cr AR |

---

## 5. Installment Status State Machine

```
  ┌──────────┐   due date    ┌─────┐   grace end   ┌─────────┐
  │ upcoming ├──────────────►│ due ├──────────────►│ overdue │
  └──────────┘               └──┬──┘               └────┬────┘
                                │                       │
                    partial pay │           partial pay  │
                                ▼                       ▼
                        ┌────────────────┐      ┌────────────────┐
                        │ partially_paid │      │ partially_paid │
                        └───────┬────────┘      └───────┬────────┘
                                │ full pay               │ full pay
                                ▼                       ▼
                            ┌──────┐               ┌──────┐
                            │ paid │               │ paid │
                            └──────┘               └──────┘

  (any non-paid) ──── waive ────► ┌────────┐
                                  │ waived │
                                  └────────┘

  (any non-paid) ──── reschedule ► ┌──────────────┐
                                   │ rescheduled  │ (new installments created)
                                   └──────────────┘
```

---

## 6. Purchase Order State Machine

```
  ┌───────┐  submit  ┌───────────────────┐  approve  ┌──────────┐
  │ draft ├─────────►│ pending_approval  ├──────────►│ approved │
  └───────┘          └────────┬──────────┘           └────┬─────┘
                              │ reject                     │
                              ▼                            │ partial GRN
                       ┌───────────┐              ┌───────▼───────────┐
                       │ (→ draft) │              │partially_received │
                       └───────────┘              └───────┬───────────┘
                                                          │ all received
                                                          ▼
                    ┌───────────┐                  ┌──────────┐
                    │ cancelled │◄── cancel ───────│ received │
                    └───────────┘                  └────┬─────┘
                                                       │ close
                                                       ▼
                                                  ┌────────┐
                                                  │ closed │
                                                  └────────┘
```

---

## 7. Progress Claim State Machine

```
  ┌───────┐  submit  ┌───────────┐  review  ┌──────────────┐  approve  ┌──────────┐
  │ draft ├─────────►│ submitted ├─────────►│ under_review ├─────────►│ approved │
  └───────┘          └───────────┘          └──────┬───────┘          └────┬─────┘
                                                   │ reject                 │ pay
                                                   ▼                       ▼
                                            ┌──────────┐           ┌──────┐
                                            │ rejected │           │ paid │
                                            └────┬─────┘           └──────┘
                                                 │ revise
                                                 ▼
                                          ┌─────────┐
                                          │ revised │ (→ resubmit)
                                          └─────────┘
```

---

## 8. Maintenance Ticket State Machine

```
  ┌──────┐  assign  ┌──────────┐  start  ┌─────────────┐  resolve  ┌──────────┐
  │ open ├─────────►│ assigned ├────────►│ in_progress ├─────────►│ resolved │
  └──────┘          └──────────┘         └─────────────┘          └────┬─────┘
                                                                       │ close
                                                                       ▼
                                              reopen              ┌────────┐
                                         ┌────────────────────────│ closed │
                                         │                        └────────┘
                                         ▼
                                    ┌──────────┐
                                    │ reopened │ (→ assigned)
                                    └──────────┘
```

---

## 9. Approval Workflow Engine

### 9.1 Architecture

```
Business Action (e.g., discount > 5%)
       │
       ▼
┌──────────────────┐
│ Check if workflow │
│ exists for action │
└────────┬─────────┘
         │
    ┌────▼────┐    No workflow
    │ Match?  ├────────────────► Execute immediately
    └────┬────┘
         │ Yes
         ▼
┌──────────────────┐
│ Create approval  │
│ request          │
│ (status: pending)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notify step 1    │
│ approver(s)      │
└────────┬─────────┘
         │
    ┌────▼────────┐
    │ Approve?    │
    ├─── Yes ─────┼──► Next step? ─── Yes ──► Notify next approver
    │             │                    No ──► Mark APPROVED, execute action
    └─── No ──────┘
         │
    ┌────▼────┐
    │ Reject  │──► Mark REJECTED, notify requester
    └─────────┘
```

### 9.2 Configurable Approval Actions

| Action Type | Default Condition | Default Approvers |
|---|---|---|
| `discount_approval` | discount_pct > 5% | Sales Manager → GM |
| `discount_approval_high` | discount_pct > 10% | Sales Manager → GM → CEO |
| `booking_cancellation` | always | Sales Manager |
| `contract_cancellation` | always | Sales Manager → Finance Manager |
| `refund_approval` | always | Finance Manager → GM |
| `installment_reschedule` | always | Finance Manager |
| `penalty_waiver` | always | Finance Manager |
| `po_approval` | amount > 10,000 | Procurement Manager |
| `po_approval_high` | amount > 100,000 | Procurement Manager → Finance Manager |
| `progress_claim` | always | Site Engineer → Construction Mgr → Finance Mgr |
| `change_order` | always | Construction Manager → PM |
| `broker_commission` | always | Sales Manager → Finance Manager |
| `vendor_bill` | amount > 50,000 | Finance Manager |
| `journal_entry` | optional | Finance Manager |
| `retention_release` | always | Construction Mgr → Finance Mgr |
| `maintenance_spending` | amount > 1,000 | Facility Manager |
| `employee_advance` | always | HR Manager → Finance Manager |

### 9.3 Workflow Definition Schema

```json
{
  "name": "Discount Approval > 10%",
  "action_type": "discount_approval",
  "conditions": [
    { "field": "discount_pct", "operator": "gt", "value": 10 }
  ],
  "steps": [
    { "order": 1, "approver_type": "role", "approver_id": "sales_manager", "is_parallel": false },
    { "order": 2, "approver_type": "role", "approver_id": "general_manager", "is_parallel": false }
  ],
  "escalation": {
    "timeout_hours": 48,
    "escalate_to": "tenant_admin"
  }
}
```

---

## 10. Concurrency Strategy for Unit Booking

### Problem
Two sales agents simultaneously attempt to book the same unit.

### Solution: Advisory Lock + Optimistic Version Check

```typescript
// BookingService.createBooking()
async createBooking(dto: CreateBookingDto): Promise<Booking> {
  return this.dataSource.transaction(async (manager) => {
    // Step 1: Acquire advisory lock on unit
    await manager.query(
      `SELECT pg_advisory_xact_lock(hashtext($1))`,
      [`unit:${dto.unitId}`]
    );

    // Step 2: Load unit with version
    const unit = await manager.findOne(Unit, {
      where: { id: dto.unitId, tenantId: dto.tenantId }
    });

    // Step 3: Validate status
    if (unit.status !== 'available') {
      throw new ConflictException('UNIT_NOT_AVAILABLE');
    }

    // Step 4: Update unit status with optimistic lock
    const result = await manager.update(Unit, 
      { id: unit.id, version: unit.version },
      { status: 'reserved', version: unit.version + 1 }
    );
    if (result.affected === 0) {
      throw new ConflictException('CONCURRENT_MODIFICATION');
    }

    // Step 5: Create booking
    const booking = manager.create(Booking, { ... });
    await manager.save(booking);

    // Step 6: Create status history
    await manager.save(UnitStatusHistory, { ... });

    // Step 7: Emit domain event (journal entry, audit log)
    this.eventEmitter.emit('booking.created', { booking, unit });

    return booking;
  });
}
```

### Soft Reservation Concurrency

```typescript
// Soft reserve with atomic check-and-set
async softReserve(unitId: string, userId: string): Promise<void> {
  const expiresAt = addMinutes(new Date(), 30); // configurable
  
  const result = await this.unitRepo
    .createQueryBuilder()
    .update(Unit)
    .set({ 
      status: 'soft_reserved', 
      softReservedUntil: expiresAt,
      softReservedBy: userId 
    })
    .where('id = :id AND status = :status', { 
      id: unitId, 
      status: 'available' 
    })
    .execute();

  if (result.affected === 0) {
    throw new ConflictException('UNIT_NOT_AVAILABLE');
  }
}
```

### Expiration Sweep (Cron Job)

```typescript
@Cron('* * * * *') // Every minute
async expireSoftReservations() {
  const expired = await this.unitRepo
    .createQueryBuilder()
    .update(Unit)
    .set({ status: 'available', softReservedUntil: null, softReservedBy: null })
    .where('status = :status AND soft_reserved_until < NOW()', {
      status: 'soft_reserved'
    })
    .returning('id, soft_reserved_by')
    .execute();

  for (const unit of expired.raw) {
    this.eventEmitter.emit('soft_reservation.expired', unit);
  }
}

@Cron('0 * * * *') // Every hour
async expireBookings() {
  const expired = await this.bookingRepo.find({
    where: { status: 'active', validUntil: LessThan(new Date()) }
  });
  
  for (const booking of expired) {
    await this.cancelBooking(booking.id, 'expired');
  }
}
```

---

## 11. Idempotency Strategy

### Request Deduplication

```typescript
// IdempotencyInterceptor
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private redis: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-idempotency-key'];
    
    if (!key) return next.handle();

    const cacheKey = `idempotency:${request.user.tenantId}:${key}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return of(JSON.parse(cached)); // Return cached response
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.redis.setex(cacheKey, 86400, JSON.stringify(response)); // 24h TTL
      })
    );
  }
}
```

---

## 12. Background Job Definitions

| Job | Schedule | Description |
|---|---|---|
| `expire-soft-reservations` | Every 1 min | Release expired soft reserves |
| `expire-bookings` | Every 1 hour | Cancel expired bookings |
| `update-installment-status` | Daily 00:00 | Mark due/overdue installments |
| `apply-late-penalties` | Daily 01:00 | Calculate and apply penalties |
| `aging-report-generation` | Daily 02:00 | Pre-compute aging buckets |
| `dunning-notifications` | Daily 08:00 | Send dunning messages |
| `revenue-recognition-run` | Monthly 1st | Run rev rec for previous month |
| `depreciation-run` | Monthly 1st | Calculate asset depreciation |
| `audit-log-partition` | Monthly 25th | Create next month's partition |
| `exchange-rate-fetch` | Daily 06:00 | Fetch exchange rates (optional API) |
| `backup-verification` | Daily 03:00 | Verify backup integrity |
| `report-scheduler` | Configurable | Deliver scheduled reports |
