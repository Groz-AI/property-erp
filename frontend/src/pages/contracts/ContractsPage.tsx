import { useState } from 'react';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useContracts } from '@/hooks/useApi';

interface Contract {
  id: string;
  contractNumber: string;
  customer: string;
  unit: string;
  project: string;
  totalAmount: string;
  paidAmount: string;
  status: string;
  contractDate: string;
  expectedDelivery: string;
}

const columns: Column<Contract>[] = [
  { key: 'contractNumber', header: 'Contract #', render: (r) => <span className="font-mono text-xs font-medium">{r.contractNumber}</span> },
  { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer}</span> },
  { key: 'unit', header: 'Unit', className: 'font-mono text-xs' },
  { key: 'totalAmount', header: 'Total Amount' },
  { key: 'paidAmount', header: 'Paid' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'contractDate', header: 'Date', className: 'text-xs text-muted-foreground' },
  { key: 'expectedDelivery', header: 'Delivery', className: 'text-xs text-muted-foreground' },
  { key: 'actions', header: '', sortable: false, className: 'w-10', render: () => (
    <div className="flex items-center gap-0.5">
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="More"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
    </div>
  )},
];

export function ContractsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: contracts = [], isLoading } = useContracts() as { data: Contract[] | undefined; isLoading: boolean };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogOpen(false);
    toast.success('Contract created successfully', { description: 'Installment schedule has been generated.' });
  };

  return (
    <div>
      <PageHeader
        title={t('contracts.title')}
        description={t('contracts.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('contracts.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={contracts} loading={isLoading} searchPlaceholder={t('contracts.search')} searchKeys={['contractNumber', 'customer', 'unit']} exportable exportFilename="contracts" />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Contract" onSubmit={handleSubmit} submitLabel="Create Contract">
        <FormField label="Booking" required>
          <FormSelect required>
            <option value="">Select active booking</option>
            <option value="bk-1">BK-2026-0012 — Khalid Al-Mansour — SG-PH1-A-G02</option>
            <option value="bk-3">BK-2026-0010 — Rajesh Gupta — SG-PH1-A-301</option>
          </FormSelect>
        </FormField>
        <FormRow>
          <FormField label="Total Amount (EGP)" required>
            <FormInput type="number" placeholder="0.00" min="0" step="0.01" required />
          </FormField>
          <FormField label="Contract Date" required>
            <FormInput type="date" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Down Payment %" required>
            <FormInput type="number" placeholder="20" min="0" max="100" step="0.01" required />
          </FormField>
          <FormField label="Handover %" required>
            <FormInput type="number" placeholder="10" min="0" max="100" step="0.01" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Installment Count" required>
            <FormInput type="number" placeholder="12" min="1" max="120" required />
          </FormField>
          <FormField label="Frequency" required>
            <FormSelect required>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Expected Delivery" required>
            <FormInput type="date" required />
          </FormField>
          <FormField label="Maintenance Deposit (EGP)">
            <FormInput type="number" placeholder="0.00" min="0" step="0.01" />
          </FormField>
        </FormRow>
        <FormField label="Rounding Rule">
          <FormSelect>
            <option value="nearest_1">Nearest 1 (default)</option>
            <option value="nearest_10">Nearest 10</option>
            <option value="nearest_100">Nearest 100</option>
          </FormSelect>
        </FormField>
      </FormDialog>
    </div>
  );
}
