import { BadRequestException } from '@nestjs/common';
import { UnitStateMachineService } from './unit-state-machine.service';
import { UnitStatus } from '../../../shared/enums';

describe('UnitStateMachineService', () => {
  let service: UnitStateMachineService;

  beforeEach(() => {
    service = new UnitStateMachineService();
  });

  describe('canTransition', () => {
    it('should allow AVAILABLE → SOFT_RESERVED', () => {
      expect(service.canTransition(UnitStatus.AVAILABLE, UnitStatus.SOFT_RESERVED)).toBe(true);
    });

    it('should allow AVAILABLE → RESERVED', () => {
      expect(service.canTransition(UnitStatus.AVAILABLE, UnitStatus.RESERVED)).toBe(true);
    });

    it('should allow SOFT_RESERVED → RESERVED', () => {
      expect(service.canTransition(UnitStatus.SOFT_RESERVED, UnitStatus.RESERVED)).toBe(true);
    });

    it('should allow RESERVED → SOLD', () => {
      expect(service.canTransition(UnitStatus.RESERVED, UnitStatus.SOLD)).toBe(true);
    });

    it('should allow SOLD → DELIVERED', () => {
      expect(service.canTransition(UnitStatus.SOLD, UnitStatus.DELIVERED)).toBe(true);
    });

    it('should allow RESERVED → AVAILABLE (booking cancelled)', () => {
      expect(service.canTransition(UnitStatus.RESERVED, UnitStatus.AVAILABLE)).toBe(true);
    });

    it('should allow SOLD → AVAILABLE (contract cancelled)', () => {
      expect(service.canTransition(UnitStatus.SOLD, UnitStatus.AVAILABLE)).toBe(true);
    });

    it('should NOT allow AVAILABLE → SOLD (skip reserved)', () => {
      expect(service.canTransition(UnitStatus.AVAILABLE, UnitStatus.SOLD)).toBe(false);
    });

    it('should NOT allow DELIVERED → AVAILABLE', () => {
      expect(service.canTransition(UnitStatus.DELIVERED, UnitStatus.AVAILABLE)).toBe(false);
    });

    it('should NOT allow SOLD → RESERVED (backward)', () => {
      expect(service.canTransition(UnitStatus.SOLD, UnitStatus.RESERVED)).toBe(false);
    });

    it('should allow AVAILABLE → BLOCKED', () => {
      expect(service.canTransition(UnitStatus.AVAILABLE, UnitStatus.BLOCKED)).toBe(true);
    });

    it('should allow BLOCKED → AVAILABLE', () => {
      expect(service.canTransition(UnitStatus.BLOCKED, UnitStatus.AVAILABLE)).toBe(true);
    });

    it('should allow AVAILABLE → LEGAL_HOLD', () => {
      expect(service.canTransition(UnitStatus.AVAILABLE, UnitStatus.LEGAL_HOLD)).toBe(true);
    });

    it('should allow AVAILABLE → UNDER_MAINTENANCE', () => {
      expect(service.canTransition(UnitStatus.AVAILABLE, UnitStatus.UNDER_MAINTENANCE)).toBe(true);
    });

    it('should allow UNDER_MAINTENANCE → AVAILABLE', () => {
      expect(service.canTransition(UnitStatus.UNDER_MAINTENANCE, UnitStatus.AVAILABLE)).toBe(true);
    });
  });

  describe('validateTransition', () => {
    it('should not throw for valid transition', () => {
      expect(() => service.validateTransition(UnitStatus.AVAILABLE, UnitStatus.RESERVED, 'booking_created')).not.toThrow();
    });

    it('should throw BadRequestException for invalid transition', () => {
      expect(() => service.validateTransition(UnitStatus.AVAILABLE, UnitStatus.SOLD, 'contract_signed'))
        .toThrow(BadRequestException);
    });

    it('should throw for correct states but wrong trigger', () => {
      expect(() => service.validateTransition(UnitStatus.RESERVED, UnitStatus.AVAILABLE, 'wrong_trigger'))
        .toThrow(BadRequestException);
    });
  });

  describe('getAvailableTransitions', () => {
    it('should return transitions from AVAILABLE', () => {
      const transitions = service.getAvailableTransitions(UnitStatus.AVAILABLE);
      expect(transitions.length).toBeGreaterThan(0);
      const triggers = transitions.map((t) => t.trigger);
      expect(triggers).toContain('soft_reserve');
      expect(triggers).toContain('booking_created');
      expect(triggers).toContain('admin_block');
    });

    it('should return transitions from RESERVED', () => {
      const transitions = service.getAvailableTransitions(UnitStatus.RESERVED);
      const targets = transitions.map((t) => t.to);
      expect(targets).toContain(UnitStatus.SOLD);
      expect(targets).toContain(UnitStatus.AVAILABLE);
    });

    it('should return empty for DELIVERED (terminal state)', () => {
      const transitions = service.getAvailableTransitions(UnitStatus.DELIVERED);
      expect(transitions.length).toBe(0);
    });

    it('should return empty for CANCELLED (terminal state)', () => {
      const transitions = service.getAvailableTransitions(UnitStatus.CANCELLED);
      expect(transitions.length).toBe(0);
    });
  });
});
