import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useTranslation } from 'react-i18next';
import { useInventoryItems } from '@/hooks/useApi';

interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  uom: string;
  unitCost: string;
  qtyOnHand: number;
  reorderLevel: number;
  status: string;
}

const columns: Column<Item>[] = [
  { key: 'code', header: 'Code', className: 'font-mono text-xs' },
  { key: 'name', header: 'Item Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'category', header: 'Category', className: 'text-xs' },
  { key: 'uom', header: 'UOM', className: 'text-xs uppercase' },
  { key: 'unitCost', header: 'Unit Cost', className: 'font-mono text-xs' },
  { key: 'qtyOnHand', header: 'Qty On Hand', render: (r) => (
    <span className={r.qtyOnHand <= r.reorderLevel ? 'text-red-600 font-semibold' : ''}>
      {r.qtyOnHand.toLocaleString()}
      {r.qtyOnHand <= r.reorderLevel && <span className="ml-1 text-xs">(Low)</span>}
    </span>
  )},
  { key: 'reorderLevel', header: 'Reorder At' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function InventoryPage() {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useInventoryItems() as { data: Item[] | undefined; isLoading: boolean };
  return (
    <div>
      <PageHeader
        title={t('inventory.title')}
        description={t('inventory.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Plus className="h-4 w-4" /> {t('inventory.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={items} loading={isLoading} searchPlaceholder={t('inventory.search')} searchKeys={['code', 'name', 'category']} />
      </div>
    </div>
  );
}
