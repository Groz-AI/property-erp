import { useState } from 'react';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useUnits, useCreateUnit } from '@/hooks/useApi';

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
  { key: 'areaSqft', header: 'Area (sqft)', render: (r) => <span>{r.areaSqft?.toLocaleString()}</span> },
  { key: 'totalPrice', header: 'Price' },
  { key: 'pricePerSqft', header: 'PSF', className: 'text-xs text-muted-foreground' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'actions', header: '', sortable: false, className: 'w-10', render: () => (
    <div className="flex items-center gap-0.5">
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="More"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
    </div>
  )},
];

export function UnitsPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: units = [], isLoading } = useUnits(statusFilter !== 'all' ? { status: statusFilter } : undefined) as { data: Unit[] | undefined; isLoading: boolean };
  const createUnit = useCreateUnit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createUnit.mutate(
      { code: fd.get('code'), type: fd.get('type'), bedrooms: Number(fd.get('bedrooms')), bathrooms: Number(fd.get('bathrooms')), builtUpArea: Number(fd.get('builtUpArea')), totalPrice: Number(fd.get('totalPrice')), pricePerSqm: Number(fd.get('pricePerSqm')), viewType: fd.get('viewType') },
      { onSuccess: () => { setDialogOpen(false); toast.success('Unit created successfully'); }, onError: () => toast.error('Failed to create unit') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('units.title')}
        description={t('units.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('units.add')}
          </button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium border transition-all duration-200 ${statusFilter === s ? 'bg-foreground text-background border-transparent shadow-sm' : 'bg-transparent border-border/50 text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground hover:border-border/80'}`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              {s === 'all' && <span className="ml-1 opacity-70">({units.length})</span>}
            </button>
          ))}
        </div>

        <DataTable columns={columns} data={units} loading={isLoading} searchPlaceholder={t('units.search')} searchKeys={['code', 'type', 'floor']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Unit" onSubmit={handleSubmit} submitLabel="Create Unit" loading={createUnit.isPending}>
        <FormRow>
          <FormField label="Unit Code" required>
            <FormInput name="code" placeholder="e.g. SG-PH1-A-101" required />
          </FormField>
          <FormField label="Type" required>
            <FormSelect name="type" required>
              <option value="">Select type</option>
              <option value="studio">Studio</option>
              <option value="apartment">Apartment</option>
              <option value="duplex">Duplex</option>
              <option value="penthouse">Penthouse</option>
              <option value="villa">Villa</option>
              <option value="townhouse">Townhouse</option>
              <option value="retail">Retail</option>
              <option value="office">Office</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Bedrooms">
            <FormInput name="bedrooms" type="number" placeholder="0" min="0" />
          </FormField>
          <FormField label="Bathrooms">
            <FormInput name="bathrooms" type="number" placeholder="0" min="0" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Built-up Area (sqm)" required>
            <FormInput name="builtUpArea" type="number" placeholder="0" min="0" step="0.01" required />
          </FormField>
          <FormField label="View Type">
            <FormSelect name="viewType">
              <option value="">Select view</option>
              <option value="garden">Garden</option>
              <option value="pool">Pool</option>
              <option value="sea">Sea</option>
              <option value="city">City</option>
              <option value="lake">Lake</option>
              <option value="panoramic">Panoramic</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Total Price" required>
            <FormInput name="totalPrice" type="number" placeholder="0.00" min="0" step="0.01" required />
          </FormField>
          <FormField label="Price per sqm">
            <FormInput name="pricePerSqm" type="number" placeholder="0.00" min="0" step="0.01" />
          </FormField>
        </FormRow>
      </FormDialog>
    </div>
  );
}
