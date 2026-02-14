import { Injectable, BadRequestException } from '@nestjs/common';
import { UnitStatus } from '../../../shared/enums';

interface Transition {
  from: UnitStatus[];
  to: UnitStatus;
  trigger: string;
}

const VALID_TRANSITIONS: Transition[] = [
  { from: [UnitStatus.AVAILABLE], to: UnitStatus.SOFT_RESERVED, trigger: 'soft_reserve' },
  { from: [UnitStatus.AVAILABLE, UnitStatus.SOFT_RESERVED], to: UnitStatus.RESERVED, trigger: 'booking_created' },
  { from: [UnitStatus.RESERVED], to: UnitStatus.SOLD, trigger: 'contract_signed' },
  { from: [UnitStatus.SOLD], to: UnitStatus.DELIVERED, trigger: 'handover_completed' },
  { from: [UnitStatus.SOFT_RESERVED], to: UnitStatus.AVAILABLE, trigger: 'soft_reserve_expired' },
  { from: [UnitStatus.SOFT_RESERVED], to: UnitStatus.AVAILABLE, trigger: 'soft_reserve_released' },
  { from: [UnitStatus.RESERVED], to: UnitStatus.AVAILABLE, trigger: 'booking_cancelled' },
  { from: [UnitStatus.RESERVED], to: UnitStatus.AVAILABLE, trigger: 'booking_expired' },
  { from: [UnitStatus.SOLD], to: UnitStatus.AVAILABLE, trigger: 'contract_cancelled' },
  { from: [UnitStatus.AVAILABLE, UnitStatus.RESERVED, UnitStatus.SOFT_RESERVED], to: UnitStatus.BLOCKED, trigger: 'admin_block' },
  { from: [UnitStatus.BLOCKED], to: UnitStatus.AVAILABLE, trigger: 'admin_unblock' },
  { from: [UnitStatus.AVAILABLE, UnitStatus.RESERVED, UnitStatus.SOFT_RESERVED], to: UnitStatus.LEGAL_HOLD, trigger: 'legal_action' },
  { from: [UnitStatus.LEGAL_HOLD], to: UnitStatus.AVAILABLE, trigger: 'legal_resolved' },
  { from: [UnitStatus.AVAILABLE], to: UnitStatus.UNDER_MAINTENANCE, trigger: 'maintenance_started' },
  { from: [UnitStatus.UNDER_MAINTENANCE], to: UnitStatus.AVAILABLE, trigger: 'maintenance_completed' },
];

@Injectable()
export class UnitStateMachineService {
  canTransition(currentStatus: UnitStatus, targetStatus: UnitStatus): boolean {
    return VALID_TRANSITIONS.some(
      (t) => t.from.includes(currentStatus) && t.to === targetStatus,
    );
  }

  validateTransition(currentStatus: UnitStatus, targetStatus: UnitStatus, trigger: string): void {
    const valid = VALID_TRANSITIONS.find(
      (t) => t.from.includes(currentStatus) && t.to === targetStatus && t.trigger === trigger,
    );

    if (!valid) {
      throw new BadRequestException(
        `Invalid unit status transition: ${currentStatus} → ${targetStatus} (trigger: ${trigger})`,
      );
    }
  }

  getAvailableTransitions(currentStatus: UnitStatus): { to: UnitStatus; trigger: string }[] {
    return VALID_TRANSITIONS
      .filter((t) => t.from.includes(currentStatus))
      .map((t) => ({ to: t.to, trigger: t.trigger }));
  }
}
