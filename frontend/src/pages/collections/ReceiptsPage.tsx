import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow, FormTextarea } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useReceipts, useCreateReceipt } from '@/hooks/useApi';

interface Receipt {
  id: string;
  receiptNumber: string;
  customer: string;
  contract: string;
  amount: string;
  paymentMethod: string;
  referenceNumber: string;
  status: string;
  receiptDate: string;
}

const columns: Column<Receipt>[] = [
  { key: 'receiptNumber', header: 'Receipt #', render: (r) => <span className="font-mono text-xs font-medium">{r.receiptNumber}</span> },
  { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer}</span> },
  { key: 'contract', header: 'Contract', className: 'font-mono text-xs' },
  { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">{r.amount}</span> },
  { key: 'paymentMethod', header: 'Method', render: (r) => <span className="capitalize text-xs">{r.paymentMethod.replace(/_/g, ' ')}</span> },
  { key: 'referenceNumber', header: 'Reference', className: 'font-mono text-xs text-muted-foreground' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'receiptDate', header: 'Date', className: 'text-xs text-muted-foreground' },
];

export function ReceiptsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: receipts = [], isLoading } = useReceipts() as { data: Receipt[] | undefined; isLoading: boolean };
  const createReceipt = useCreateReceipt();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createReceipt.mutate(
      { receipt: { contractId: fd.get('contractId'), amount: Number(fd.get('amount')), receiptDate: fd.get('receiptDate'), paymentMethod: fd.get('paymentMethod'), referenceNumber: fd.get('referenceNumber'), bankAccountId: fd.get('bankAccountId'), notes: fd.get('notes') }, allocations: [] },
      { onSuccess: () => { setDialogOpen(false); toast.success(t('receipts.add') + ' ✓'); }, onError: () => toast.error('Failed to create receipt') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('receipts.title')}
        description={t('receipts.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Plus className="h-4 w-4" /> {t('receipts.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={receipts} loading={isLoading} searchPlaceholder={t('receipts.search')} searchKeys={['receiptNumber', 'customer', 'contract', 'referenceNumber']} exportable exportFilename="receipts" />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Record Receipt" onSubmit={handleSubmit} submitLabel="Save Receipt">
        <FormField label="Contract" required>
          <FormSelect name="contractId" required>
            <option value="">Select contract</option>
          </FormSelect>
        </FormField>
        <FormRow>
          <FormField label="Amount (AED)" required>
            <FormInput name="amount" type="number" placeholder="0.00" min="0" step="0.01" required />
          </FormField>
          <FormField label="Receipt Date" required>
            <FormInput name="receiptDate" type="date" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Payment Method" required>
            <FormSelect name="paymentMethod" required>
              <option value="">Select method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
            </FormSelect>
          </FormField>
          <FormField label="Reference Number" required>
            <FormInput name="referenceNumber" placeholder="Transfer/cheque reference" required />
          </FormField>
        </FormRow>
        <FormField label="Bank Account">
          <FormSelect name="bankAccountId">
            <option value="">Select bank account</option>
            <option value="ba-1">ENBD Current — 1234-5678-9012</option>
            <option value="ba-2">ADCB Escrow — 9876-5432-1098</option>
          </FormSelect>
        </FormField>
        <FormField label="Notes">
          <FormTextarea name="notes" placeholder="Payment notes..." rows={2} />
        </FormField>
      </FormDialog>
    </div>
  );
}
