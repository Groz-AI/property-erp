import { useState } from 'react';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormSelect, FormRow, FormTextarea } from '@/components/ui/form-dialog';
import { useTranslation } from 'react-i18next';
import { useCustomers, useCreateCustomer } from '@/hooks/useApi';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  idType: string;
  kycStatus: string;
  totalContracts: number;
  createdAt: string;
}

const columns: Column<Customer>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'email', header: 'Email', className: 'text-xs' },
  { key: 'phone', header: 'Phone', className: 'text-xs font-mono' },
  { key: 'nationality', header: 'Nationality' },
  { key: 'idType', header: 'ID Type', className: 'text-xs' },
  { key: 'kycStatus', header: 'KYC', render: (r) => <StatusBadge status={r.kycStatus === 'verified' ? 'approved' : r.kycStatus === 'expired' ? 'overdue' : 'pending'} /> },
  { key: 'totalContracts', header: 'Contracts' },
  { key: 'createdAt', header: 'Registered', className: 'text-xs text-muted-foreground' },
  { key: 'actions', header: '', sortable: false, className: 'w-10', render: () => (
    <div className="flex items-center gap-0.5">
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
      <button className="rounded-lg p-1.5 hover:bg-muted transition-colors" title="More"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" /></button>
    </div>
  )},
];

export function CustomersPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: customers = [], isLoading } = useCustomers() as { data: Customer[] | undefined; isLoading: boolean };
  const createCustomer = useCreateCustomer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createCustomer.mutate(
      { firstName: fd.get('firstName'), lastName: fd.get('lastName'), firstNameAr: fd.get('firstNameAr'), lastNameAr: fd.get('lastNameAr'), email: fd.get('email'), phone: fd.get('phone'), nationality: fd.get('nationality'), idType: fd.get('idType'), idNumber: fd.get('idNumber'), notes: fd.get('notes') },
      { onSuccess: () => { setDialogOpen(false); toast.success(t('customers.add') + ' ✓'); }, onError: () => toast.error('Failed to create customer') },
    );
  };

  return (
    <div>
      <PageHeader
        title={t('customers.title')}
        description={t('customers.description')}
        actions={
          <button onClick={() => setDialogOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> {t('customers.add')}
          </button>
        }
      />
      <div className="p-6">
        <DataTable columns={columns} data={customers} loading={isLoading} searchPlaceholder={t('customers.search')} searchKeys={['name', 'email', 'phone']} exportable exportFilename="customers" />
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Customer" onSubmit={handleSubmit} submitLabel="Create Customer">
        <FormRow>
          <FormField label="First Name" required>
            <FormInput name="firstName" placeholder="First name" required />
          </FormField>
          <FormField label="Last Name" required>
            <FormInput name="lastName" placeholder="Last name" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="First Name (Arabic)">
            <FormInput name="firstNameAr" placeholder="الاسم الأول" dir="rtl" />
          </FormField>
          <FormField label="Last Name (Arabic)">
            <FormInput name="lastNameAr" placeholder="اسم العائلة" dir="rtl" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Email" required>
            <FormInput name="email" type="email" placeholder="email@example.com" required />
          </FormField>
          <FormField label="Phone" required>
            <FormInput name="phone" type="tel" placeholder="+971-50-XXX-XXXX" required />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Nationality" required>
            <FormSelect name="nationality" required>
              <option value="">Select</option>
              <option value="UAE">UAE</option>
              <option value="SAU">Saudi Arabia</option>
              <option value="IND">India</option>
              <option value="GBR">United Kingdom</option>
              <option value="RUS">Russia</option>
              <option value="CHN">China</option>
              <option value="PAK">Pakistan</option>
            </FormSelect>
          </FormField>
          <FormField label="ID Type" required>
            <FormSelect name="idType" required>
              <option value="">Select</option>
              <option value="emirates_id">Emirates ID</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
            </FormSelect>
          </FormField>
        </FormRow>
        <FormField label="ID Number" required>
          <FormInput name="idNumber" placeholder="ID or Passport number" required />
        </FormField>
        <FormField label="Notes">
          <FormTextarea name="notes" placeholder="Additional notes..." rows={3} />
        </FormField>
      </FormDialog>
    </div>
  );
}
