import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('booking.created')
  async onBookingCreated(payload: any) {
    const booking = payload.booking;
    this.logger.log(`[Notification] Booking ${booking?.bookingNumber} created`);
    if (booking?.tenantId) {
      await this.notificationsService.create({
        tenantId: booking.tenantId,
        userId: null,
        type: 'booking_created',
        title: `Booking ${booking.bookingNumber} created`,
        message: `A new booking has been created for unit ${booking.unitId || 'N/A'}`,
        referenceType: 'booking',
        referenceId: booking.id,
      });
    }
  }

  @OnEvent('contract.signed')
  async onContractSigned(payload: any) {
    const contract = payload.contract;
    this.logger.log(`[Notification] Contract ${contract?.contractNumber} signed`);
    if (contract?.tenantId) {
      await this.notificationsService.create({
        tenantId: contract.tenantId,
        userId: null,
        type: 'contract_signed',
        title: `Contract ${contract.contractNumber} signed`,
        message: `Contract has been signed and is now active`,
        referenceType: 'contract',
        referenceId: contract.id,
      });
    }
  }

  @OnEvent('receipt.confirmed')
  async onReceiptConfirmed(payload: any) {
    const receipt = payload.receipt;
    this.logger.log(`[Notification] Receipt ${receipt?.receiptNumber} confirmed`);
    if (receipt?.tenantId) {
      await this.notificationsService.create({
        tenantId: receipt.tenantId,
        userId: null,
        type: 'payment_received',
        title: `Receipt ${receipt.receiptNumber} confirmed`,
        message: `Payment of ${receipt.amount || 0} has been confirmed`,
        referenceType: 'receipt',
        referenceId: receipt.id,
      });
    }
  }

  @OnEvent('contract.cancelled')
  async onContractCancelled(payload: any) {
    const contract = payload.contract;
    this.logger.log(`[Notification] Contract ${contract?.contractNumber} cancelled`);
    if (contract?.tenantId) {
      await this.notificationsService.create({
        tenantId: contract.tenantId,
        userId: null,
        type: 'contract_cancelled',
        title: `Contract ${contract.contractNumber} cancelled`,
        message: `Contract has been cancelled`,
        referenceType: 'contract',
        referenceId: contract.id,
      });
    }
  }

  @OnEvent('lead.assigned')
  async onLeadAssigned(payload: any) {
    const lead = payload.lead;
    if (lead?.tenantId) {
      await this.notificationsService.create({
        tenantId: lead.tenantId,
        userId: lead.assignedTo || null,
        type: 'lead_assigned',
        title: `New lead assigned: ${lead.name || 'Unknown'}`,
        message: `A new lead has been assigned to you`,
        referenceType: 'lead',
        referenceId: lead.id,
      });
    }
  }

  @OnEvent('maintenance.created')
  async onMaintenanceCreated(payload: any) {
    const ticket = payload.ticket;
    if (ticket?.tenantId) {
      await this.notificationsService.create({
        tenantId: ticket.tenantId,
        userId: ticket.assignedTo || null,
        type: 'maintenance_ticket',
        title: `Maintenance ticket ${ticket.ticketNumber || ''} created`,
        message: `${ticket.subject || 'New maintenance request'}`,
        referenceType: 'ticket',
        referenceId: ticket.id,
      });
    }
  }

  @OnEvent('installment.overdue')
  async onInstallmentOverdue(payload: any) {
    const installment = payload.installment;
    if (installment?.tenantId) {
      await this.notificationsService.create({
        tenantId: installment.tenantId,
        userId: null,
        type: 'installment_overdue',
        title: `Installment overdue`,
        message: `Installment of ${installment.amount || 0} is past due date`,
        referenceType: 'installment',
        referenceId: installment.id,
      });
    }
  }
}
