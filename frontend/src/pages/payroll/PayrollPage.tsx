import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useTranslation } from 'react-i18next';
import { usePayroll } from '@/hooks/useApi';

interface Payslip {
  id: string;
  employee: string;
  period: string;
  basicSalary: string;
  allowances: string;
  deductions: string;
  netSalary: string;
  status: string;
}

const columns: Column<Payslip>[] = [
  { key: 'employee', header: 'Employee', render: (r) => <span className="font-medium">{r.employee}</span> },
  { key: 'period', header: 'Period' },
  { key: 'basicSalary', header: 'Basic', className: 'font-mono text-xs' },
  { key: 'allowances', header: 'Allowances', className: 'font-mono text-xs' },
  { key: 'deductions', header: 'Deductions', className: 'font-mono text-xs' },
  { key: 'netSalary', header: 'Net Salary', render: (r) => <span className="font-semibold">{r.netSalary}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function PayrollPage() {
  const { t } = useTranslation();
  const { data: payslips = [], isLoading } = usePayroll() as { data: Payslip[] | undefined; isLoading: boolean };
  return (
    <div>
      <PageHeader
        title={t('payroll.title')}
        description={t('payroll.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Plus className="h-4 w-4" /> {t('payroll.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={payslips} loading={isLoading} searchPlaceholder={t('payroll.search')} searchKeys={['employee', 'period']} />
      </div>
    </div>
  );
}
