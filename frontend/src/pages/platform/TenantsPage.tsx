import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Power, PowerOff, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormDialog, FormField, FormInput, FormRow } from '@/components/ui/form-dialog';
import { usePlatformTenants, useCreateTenant, useToggleTenantActive, useUpdateTenant } from '@/hooks/useApi';

export function TenantsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(10);
  const { data: tenants = [], isLoading } = usePlatformTenants() as { data: any[]; isLoading: boolean };
  const createTenant = useCreateTenant();
  const toggleActive = useToggleTenantActive();
  const updateTenant = useUpdateTenant();

  const saveMaxUsers = (id: string) => {
    updateTenant.mutate(
      { id, data: { maxUsers: editValue } },
      {
        onSuccess: () => { setEditingId(null); toast.success(`Max users updated to ${editValue}`); },
        onError: () => toast.error('Failed to update max users'),
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createTenant.mutate(
      {
        name: fd.get('name'),
        slug: fd.get('slug'),
        domain: fd.get('domain') || undefined,
        maxUsers: Number(fd.get('maxUsers') || 10),
        adminEmail: fd.get('adminEmail'),
        adminPassword: fd.get('adminPassword'),
        adminFirstName: fd.get('adminFirstName'),
        adminLastName: fd.get('adminLastName'),
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          toast.success('Tenant created successfully');
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create tenant'),
      },
    );
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    toggleActive.mutate(
      { id, active: !currentActive },
      {
        onSuccess: () => toast.success(currentActive ? 'Tenant deactivated' : 'Tenant activated'),
        onError: () => toast.error('Failed to toggle tenant status'),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Tenant Management"
        description="Create and manage tenant accounts"
        actions={
          <button
            onClick={() => setDialogOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> New Tenant
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Tenant</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Slug</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Users</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Projects</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Units</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Revenue</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Created</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/25">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : tenants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center text-muted-foreground">
                      <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No tenants yet. Create your first tenant to get started.</p>
                    </td>
                  </tr>
                ) : (
                  tenants.map((t: any) => (
                    <tr key={t.id} className="border-b border-border/25 last:border-0 hover:bg-primary/[0.02] transition-colors duration-150">
                      <td className="px-5 py-3.5">
                        <Link to={`/platform/tenants/${t.id}`} className="font-semibold hover:text-primary transition-colors">
                          {t.name}
                        </Link>
                        {t.domain && <div className="text-[11px] text-muted-foreground">{t.domain}</div>}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{t.slug}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={t.isActive ? 'active' : 'inactive'} /></td>
                      <td className="px-5 py-3.5 text-right">
                        {editingId === t.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-muted-foreground">{t.usersCount}/</span>
                            <input
                              type="number"
                              min={1}
                              max={10000}
                              value={editValue}
                              onChange={(e) => setEditValue(Number(e.target.value))}
                              className="w-16 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveMaxUsers(t.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button onClick={() => saveMaxUsers(t.id)} disabled={updateTenant.isPending} className="rounded p-0.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" title="Save"><Check className="h-3 w-3" /></button>
                            <button onClick={() => setEditingId(null)} className="rounded p-0.5 text-muted-foreground hover:bg-muted" title="Cancel"><X className="h-3 w-3" /></button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 group">
                            {t.usersCount}<span className="text-muted-foreground">/{t.maxUsers || '∞'}</span>
                            <button
                              onClick={() => { setEditValue(t.maxUsers || 10); setEditingId(t.id); }}
                              className="rounded p-0.5 text-muted-foreground/0 group-hover:text-muted-foreground/50 hover:!text-primary hover:bg-primary/5 transition-all"
                              title="Edit max users"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">{t.projectsCount}</td>
                      <td className="px-5 py-3.5 text-right">{t.unitsCount}</td>
                      <td className="px-5 py-3.5 text-right font-semibold">EGP {Number(t.revenue || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggle(t.id, t.isActive)}
                          title={t.isActive ? 'Deactivate' : 'Activate'}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            t.isActive
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          }`}
                        >
                          {t.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                          {t.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Create New Tenant" onSubmit={handleSubmit} loading={createTenant.isPending}>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            This will create a new tenant with an admin user, default roles, and chart of accounts.
          </p>
          <FormField label="Company Name" required>
            <FormInput name="name" placeholder="e.g. Sunrise Properties LLC" required />
          </FormField>
          <FormRow>
            <FormField label="Slug (URL identifier)" required>
              <FormInput name="slug" placeholder="e.g. sunrise-properties" required pattern="[a-z0-9-]+" title="Lowercase letters, numbers, and hyphens only" />
            </FormField>
            <FormField label="Custom Domain">
              <FormInput name="domain" placeholder="e.g. erp.sunrise.com" />
            </FormField>
          </FormRow>
          <FormField label="Max Users (account limit)">
            <FormInput name="maxUsers" type="number" placeholder="10" min="1" max="1000" defaultValue="10" />
          </FormField>
          <div className="border-t border-border/40 pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Tenant Admin Account</p>
            <FormRow>
              <FormField label="First Name" required>
                <FormInput name="adminFirstName" placeholder="Ahmad" required />
              </FormField>
              <FormField label="Last Name" required>
                <FormInput name="adminLastName" placeholder="Al-Rashid" required />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="Email" required>
                <FormInput name="adminEmail" type="email" placeholder="admin@sunrise.com" required />
              </FormField>
              <FormField label="Password" required>
                <FormInput name="adminPassword" type="password" placeholder="Min 8 characters" required minLength={8} />
              </FormField>
            </FormRow>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
