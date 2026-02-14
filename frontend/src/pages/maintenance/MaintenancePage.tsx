import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useTranslation } from 'react-i18next';
import { useMaintenanceTickets } from '@/hooks/useApi';

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
  const { data: tickets = [], isLoading } = useMaintenanceTickets(statusFilter !== 'all' ? { status: statusFilter } : undefined) as { data: Ticket[] | undefined; isLoading: boolean };
  const filtered = tickets;

  return (
    <div>
      <PageHeader
        title={t('maintenance.title')}
        description={t('maintenance.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
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
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${statusFilter === s ? 'gradient-primary text-white border-transparent shadow-sm' : 'bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              <span className="ml-1 opacity-70">({s === 'all' ? tickets.length : ''})</span>
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} loading={isLoading} searchPlaceholder={t('maintenance.search')} searchKeys={['ticketNumber', 'customer', 'subject', 'unit']} />
      </div>
    </div>
  );
}
