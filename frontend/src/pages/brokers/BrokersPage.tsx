import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useTranslation } from 'react-i18next';
import { useBrokers } from '@/hooks/useApi';

interface Broker {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  licenseNumber: string;
  commissionMethod: string;
  totalDeals: number;
  totalCommission: string;
  status: string;
}

const columns: Column<Broker>[] = [
  { key: 'name', header: 'Broker Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'company', header: 'Company', className: 'text-xs' },
  { key: 'email', header: 'Email', className: 'text-xs' },
  { key: 'phone', header: 'Phone', className: 'text-xs font-mono' },
  { key: 'licenseNumber', header: 'License #', className: 'font-mono text-xs' },
  { key: 'commissionMethod', header: 'Commission', render: (r) => <span className="capitalize text-xs">{r.commissionMethod.replace(/_/g, ' ')}</span> },
  { key: 'totalDeals', header: 'Deals' },
  { key: 'totalCommission', header: 'Total Commission' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function BrokersPage() {
  const { t } = useTranslation();
  const { data: brokers = [], isLoading } = useBrokers() as { data: Broker[] | undefined; isLoading: boolean };
  return (
    <div>
      <PageHeader
        title={t('brokers.title')}
        description={t('brokers.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Plus className="h-4 w-4" /> {t('brokers.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={brokers} loading={isLoading} searchPlaceholder={t('brokers.search')} searchKeys={['name', 'company', 'email', 'licenseNumber']} />
      </div>
    </div>
  );
}
