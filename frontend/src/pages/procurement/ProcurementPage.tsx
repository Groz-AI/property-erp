import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormRow, FormTextarea } from '@/components/ui/form-dialog';
import { usePurchaseOrders, useCreatePO } from '@/hooks/useApi';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  project: string;
  totalAmount: string;
  currency: string;
  issueDate: string;
  expectedDelivery: string;
  status: string;
}

const columns: Column<PurchaseOrder>[] = [
  { key: 'poNumber', header: 'PO #', render: (r) => <span className="font-mono text-xs font-medium">{r.poNumber}</span> },
  { key: 'vendor', header: 'Vendor', render: (r) => <span className="font-medium">{r.vendor}</span> },
  { key: 'project', header: 'Project', className: 'text-xs' },
  { key: 'totalAmount', header: 'Amount', className: 'font-mono text-xs' },
  { key: 'issueDate', header: 'Issue Date', className: 'text-xs' },
  { key: 'expectedDelivery', header: 'Expected Delivery', className: 'text-xs text-muted-foreground' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export function ProcurementPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: orders = [], isLoading } = usePurchaseOrders() as { data: PurchaseOrder[] | undefined; isLoading: boolean };
  const createPO = useCreatePO();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createPO.mutate(
      { vendorId: fd.get('vendorId'), projectId: fd.get('projectId'), description: fd.get('description'), totalAmount: Number(fd.get('totalAmount')), expectedDelivery: fd.get('expectedDelivery') },
      { onSuccess: () => { setDialogOpen(false); toast.success('Purchase order created'); }, onError: () => toast.error('Failed to create PO') },
    );
  };

  return (
    <div>
      <PageHeader
        title="Procurement"
        description="Manage purchase orders and vendor relationships"
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New Purchase Order
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={orders} loading={isLoading} searchPlaceholder="Search purchase orders..." searchKeys={['poNumber', 'vendor', 'project']} />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Purchase Order" onSubmit={handleSubmit} submitLabel="Create PO" loading={createPO.isPending}>
        <FormRow>
          <FormField label="Vendor ID" required>
            <FormInput name="vendorId" placeholder="Vendor UUID" required />
          </FormField>
          <FormField label="Project ID">
            <FormInput name="projectId" placeholder="Project UUID" />
          </FormField>
        </FormRow>
        <FormField label="Description" required>
          <FormTextarea name="description" placeholder="PO description" rows={2} required />
        </FormField>
        <FormRow>
          <FormField label="Total Amount" required>
            <FormInput name="totalAmount" type="number" placeholder="0.00" min="0" step="0.01" required />
          </FormField>
          <FormField label="Expected Delivery">
            <FormInput name="expectedDelivery" type="date" />
          </FormField>
        </FormRow>
      </FormDialog>
    </div>
  );
}
