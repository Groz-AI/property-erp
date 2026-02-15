import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useChartOfAccounts, useCreateAccount } from '@/hooks/useApi';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  normalBalance: string;
  parentCode: string;
  isHeader: boolean;
  isActive: boolean;
}

const typeColors: Record<string, string> = {
  asset: 'text-blue-700 bg-blue-50',
  liability: 'text-red-700 bg-red-50',
  equity: 'text-purple-700 bg-purple-50',
  revenue: 'text-green-700 bg-green-50',
  expense: 'text-orange-700 bg-orange-50',
};

const columns: Column<Account>[] = [
  { key: 'code', header: 'Code', render: (r) => <span className={`font-mono text-xs ${r.isHeader ? 'font-bold' : ''}`}>{r.code}</span> },
  { key: 'name', header: 'Account Name', render: (r) => {
    const indent = r.parentCode === '-' ? '' : r.isHeader ? 'pl-4' : 'pl-8';
    return <span className={`${indent} ${r.isHeader ? 'font-semibold' : ''}`}>{r.name}</span>;
  }},
  { key: 'type', header: 'Type', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[r.type] || ''}`}>{r.type}</span> },
  { key: 'normalBalance', header: 'Normal Balance', render: (r) => <span className="capitalize text-xs text-muted-foreground">{r.normalBalance}</span> },
  { key: 'isHeader', header: 'Header', render: (r) => r.isHeader ? <span className="text-xs text-muted-foreground">Yes</span> : <span className="text-xs">No</span> },
  { key: 'isActive', header: 'Active', render: (r) => r.isActive ? <span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> : <span className="h-2 w-2 rounded-full bg-gray-300 inline-block" />, sortable: false },
];

export function ChartOfAccountsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: accounts = [], isLoading } = useChartOfAccounts() as { data: Account[] | undefined; isLoading: boolean };
  const createAccount = useCreateAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createAccount.mutate(
      { code: fd.get('code'), name: fd.get('name'), nameAr: fd.get('nameAr'), type: fd.get('type'), isHeader: fd.get('isHeader') === 'true' },
      { onSuccess: () => { setDialogOpen(false); toast.success('Account created'); }, onError: () => toast.error('Failed to create account') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('coa.title')}
        description={t('coa.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('coa.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={accounts} loading={isLoading} searchPlaceholder={t('coa.search')} searchKeys={['code', 'name', 'type']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Account" onSubmit={handleSubmit} submitLabel="Create Account" loading={createAccount.isPending}>
        <FormRow>
          <FormField label="Account Code" required>
            <FormInput name="code" placeholder="e.g. 1101" required />
          </FormField>
          <FormField label="Type" required>
            <FormSelect name="type" required>
              <option value="">Select type</option>
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormField label="Account Name (EN)" required>
          <FormInput name="name" placeholder="Account name" required />
        </FormField>
        <FormField label="Account Name (AR)">
          <FormInput name="nameAr" placeholder="اسم الحساب" dir="rtl" />
        </FormField>
        <FormField label="Is Header Account?">
          <FormSelect name="isHeader">
            <option value="false">No - Transactional</option>
            <option value="true">Yes - Header/Group</option>
          </FormSelect>
        </FormField>
      </FormDialog>
    </div>
  );
}
