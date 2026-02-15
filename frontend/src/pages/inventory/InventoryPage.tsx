import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useInventoryItems, useCreateInventoryItem } from '@/hooks/useApi';

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
      {r.qtyOnHand?.toLocaleString()}
      {r.qtyOnHand <= r.reorderLevel && <span className="ml-1 text-xs">(Low)</span>}
    </span>
  )},
  { key: 'reorderLevel', header: 'Reorder At' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function InventoryPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: items = [], isLoading } = useInventoryItems() as { data: Item[] | undefined; isLoading: boolean };
  const createItem = useCreateInventoryItem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createItem.mutate(
      { code: fd.get('code'), name: fd.get('name'), category: fd.get('category'), uom: fd.get('uom'), unitCost: Number(fd.get('unitCost')), reorderLevel: Number(fd.get('reorderLevel') || 0) },
      { onSuccess: () => { setDialogOpen(false); toast.success('Item created'); }, onError: () => toast.error('Failed to create item') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('inventory.title')}
        description={t('inventory.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('inventory.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={items} loading={isLoading} searchPlaceholder={t('inventory.search')} searchKeys={['code', 'name', 'category']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Inventory Item" onSubmit={handleSubmit} submitLabel="Create Item" loading={createItem.isPending}>
        <FormRow>
          <FormField label="Item Code" required>
            <FormInput name="code" placeholder="e.g. ITM-001" required />
          </FormField>
          <FormField label="Category" required>
            <FormSelect name="category" required>
              <option value="">Select category</option>
              <option value="building_materials">Building Materials</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="furniture">Furniture</option>
              <option value="tools">Tools</option>
              <option value="safety">Safety Equipment</option>
              <option value="other">Other</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormField label="Item Name" required>
          <FormInput name="name" placeholder="Item name" required />
        </FormField>
        <FormRow>
          <FormField label="Unit of Measure" required>
            <FormSelect name="uom" required>
              <option value="">Select UOM</option>
              <option value="pcs">Pieces</option>
              <option value="kg">Kilograms</option>
              <option value="m">Meters</option>
              <option value="sqm">Square Meters</option>
              <option value="ltr">Liters</option>
              <option value="box">Boxes</option>
              <option value="set">Sets</option>
            </FormSelect>
          </FormField>
          <FormField label="Unit Cost">
            <FormInput name="unitCost" type="number" placeholder="0.00" min="0" step="0.01" />
          </FormField>
        </FormRow>
        <FormField label="Reorder Level">
          <FormInput name="reorderLevel" type="number" placeholder="0" min="0" />
        </FormField>
      </FormDialog>
    </div>
  );
}
