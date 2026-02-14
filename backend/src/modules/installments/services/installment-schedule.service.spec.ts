import { BadRequestException } from '@nestjs/common';
import { InstallmentScheduleService, PaymentPlanInput } from './installment-schedule.service';
import { InstallmentType, InstallmentStatus } from '../../../shared/enums';

describe('InstallmentScheduleService', () => {
  let service: InstallmentScheduleService;

  beforeEach(() => {
    service = new InstallmentScheduleService();
  });

  const basePlan: PaymentPlanInput = {
    totalAmount: 1_000_000,
    downPaymentPct: 20,
    installmentCount: 8,
    frequency: 'monthly',
    handoverPct: 10,
    maintenanceDeposit: 5000,
    contractDate: new Date('2026-01-15'),
    expectedDelivery: new Date('2027-06-30'),
    roundingRule: 'nearest_1',
  };

  describe('generate', () => {
    it('should generate a valid schedule with all installment types', () => {
      const schedule = service.generate(basePlan);
      const types = schedule.map((s) => s.type);
      expect(types).toContain(InstallmentType.DOWN_PAYMENT);
      expect(types).toContain(InstallmentType.INSTALLMENT);
      expect(types).toContain(InstallmentType.HANDOVER);
      expect(types).toContain(InstallmentType.MAINTENANCE_DEPOSIT);
    });

    it('should have the correct down payment amount (20% of 1M = 200K)', () => {
      const schedule = service.generate(basePlan);
      const dp = schedule.find((s) => s.type === InstallmentType.DOWN_PAYMENT);
      expect(dp).toBeDefined();
      expect(dp!.amount).toBe(200000);
    });

    it('should have the correct handover amount (10% of 1M = 100K)', () => {
      const schedule = service.generate(basePlan);
      const handover = schedule.find((s) => s.type === InstallmentType.HANDOVER);
      expect(handover).toBeDefined();
      expect(handover!.amount).toBe(100000);
    });

    it('should have correct maintenance deposit', () => {
      const schedule = service.generate(basePlan);
      const md = schedule.find((s) => s.type === InstallmentType.MAINTENANCE_DEPOSIT);
      expect(md).toBeDefined();
      expect(md!.amount).toBe(5000);
    });

    it('total of non-maintenance items should equal totalAmount', () => {
      const schedule = service.generate(basePlan);
      const total = schedule
        .filter((s) => s.type !== InstallmentType.MAINTENANCE_DEPOSIT)
        .reduce((sum, s) => sum + s.amount, 0);
      expect(Math.abs(total - basePlan.totalAmount)).toBeLessThanOrEqual(0.01);
    });

    it('should generate the correct number of regular installments', () => {
      const schedule = service.generate(basePlan);
      const installments = schedule.filter((s) => s.type === InstallmentType.INSTALLMENT);
      expect(installments.length).toBe(basePlan.installmentCount);
    });

    it('all installments should have UPCOMING status', () => {
      const schedule = service.generate(basePlan);
      schedule.forEach((s) => {
        expect(s.status).toBe(InstallmentStatus.UPCOMING);
      });
    });

    it('installment numbers should be sequential starting from 1', () => {
      const schedule = service.generate(basePlan);
      schedule.forEach((s, i) => {
        expect(s.installmentNumber).toBe(i + 1);
      });
    });

    it('should use quarterly frequency (3-month spacing)', () => {
      const plan = { ...basePlan, frequency: 'quarterly' as const };
      const schedule = service.generate(plan);
      const installments = schedule.filter((s) => s.type === InstallmentType.INSTALLMENT);
      // First installment should be 3 months after contract date
      const first = installments[0];
      const expectedMonth = basePlan.contractDate.getMonth() + 3;
      expect(first.dueDate.getMonth()).toBe(expectedMonth % 12);
    });

    it('should handle 0% down payment', () => {
      const plan = { ...basePlan, downPaymentPct: 0 };
      const schedule = service.generate(plan);
      const dp = schedule.find((s) => s.type === InstallmentType.DOWN_PAYMENT);
      expect(dp).toBeUndefined();
      const total = schedule
        .filter((s) => s.type !== InstallmentType.MAINTENANCE_DEPOSIT)
        .reduce((sum, s) => sum + s.amount, 0);
      expect(Math.abs(total - plan.totalAmount)).toBeLessThanOrEqual(0.01);
    });

    it('should handle 0% handover', () => {
      const plan = { ...basePlan, handoverPct: 0 };
      const schedule = service.generate(plan);
      const handover = schedule.find((s) => s.type === InstallmentType.HANDOVER);
      expect(handover).toBeUndefined();
    });

    it('should handle 0 maintenance deposit', () => {
      const plan = { ...basePlan, maintenanceDeposit: 0 };
      const schedule = service.generate(plan);
      const md = schedule.find((s) => s.type === InstallmentType.MAINTENANCE_DEPOSIT);
      expect(md).toBeUndefined();
    });

    it('should apply nearest_100 rounding rule to non-last installments', () => {
      const plan = { ...basePlan, roundingRule: 'nearest_100' as const, totalAmount: 999_999 };
      const schedule = service.generate(plan);
      const installments = schedule.filter((s) => s.type === InstallmentType.INSTALLMENT);
      // All except the last installment should be rounded to nearest 100
      installments.slice(0, -1).forEach((s) => {
        expect(s.amount % 100).toBe(0);
      });
      // Total should still match
      const total = schedule
        .filter((s) => s.type !== InstallmentType.MAINTENANCE_DEPOSIT)
        .reduce((sum, s) => sum + s.amount, 0);
      expect(Math.abs(total - plan.totalAmount)).toBeLessThanOrEqual(0.01);
    });

    it('should throw if down payment + handover > 100%', () => {
      const plan = { ...basePlan, downPaymentPct: 60, handoverPct: 50 };
      expect(() => service.generate(plan)).toThrow(BadRequestException);
    });
  });
});
