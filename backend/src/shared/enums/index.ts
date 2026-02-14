export enum UnitStatus {
  AVAILABLE = 'available',
  SOFT_RESERVED = 'soft_reserved',
  RESERVED = 'reserved',
  SOLD = 'sold',
  BLOCKED = 'blocked',
  UNDER_MAINTENANCE = 'under_maintenance',
  LEGAL_HOLD = 'legal_hold',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum BookingStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
  CANCELLED = 'cancelled',
}

export enum ContractStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  SIGNED = 'signed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  TRANSFERRED = 'transferred',
}

export enum InstallmentStatus {
  UPCOMING = 'upcoming',
  DUE = 'due',
  OVERDUE = 'overdue',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  WAIVED = 'waived',
  RESCHEDULED = 'rescheduled',
}

export enum InstallmentType {
  DOWN_PAYMENT = 'down_payment',
  INSTALLMENT = 'installment',
  BALLOON = 'balloon',
  HANDOVER = 'handover',
  MAINTENANCE_DEPOSIT = 'maintenance_deposit',
}

export enum ReceiptStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  REVERSED = 'reversed',
}

export enum ChequeStatus {
  RECEIVED = 'received',
  UNDER_COLLECTION = 'under_collection',
  DEPOSITED = 'deposited',
  CLEARED = 'cleared',
  BOUNCED = 'bounced',
  REPLACED = 'replaced',
  WRITTEN_OFF = 'written_off',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  CREDIT_CARD = 'credit_card',
  ONLINE_GATEWAY = 'online_gateway',
}

export enum JournalStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  REVERSED = 'reversed',
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  OPPORTUNITY = 'opportunity',
  WON = 'won',
  LOST = 'lost',
  DISQUALIFIED = 'disqualified',
}

export enum OpportunityStage {
  DISCOVERY = 'discovery',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  BOOKING = 'booking',
  WON = 'won',
  LOST = 'lost',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled',
}

export enum POStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  REJECTED = 'rejected',
}

export enum TicketStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum CommissionMethod {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percentage',
  TIERED = 'tiered',
  MILESTONE = 'milestone',
}

export enum CommissionStatus {
  CALCULATED = 'calculated',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum RefundStatus {
  REQUESTED = 'requested',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
}

export enum HandoverStatus {
  PENDING = 'pending',
  INITIAL_INSPECTION = 'initial_inspection',
  SNAG_RECTIFICATION = 'snag_rectification',
  FINAL_INSPECTION = 'final_inspection',
  COMPLETED = 'completed',
}

export enum StockMovementType {
  RECEIVE = 'receive',
  ISSUE = 'issue',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  ADJUSTMENT_IN = 'adjustment_in',
  ADJUSTMENT_OUT = 'adjustment_out',
}

export enum RevenueRecognitionMethod {
  DELIVERY_BASED = 'delivery_based',
  PERCENTAGE_OF_COMPLETION = 'percentage_of_completion',
  MILESTONE_BASED = 'milestone_based',
}

export enum BookingFeeType {
  REFUNDABLE = 'refundable',
  NON_REFUNDABLE = 'non_refundable',
  DEDUCTED_FROM_FIRST = 'deducted_from_first',
}
