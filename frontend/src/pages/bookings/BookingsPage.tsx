import { useState } from 'react';
import { Plus, Ban, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useBookings, useCreateBooking } from '@/hooks/useApi';
import { bookingsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

interface Booking {
  id: string;
  bookingNumber: string;
  customer: string;
  unit: string;
  project: string;
  netPrice: string;
  bookingFee: string;
  validUntil: string;
  status: string;
  createdAt: string;
}

const columns: Column<Booking>[] = [
  { key: 'bookingNumber', header: 'Booking #', render: (r) => <span className="font-mono text-xs font-medium">{r.bookingNumber}</span> },
  { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer}</span> },
  { key: 'unit', header: 'Unit', className: 'font-mono text-xs' },
  { key: 'netPrice', header: 'Net Price' },
  { key: 'bookingFee', header: 'Fee', className: 'text-xs' },
  { key: 'validUntil', header: 'Valid Until', className: 'text-xs text-muted-foreground' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'createdAt', header: 'Created', className: 'text-xs text-muted-foreground' },
  { key: 'actions', header: '', sortable: false, className: 'w-10', render: (r: Booking) => (
    <div className="flex items-center gap-0.5">
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="View details">
        <Eye className="h-3.5 w-3.5 text-muted-foreground/60" />
      </button>
      {r.status === 'active' && (
        <button className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cancel-btn" title="Cancel booking" data-id={r.id}>
          <Ban className="h-3.5 w-3.5 text-red-500/70" />
        </button>
      )}
    </div>
  )},
];

export function BookingsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const { data: bookings = [], isLoading } = useBookings() as { data: Booking[] | undefined; isLoading: boolean };
  const createBooking = useCreateBooking();
  const qc = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createBooking.mutate(
      { projectId: fd.get('projectId'), unitId: fd.get('unitId'), customerId: fd.get('customerId'), netPrice: Number(fd.get('netPrice')), bookingFee: Number(fd.get('bookingFee')), discountPct: Number(fd.get('discountPct') || 0), validUntil: fd.get('validUntil'), bookingFeeType: fd.get('feeType') },
      { onSuccess: () => { setDialogOpen(false); toast.success(t('bookings.add') + ' ✓'); }, onError: () => toast.error('Failed to create booking') },
    );
  };

  const handleCancel = async () => {
    if (cancelTarget) {
      try {
        await bookingsApi.update(cancelTarget.id, { reason: 'Cancelled by user' } as any);
        qc.invalidateQueries({ queryKey: ['bookings'] });
        toast.success(`Booking ${cancelTarget.bookingNumber} cancelled`);
      } catch { toast.error('Failed to cancel booking'); }
      setCancelTarget(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('bookings.title')}
        description={t('bookings.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('bookings.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={bookings} loading={isLoading} searchPlaceholder={t('bookings.search')} searchKeys={['bookingNumber', 'customer', 'unit']} exportable exportFilename="bookings" />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={t('bookings.dialog_title')} onSubmit={handleSubmit} submitLabel={t('bookings.create_label')}>
        <FormRow>
          <FormField label="Project" required>
            <FormSelect name="projectId" required>
              <option value="">Select project</option>
            </FormSelect>
          </FormField>
          <FormField label="Unit" required>
            <FormSelect name="unitId" required>
              <option value="">Select unit</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormField label="Customer" required>
          <FormSelect name="customerId" required>
            <option value="">Select customer</option>
          </FormSelect>
        </FormField>
        <FormRow>
          <FormField label="Net Price (EGP)" required>
            <FormInput name="netPrice" type="number" placeholder="0.00" min="0" step="0.01" required />
          </FormField>
          <FormField label="Booking Fee (EGP)">
            <FormInput name="bookingFee" type="number" placeholder="0.00" min="0" step="0.01" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Discount %">
            <FormInput name="discountPct" type="number" placeholder="0" min="0" max="100" step="0.01" />
          </FormField>
          <FormField label="Valid Until" required>
            <FormInput name="validUntil" type="date" required />
          </FormField>
        </FormRow>
        <FormField label="Fee Type">
          <FormSelect name="feeType">
            <option value="deducted_from_first">Deducted from 1st installment</option>
            <option value="refundable">Refundable</option>
            <option value="non_refundable">Non-refundable</option>
          </FormSelect>
        </FormField>
      </FormDialog>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        description={cancelTarget ? `Are you sure you want to cancel booking ${cancelTarget.bookingNumber}? This will release the unit back to available status.` : ''}
        confirmLabel="Cancel Booking"
        variant="danger"
      />
    </div>
  );
}
