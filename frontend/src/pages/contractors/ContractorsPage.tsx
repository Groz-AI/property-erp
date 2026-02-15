import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useContractors, useCreateContractor } from '@/hooks/useApi';

interface Contractor {
  id: string;
  name: string;
  specialization: string;
  contactPerson: string;
  phone: string;
  email: string;
  licenseNumber: string;
  activeClaims: number;
  totalContractValue: string;
  status: string;
}

const columns: Column<Contractor>[] = [
  { key: 'name', header: 'Contractor', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'specialization', header: 'Specialization', className: 'text-xs capitalize' },
  { key: 'contactPerson', header: 'Contact Person', className: 'text-xs' },
  { key: 'phone', header: 'Phone', className: 'text-xs font-mono' },
  { key: 'email', header: 'Email', className: 'text-xs' },
  { key: 'licenseNumber', header: 'License #', className: 'font-mono text-xs' },
  { key: 'totalContractValue', header: 'Contract Value', className: 'font-mono text-xs' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function ContractorsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: contractors = [], isLoading } = useContractors() as { data: Contractor[] | undefined; isLoading: boolean };
  const createContractor = useCreateContractor();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createContractor.mutate(
      { name: fd.get('name'), specialization: fd.get('specialization'), contactPerson: fd.get('contactPerson'), phone: fd.get('phone'), email: fd.get('email'), licenseNumber: fd.get('licenseNumber') },
      { onSuccess: () => { setDialogOpen(false); toast.success('Contractor created'); }, onError: () => toast.error('Failed to create contractor') },
    );
  };

  return (
    <div>
      <PageHeader
        title="Contractors"
        description="Manage contractors and progress claims"
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Contractor
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={contractors} loading={isLoading} searchPlaceholder="Search contractors..." searchKeys={['name', 'specialization', 'contactPerson']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Contractor" onSubmit={handleSubmit} submitLabel="Create Contractor" loading={createContractor.isPending}>
        <FormField label="Company Name" required>
          <FormInput name="name" placeholder="Contractor company name" required />
        </FormField>
        <FormRow>
          <FormField label="Specialization" required>
            <FormSelect name="specialization" required>
              <option value="">Select specialization</option>
              <option value="general">General Contractor</option>
              <option value="structural">Structural</option>
              <option value="mep">MEP (Mechanical/Electrical/Plumbing)</option>
              <option value="finishing">Finishing & Fit-out</option>
              <option value="landscaping">Landscaping</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
            </FormSelect>
          </FormField>
          <FormField label="License #">
            <FormInput name="licenseNumber" placeholder="License number" />
          </FormField>
        </FormRow>
        <FormField label="Contact Person" required>
          <FormInput name="contactPerson" placeholder="Full name" required />
        </FormField>
        <FormRow>
          <FormField label="Email">
            <FormInput name="email" type="email" placeholder="contact@contractor.com" />
          </FormField>
          <FormField label="Phone">
            <FormInput name="phone" placeholder="+971..." />
          </FormField>
        </FormRow>
      </FormDialog>
    </div>
  );
}
