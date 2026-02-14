import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useTranslation } from 'react-i18next';
import { useUnits } from '@/hooks/useApi';

interface Unit {
  id: string;
  code: string;
  type: string;
  floor: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  totalPrice: string;
  pricePerSqft: string;
  status: string;
  project: string;
}

const statuses = ['all', 'available', 'sold', 'reserved', 'soft_reserved', 'blocked'];

const columns: Column<Unit>[] = [
  { key: 'code', header: 'Unit Code', className: 'font-mono text-xs', render: (r) => <span className="font-medium">{r.code}</span> },
  { key: 'type', header: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
  { key: 'floor', header: 'Floor' },
  { key: 'bedrooms', header: 'Bed/Bath', render: (r) => <span>{r.bedrooms}BR / {r.bathrooms}BA</span> },
  { key: 'areaSqft', header: 'Area (sqft)', render: (r) => <span>{r.areaSqft.toLocaleString()}</span> },
  { key: 'totalPrice', header: 'Price' },
  { key: 'pricePerSqft', header: 'PSF', className: 'text-xs text-muted-foreground' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function UnitsPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: units = [], isLoading } = useUnits(statusFilter !== 'all' ? { status: statusFilter } : undefined) as { data: Unit[] | undefined; isLoading: boolean };

  const filtered = units;

  return (
    <div>
      <PageHeader
        title={t('units.title')}
        description={t('units.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Plus className="h-4 w-4" /> {t('units.add')}
          </button>
        }
      />
      <div className="p-6 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all duration-200 ${statusFilter === s ? 'gradient-primary text-white border-transparent shadow-sm' : 'bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              {s === 'all' && <span className="ml-1 opacity-70">({units.length})</span>}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          searchPlaceholder={t('units.search')}
          searchKeys={['code', 'type', 'floor']}
        />
      </div>
    </div>
  );
}
