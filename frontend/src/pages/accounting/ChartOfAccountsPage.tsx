import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { useTranslation } from 'react-i18next';
import { useChartOfAccounts } from '@/hooks/useApi';

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
  const { data: accounts = [], isLoading } = useChartOfAccounts() as { data: Account[] | undefined; isLoading: boolean };
  return (
    <div>
      <PageHeader
        title={t('coa.title')}
        description={t('coa.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Plus className="h-4 w-4" /> {t('coa.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={accounts} loading={isLoading} searchPlaceholder={t('coa.search')} searchKeys={['code', 'name', 'type']} />
      </div>
    </div>
  );
}
