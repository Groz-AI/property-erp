import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useTranslation } from 'react-i18next';
import { useEmployees } from '@/hooks/useApi';

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
  const { data: employees = [], isLoading } = useEmployees() as { data: Employee[] | undefined; isLoading: boolean };
  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        description={t('employees.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Plus className="h-4 w-4" /> {t('employees.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={employees} loading={isLoading} searchPlaceholder={t('employees.search')} searchKeys={['name', 'email', 'department', 'employeeCode']} />
      </div>
    </div>
  );
}
