import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormRow, FormTextarea } from '@/components/ui/form-dialog';
import { useHandovers, useCreateHandover } from '@/hooks/useApi';

interface Handover {
  id: string;
  handoverNumber: string;
  unit: string;
  customer: string;
  scheduledDate: string;
  completedDate: string;
  inspectionStatus: string;
  status: string;
}

const statusPipeline = ['all', 'pending', 'in_progress', 'completed', 'cancelled'];

const columns: Column<Handover>[] = [
  { key: 'handoverNumber', header: 'Handover #', render: (r) => <span className="font-mono text-xs font-medium">{r.handoverNumber}</span> },
  { key: 'unit', header: 'Unit', className: 'font-mono text-xs' },
  { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer}</span> },
  { key: 'scheduledDate', header: 'Scheduled', className: 'text-xs' },
  { key: 'completedDate', header: 'Completed', className: 'text-xs text-muted-foreground' },
  { key: 'inspectionStatus', header: 'Inspection', render: (r) => <span className="capitalize text-xs">{r.inspectionStatus?.replace(/_/g, ' ')}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function HandoverPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: handovers = [], isLoading } = useHandovers(statusFilter !== 'all' ? { status: statusFilter } : undefined) as { data: Handover[] | undefined; isLoading: boolean };
  const createHandover = useCreateHandover();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createHandover.mutate(
      { unitId: fd.get('unitId'), customerId: fd.get('customerId'), scheduledDate: fd.get('scheduledDate'), notes: fd.get('notes') },
      { onSuccess: () => { setDialogOpen(false); toast.success('Handover scheduled'); }, onError: () => toast.error('Failed to create handover') },
    );
  };

  return (
    <div>
      <PageHeader
        title="Handover"
        description="Manage unit handover and inspection process"
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Schedule Handover
          </button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {statusPipeline.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium border transition-all duration-200 ${statusFilter === s ? 'bg-foreground text-background border-transparent shadow-sm' : 'bg-transparent border-border/50 text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground hover:border-border/80'}`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={handovers} loading={isLoading} searchPlaceholder="Search handovers..." searchKeys={['handoverNumber', 'unit', 'customer']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Schedule Handover" onSubmit={handleSubmit} submitLabel="Create Handover" loading={createHandover.isPending}>
        <FormRow>
          <FormField label="Unit ID" required>
            <FormInput name="unitId" placeholder="Unit UUID" required />
          </FormField>
          <FormField label="Customer ID" required>
            <FormInput name="customerId" placeholder="Customer UUID" required />
          </FormField>
        </FormRow>
        <FormField label="Scheduled Date" required>
          <FormInput name="scheduledDate" type="date" required />
        </FormField>
        <FormField label="Notes">
          <FormTextarea name="notes" placeholder="Handover notes..." rows={3} />
        </FormField>
      </FormDialog>
    </div>
  );
}
