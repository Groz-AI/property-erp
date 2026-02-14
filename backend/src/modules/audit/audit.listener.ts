import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditListener {
  private readonly logger = new Logger(AuditListener.name);

  constructor(private readonly dataSource: DataSource) {}

  @OnEvent('audit.log')
  async handleAuditLog(payload: {
    tenantId?: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
    path?: string;
  }) {
    try {
      await this.dataSource.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address, user_agent, duration_ms, path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          payload.tenantId || null,
          payload.userId || null,
          payload.action,
          payload.entityType,
          payload.entityId || null,
          payload.ipAddress || null,
          payload.userAgent || null,
          payload.duration || null,
          payload.path || null,
        ],
      );
    } catch (err) {
      this.logger.error('Failed to write audit log', err);
    }
  }

  @OnEvent('booking.created')
  async onBookingCreated(payload: any) {
    this.logger.log(`Booking created: ${payload.booking?.bookingNumber} by user ${payload.userId}`);
  }

  @OnEvent('booking.cancelled')
  async onBookingCancelled(payload: any) {
    this.logger.log(`Booking cancelled: ${payload.booking?.bookingNumber} by user ${payload.userId}`);
  }

  @OnEvent('contract.created')
  async onContractCreated(payload: any) {
    this.logger.log(`Contract created: ${payload.contract?.contractNumber} by user ${payload.userId}`);
  }

  @OnEvent('contract.signed')
  async onContractSigned(payload: any) {
    this.logger.log(`Contract signed: ${payload.contract?.contractNumber}`);
  }

  @OnEvent('contract.activated')
  async onContractActivated(payload: any) {
    this.logger.log(`Contract activated: ${payload.contract?.contractNumber}`);
  }

  @OnEvent('contract.cancelled')
  async onContractCancelled(payload: any) {
    this.logger.log(`Contract cancelled: ${payload.contract?.contractNumber}`);
  }

  @OnEvent('receipt.created')
  async onReceiptCreated(payload: any) {
    this.logger.log(`Receipt created: ${payload.receipt?.receiptNumber}`);
  }

  @OnEvent('receipt.confirmed')
  async onReceiptConfirmed(payload: any) {
    this.logger.log(`Receipt confirmed: ${payload.receipt?.receiptNumber}`);
  }
}
