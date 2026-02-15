import { useState } from 'react';
import { Plus, MapPin, Calendar, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow, FormTextarea } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useProjects, useCreateProject } from '@/hooks/useApi';

interface Project {
  id: string;
  code: string;
  name: string;
  location: string;
  totalUnits: number;
  soldUnits: number;
  status: string;
  startDate: string;
  expectedCompletion: string;
}

const columns: Column<Project>[] = [
  { key: 'code', header: 'Code', className: 'font-mono text-xs' },
  { key: 'name', header: 'Project Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'location', header: 'Location', render: (r) => <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{r.location}</span> },
  { key: 'totalUnits', header: 'Units', render: (r) => <span>{r.soldUnits}/{r.totalUnits} sold</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'startDate', header: 'Start', render: (r) => <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{r.startDate}</span> },
  { key: 'expectedCompletion', header: 'Completion', render: (r) => <span className="text-xs text-muted-foreground">{r.expectedCompletion}</span> },
  { key: 'actions', header: '', sortable: false, className: 'w-10', render: () => (
    <div className="flex items-center gap-0.5">
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="More"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
    </div>
  )},
];

export function ProjectsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: projects = [], isLoading } = useProjects() as { data: Project[] | undefined; isLoading: boolean };
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createProject.mutate(
      {
        code: fd.get('code'),
        name: fd.get('name'),
        locationAddress: fd.get('location'),
        startDate: fd.get('startDate'),
        expectedEndDate: fd.get('expectedCompletion'),
        companyId: fd.get('companyId') || undefined,
        isActive: fd.get('status') === 'active',
        description: fd.get('description'),
      },
      {
        onSuccess: () => { setDialogOpen(false); toast.success(t('projects.add') + ' ✓'); },
        onError: () => toast.error('Failed to create project'),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('projects.title')}
        description={t('projects.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('projects.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable
          columns={columns}
          data={projects}
          loading={isLoading}
          searchPlaceholder={t('projects.search')}
          searchKeys={['name', 'code', 'location']}
        />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Project" onSubmit={handleSubmit} submitLabel="Create Project">
        <FormRow>
          <FormField label="Project Code" required>
            <FormInput name="code" placeholder="e.g. SG-001" required />
          </FormField>
          <FormField label="Project Name" required>
            <FormInput name="name" placeholder="Project name" required />
          </FormField>
        </FormRow>
        <FormField label="Location" required>
          <FormInput name="location" placeholder="e.g. Dubai Marina, Dubai" required />
        </FormField>
        <FormRow>
          <FormField label="Start Date" required>
            <FormInput name="startDate" type="date" required />
          </FormField>
          <FormField label="Expected Completion" required>
            <FormInput name="expectedCompletion" type="date" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Company" required>
            <FormSelect name="companyId" required>
              <option value="">Select company</option>
              <option value="comp-1">Groz Properties LLC</option>
            </FormSelect>
          </FormField>
          <FormField label="Status">
            <FormSelect name="status">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormField label="Description">
          <FormTextarea name="description" placeholder="Project description..." rows={3} />
        </FormField>
      </FormDialog>
    </div>
  );
}
