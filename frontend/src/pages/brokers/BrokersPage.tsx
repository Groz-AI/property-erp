import { useState } from 'react';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useBrokers, useCreateBroker } from '@/hooks/useApi';

interface Broker {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  licenseNumber: string;
  commissionMethod: string;
  totalDeals: number;
  totalCommission: string;
  status: string;
}

const columns: Column<Broker>[] = [
  { key: 'name', header: 'Broker Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'company', header: 'Company', className: 'text-xs' },
  { key: 'email', header: 'Email', className: 'text-xs' },
  { key: 'phone', header: 'Phone', className: 'text-xs font-mono' },
  { key: 'licenseNumber', header: 'License #', className: 'font-mono text-xs' },
  { key: 'commissionMethod', header: 'Commission', render: (r) => <span className="capitalize text-xs">{r.commissionMethod?.replace(/_/g, ' ')}</span> },
  { key: 'totalDeals', header: 'Deals' },
  { key: 'totalCommission', header: 'Total Commission' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'actions', header: '', sortable: false, className: 'w-10', render: () => (
    <div className="flex items-center gap-0.5">
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="More"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
    </div>
  )},
];

export function BrokersPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: brokers = [], isLoading } = useBrokers() as { data: Broker[] | undefined; isLoading: boolean };
  const createBroker = useCreateBroker();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createBroker.mutate(
      { name: fd.get('name'), company: fd.get('company'), email: fd.get('email'), phone: fd.get('phone'), licenseNumber: fd.get('licenseNumber'), commissionMethod: fd.get('commissionMethod'), commissionRate: Number(fd.get('commissionRate') || 0) },
      { onSuccess: () => { setDialogOpen(false); toast.success('Broker created successfully'); }, onError: () => toast.error('Failed to create broker') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('brokers.title')}
        description={t('brokers.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('brokers.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={brokers} loading={isLoading} searchPlaceholder={t('brokers.search')} searchKeys={['name', 'company', 'email', 'licenseNumber']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Broker" onSubmit={handleSubmit} submitLabel="Create Broker" loading={createBroker.isPending}>
        <FormField label="Broker Name" required>
          <FormInput name="name" placeholder="Full name" required />
        </FormField>
        <FormRow>
          <FormField label="Company">
            <FormInput name="company" placeholder="Brokerage company" />
          </FormField>
          <FormField label="License #">
            <FormInput name="licenseNumber" placeholder="License number" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Email" required>
            <FormInput name="email" type="email" placeholder="broker@example.com" required />
          </FormField>
          <FormField label="Phone">
            <FormInput name="phone" placeholder="+971..." />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Commission Method" required>
            <FormSelect name="commissionMethod" required>
              <option value="">Select method</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="tiered">Tiered</option>
            </FormSelect>
          </FormField>
          <FormField label="Commission Rate (%)">
            <FormInput name="commissionRate" type="number" placeholder="0" min="0" max="100" step="0.01" />
          </FormField>
        </FormRow>
      </FormDialog>
    </div>
  );
}
