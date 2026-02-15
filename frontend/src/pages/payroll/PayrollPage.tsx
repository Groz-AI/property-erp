import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { usePayroll, useCreatePayslip } from '@/hooks/useApi';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: payslips = [], isLoading } = usePayroll() as { data: Payslip[] | undefined; isLoading: boolean };
  const createPayslip = useCreatePayslip();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createPayslip.mutate(
      { employeeId: fd.get('employeeId'), period: fd.get('period'), basicSalary: Number(fd.get('basicSalary')), housingAllowance: Number(fd.get('housingAllowance') || 0), transportAllowance: Number(fd.get('transportAllowance') || 0), otherDeductions: Number(fd.get('otherDeductions') || 0) },
      { onSuccess: () => { setDialogOpen(false); toast.success('Payslip created'); }, onError: () => toast.error('Failed to create payslip') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('payroll.title')}
        description={t('payroll.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('payroll.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={payslips} loading={isLoading} searchPlaceholder={t('payroll.search')} searchKeys={['employee', 'period']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Generate Payslip" onSubmit={handleSubmit} submitLabel="Create Payslip" loading={createPayslip.isPending}>
        <FormField label="Employee ID" required>
          <FormInput name="employeeId" placeholder="Employee UUID" required />
        </FormField>
        <FormRow>
          <FormField label="Period" required>
            <FormInput name="period" type="month" required />
          </FormField>
          <FormField label="Basic Salary" required>
            <FormInput name="basicSalary" type="number" placeholder="0.00" min="0" step="0.01" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Housing Allowance">
            <FormInput name="housingAllowance" type="number" placeholder="0.00" min="0" step="0.01" />
          </FormField>
          <FormField label="Transport Allowance">
            <FormInput name="transportAllowance" type="number" placeholder="0.00" min="0" step="0.01" />
          </FormField>
        </FormRow>
        <FormField label="Other Deductions">
          <FormInput name="otherDeductions" type="number" placeholder="0.00" min="0" step="0.01" />
        </FormField>
      </FormDialog>
    </div>
  );
}
