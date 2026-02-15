import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow, FormTextarea } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useMaintenanceTickets, useCreateTicket } from '@/hooks/useApi';

interface Ticket {
  id: string;
  ticketNumber: string;
  unit: string;
  customer: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  low: 'text-slate-600 bg-slate-100',
  medium: 'text-amber-700 bg-amber-100',
  high: 'text-orange-700 bg-orange-100',
  critical: 'text-red-700 bg-red-100',
};

const statusPipeline = ['all', 'open', 'assigned', 'in_progress', 'resolved', 'closed'];

const columns: Column<Ticket>[] = [
  { key: 'ticketNumber', header: 'Ticket #', render: (r) => <span className="font-mono text-xs font-medium">{r.ticketNumber}</span> },
  { key: 'unit', header: 'Unit', className: 'font-mono text-xs' },
  { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer}</span> },
  { key: 'subject', header: 'Subject', className: 'text-sm' },
  { key: 'category', header: 'Category', className: 'text-xs' },
  { key: 'priority', header: 'Priority', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[r.priority] || ''}`}>{r.priority}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'assignedTo', header: 'Assigned To', className: 'text-xs' },
  { key: 'createdAt', header: 'Created', className: 'text-xs text-muted-foreground' },
];

export function MaintenancePage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: tickets = [], isLoading } = useMaintenanceTickets(statusFilter !== 'all' ? { status: statusFilter } : undefined) as { data: Ticket[] | undefined; isLoading: boolean };
  const createTicket = useCreateTicket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createTicket.mutate(
      { subject: fd.get('subject'), category: fd.get('category'), priority: fd.get('priority'), description: fd.get('description'), unitCode: fd.get('unitCode') },
      { onSuccess: () => { setDialogOpen(false); toast.success('Ticket created'); }, onError: () => toast.error('Failed to create ticket') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('maintenance.title')}
        description={t('maintenance.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('maintenance.add')}
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
              <span className="ml-1 opacity-70">({s === 'all' ? tickets.length : ''})</span>
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={tickets} loading={isLoading} searchPlaceholder={t('maintenance.search')} searchKeys={['ticketNumber', 'customer', 'subject', 'unit']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Maintenance Ticket" onSubmit={handleSubmit} submitLabel="Create Ticket" loading={createTicket.isPending}>
        <FormField label="Subject" required>
          <FormInput name="subject" placeholder="Brief description of the issue" required />
        </FormField>
        <FormRow>
          <FormField label="Category" required>
            <FormSelect name="category" required>
              <option value="">Select category</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="structural">Structural</option>
              <option value="painting">Painting</option>
              <option value="cleaning">Cleaning</option>
              <option value="pest_control">Pest Control</option>
              <option value="other">Other</option>
            </FormSelect>
          </FormField>
          <FormField label="Priority" required>
            <FormSelect name="priority" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormField label="Unit Code">
          <FormInput name="unitCode" placeholder="e.g. SG-PH1-A-101" />
        </FormField>
        <FormField label="Description">
          <FormTextarea name="description" placeholder="Detailed description..." rows={3} />
        </FormField>
      </FormDialog>
    </div>
  );
}
