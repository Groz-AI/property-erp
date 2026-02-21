import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useEmployees, useCreateEmployee } from '@/hooks/useApi';

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joinDate: string;
  basicSalary: string;
  status: string;
}

const columns: Column<Employee>[] = [
  { key: 'employeeCode', header: 'Code', className: 'font-mono text-xs' },
  { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'email', header: 'Email', className: 'text-xs' },
  { key: 'department', header: 'Department' },
  { key: 'designation', header: 'Designation', className: 'text-xs' },
  { key: 'joinDate', header: 'Join Date', className: 'text-xs text-muted-foreground' },
  { key: 'basicSalary', header: 'Basic Salary' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function EmployeesPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: rawEmployees = [], isLoading } = useEmployees() as { data: any[] | undefined; isLoading: boolean };
  const employees: Employee[] = rawEmployees.map((e: any) => ({
    id: e.id,
    employeeCode: e.employeeNumber || '',
    name: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
    email: e.email || '',
    department: e.department || '',
    designation: e.jobTitle || '',
    joinDate: e.hireDate ? new Date(e.hireDate).toLocaleDateString() : '',
    basicSalary: e.basicSalary ? Number(e.basicSalary).toLocaleString() : '0',
    status: e.isActive === false ? 'inactive' : 'active',
  }));
  const createEmployee = useCreateEmployee();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createEmployee.mutate(
      { firstName: fd.get('firstName'), lastName: fd.get('lastName'), email: fd.get('email'), department: fd.get('department'), jobTitle: fd.get('designation'), hireDate: fd.get('joinDate'), basicSalary: Number(fd.get('basicSalary')), nationality: fd.get('nationality') },
      { onSuccess: () => { setDialogOpen(false); toast.success('Employee added'); }, onError: () => toast.error('Failed to add employee') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        description={t('employees.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('employees.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={employees} loading={isLoading} searchPlaceholder={t('employees.search')} searchKeys={['name', 'email', 'department', 'employeeCode']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Employee" onSubmit={handleSubmit} submitLabel="Create Employee" loading={createEmployee.isPending}>
        <FormRow>
          <FormField label="First Name" required>
            <FormInput name="firstName" placeholder="First name" required />
          </FormField>
          <FormField label="Last Name" required>
            <FormInput name="lastName" placeholder="Last name" required />
          </FormField>
        </FormRow>
        <FormField label="Email" required>
          <FormInput name="email" type="email" placeholder="employee@company.com" required />
        </FormField>
        <FormRow>
          <FormField label="Department" required>
            <FormSelect name="department" required>
              <option value="">Select department</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Legal">Legal</option>
              <option value="Marketing">Marketing</option>
              <option value="Construction">Construction</option>
            </FormSelect>
          </FormField>
          <FormField label="Designation">
            <FormInput name="designation" placeholder="Job title" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Join Date" required>
            <FormInput name="joinDate" type="date" required />
          </FormField>
          <FormField label="Basic Salary" required>
            <FormInput name="basicSalary" type="number" placeholder="0.00" min="0" step="0.01" required />
          </FormField>
        </FormRow>
        <FormField label="Nationality">
          <FormInput name="nationality" placeholder="e.g. AE, EG, IN" />
        </FormField>
      </FormDialog>
    </div>
  );
}
