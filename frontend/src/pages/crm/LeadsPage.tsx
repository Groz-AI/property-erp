import { useState } from 'react';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow, FormTextarea } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useLeads, useCreateLead } from '@/hooks/useApi';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  score: number;
  assignedTo: string;
  projectInterest: string;
  createdAt: string;
}

const statusPipeline = ['all', 'new', 'contacted', 'qualified', 'opportunity', 'won', 'lost'];

const columns: Column<Lead>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'email', header: 'Email', className: 'text-xs' },
  { key: 'phone', header: 'Phone', className: 'text-xs font-mono' },
  { key: 'source', header: 'Source' },
  { key: 'score', header: 'Score', render: (r) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${r.score}%` }} />
      </div>
      <span className="text-xs font-medium">{r.score}</span>
    </div>
  )},
  { key: 'assignedTo', header: 'Assigned To', className: 'text-xs' },
  { key: 'status', header: 'Stage', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'createdAt', header: 'Created', className: 'text-xs text-muted-foreground' },
  { key: 'actions', header: '', sortable: false, className: 'w-10', render: () => (
    <div className="flex items-center gap-0.5">
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="More"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
    </div>
  )},
];

export function LeadsPage() {
  const { t } = useTranslation();
  const [stageFilter, setStageFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: leads = [], isLoading } = useLeads(stageFilter !== 'all' ? { status: stageFilter } : undefined) as { data: Lead[] | undefined; isLoading: boolean };
  const createLead = useCreateLead();
  const filtered = leads;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createLead.mutate(
      { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), source: fd.get('source'), projectInterest: fd.get('projectInterest'), assignedTo: fd.get('assignedTo'), notes: fd.get('notes') },
      { onSuccess: () => { setDialogOpen(false); toast.success(t('leads.add') + ' ✓'); }, onError: () => toast.error('Failed to create lead') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('leads.title')}
        description={t('leads.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('leads.add')}
          </button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {statusPipeline.map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium border transition-all duration-200 ${stageFilter === s ? 'bg-foreground text-background border-transparent shadow-sm' : 'bg-transparent border-border/50 text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground hover:border-border/80'}`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              <span className="ml-1 opacity-70">({s === 'all' ? leads.length : ''})</span>
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} loading={isLoading} searchPlaceholder={t('leads.search')} searchKeys={['name', 'email', 'phone', 'source']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Lead" onSubmit={handleSubmit} submitLabel="Create Lead">
        <FormRow>
          <FormField label="Full Name" required>
            <FormInput name="name" placeholder="Full name" required />
          </FormField>
          <FormField label="Email" required>
            <FormInput name="email" type="email" placeholder="email@example.com" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Phone" required>
            <FormInput name="phone" type="tel" placeholder="+971-50-XXX-XXXX" required />
          </FormField>
          <FormField label="Source" required>
            <FormSelect name="source" required>
              <option value="">Select source</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="property_portal">Property Portal</option>
              <option value="exhibition">Exhibition</option>
              <option value="social_media">Social Media</option>
              <option value="cold_call">Cold Call</option>
              <option value="walk_in">Walk-in</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Project Interest">
            <FormSelect name="projectInterest">
              <option value="">Select project</option>
              <option value="proj-1">Sapphire Gardens</option>
              <option value="proj-2">Pearl Residences</option>
              <option value="proj-3">Oasis Tower</option>
            </FormSelect>
          </FormField>
          <FormField label="Assign To" required>
            <FormSelect name="assignedTo" required>
              <option value="">Select agent</option>
              <option value="u-1">Sarah Mitchell</option>
              <option value="u-2">Omar Hassan</option>
              <option value="u-3">Fatima Al-Zahra</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormField label="Notes">
          <FormTextarea name="notes" placeholder="Initial notes about this lead..." rows={3} />
        </FormField>
      </FormDialog>
    </div>
  );
}
