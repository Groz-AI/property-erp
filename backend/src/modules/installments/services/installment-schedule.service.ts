import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { addMonths, addDays } from 'date-fns';
import { InstallmentEntity } from '../entities/installment.entity';
import { InstallmentType, InstallmentStatus } from '../../../shared/enums';

export interface PaymentPlanInput {
  totalAmount: number;
  downPaymentPct: number;
  installmentCount: number;
  frequency: 'monthly' | 'quarterly';
  handoverPct: number;
  maintenanceDeposit: number;
  contractDate: Date;
  expectedDelivery: Date;
  roundingRule: 'nearest_1' | 'nearest_10' | 'nearest_100';
}

@Injectable()
export class InstallmentScheduleService {
  /**
   * Generate a full installment schedule for a contract.
   * Ensures the sum of all installments exactly equals the total amount.
   */
  generate(plan: PaymentPlanInput): Omit<InstallmentEntity, 'id' | 'tenantId' | 'contractId' | 'createdAt' | 'updatedAt' | 'contract' | 'deletedAt' | 'createdBy' | 'updatedBy'>[] {
    const { totalAmount, downPaymentPct, installmentCount, frequency, handoverPct, maintenanceDeposit, contractDate, expectedDelivery, roundingRule } = plan;

    if (downPaymentPct + handoverPct > 100) {
      throw new BadRequestException('Down payment + handover percentage cannot exceed 100%');
    }

    const schedule: any[] = [];
    let remaining = totalAmount;
    let installmentNumber = 1;

    // 1. Down Payment
    const dpAmount = this.round(totalAmount * downPaymentPct / 100, roundingRule);
    if (dpAmount > 0) {
      schedule.push({
        installmentNumber: installmentNumber++,
        type: InstallmentType.DOWN_PAYMENT,
        dueDate: contractDate,
        amount: dpAmount,
        paidAmount: 0,
        penaltyAmount: 0,
        status: InstallmentStatus.UPCOMING,
        graceDays: 0,
        notes: null,
        version: 1,
      });
      remaining -= dpAmount;
    }

    // 2. Handover amount (reserved, generated now but due at delivery)
    const handoverAmount = this.round(totalAmount * handoverPct / 100, roundingRule);
    remaining -= handoverAmount;

    // 3. Regular installments
    const installmentPortion = remaining;
    const baseInstallment = this.round(installmentPortion / installmentCount, roundingRule);
    let installmentTotal = 0;

    const monthsIncrement = frequency === 'quarterly' ? 3 : 1;

    for (let i = 0; i < installmentCount; i++) {
      const isLast = i === installmentCount - 1;
      const amount = isLast ? (installmentPortion - installmentTotal) : baseInstallment;
      installmentTotal += amount;

      const dueDate = addMonths(contractDate, (i + 1) * monthsIncrement);

      schedule.push({
        installmentNumber: installmentNumber++,
        type: InstallmentType.INSTALLMENT,
        dueDate,
        amount,
        paidAmount: 0,
        penaltyAmount: 0,
        status: InstallmentStatus.UPCOMING,
        graceDays: 7,
        notes: null,
        version: 1,
      });
    }

    // 4. Handover payment
    if (handoverAmount > 0) {
      schedule.push({
        installmentNumber: installmentNumber++,
        type: InstallmentType.HANDOVER,
        dueDate: expectedDelivery,
        amount: handoverAmount,
        paidAmount: 0,
        penaltyAmount: 0,
        status: InstallmentStatus.UPCOMING,
        graceDays: 0,
        notes: null,
        version: 1,
      });
    }

    // 5. Maintenance deposit (separate ledger)
    if (maintenanceDeposit > 0) {
      schedule.push({
        installmentNumber: installmentNumber++,
        type: InstallmentType.MAINTENANCE_DEPOSIT,
        dueDate: expectedDelivery,
        amount: maintenanceDeposit,
        paidAmount: 0,
        penaltyAmount: 0,
        status: InstallmentStatus.UPCOMING,
        graceDays: 0,
        notes: null,
        version: 1,
      });
    }

    // Validate total (excluding maintenance deposit)
    const scheduleTotal = schedule
      .filter((s) => s.type !== InstallmentType.MAINTENANCE_DEPOSIT)
      .reduce((sum: number, s: any) => sum + s.amount, 0);

    if (Math.abs(scheduleTotal - totalAmount) > 0.01) {
      throw new BadRequestException(
        `Schedule total (${scheduleTotal}) does not match contract amount (${totalAmount})`,
      );
    }

    return schedule;
  }

  /**
   * Persist a generated schedule to the database.
   */
  async saveSchedule(
    manager: EntityManager,
    tenantId: string,
    contractId: string,
    schedule: any[],
  ): Promise<InstallmentEntity[]> {
    const entities: InstallmentEntity[] = [];

    for (const item of schedule) {
      const entity = manager.create(InstallmentEntity, {
        tenantId,
        contractId,
        ...item,
      });
      entities.push(await manager.save(InstallmentEntity, entity));
    }

    return entities;
  }

  private round(value: number, rule: string): number {
    switch (rule) {
      case 'nearest_10':
        return Math.round(value / 10) * 10;
      case 'nearest_100':
        return Math.round(value / 100) * 100;
      default:
        return Math.round(value * 100) / 100;
    }
  }
}
