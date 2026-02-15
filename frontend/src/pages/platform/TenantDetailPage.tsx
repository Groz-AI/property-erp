import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, Users, FileText, Home, DollarSign, ArrowLeft,
  Power, PowerOff, Mail, Clock, Pencil, Check, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { usePlatformTenant, usePlatformTenantUsers, useToggleTenantActive, useToggleUserActive, useUpdateTenant } from '@/hooks/useApi';

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tenant, isLoading } = usePlatformTenant(id || '') as { data: any; isLoading: boolean };
  const { data: users = [] } = usePlatformTenantUsers(id || '') as { data: any[] };
  const toggleTenant = useToggleTenantActive();
  const toggleUser = useToggleUserActive();
  const updateTenant = useUpdateTenant();
  const [editingMaxUsers, setEditingMaxUsers] = useState(false);
  const [maxUsersValue, setMaxUsersValue] = useState<number>(0);

  if (isLoading || !tenant) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const handleToggleTenant = () => {
    toggleTenant.mutate(
      { id: tenant.id, active: !tenant.isActive },
      {
        onSuccess: () => toast.success(tenant.isActive ? 'Tenant deactivated' : 'Tenant activated'),
        onError: () => toast.error('Failed to toggle tenant'),
      },
    );
  };

  const handleToggleUser = (userId: string, currentActive: boolean) => {
    toggleUser.mutate(
      { id: userId, active: !currentActive },
      {
        onSuccess: () => toast.success(currentActive ? 'User deactivated' : 'User activated'),
        onError: () => toast.error('Failed to toggle user'),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title={tenant.name}
        description={`${tenant.slug}${tenant.domain ? ` · ${tenant.domain}` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/platform/tenants" className="btn-secondary text-xs">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <button
              onClick={handleToggleTenant}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                tenant.isActive
                  ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
              }`}
            >
              {tenant.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              {tenant.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Tenant Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Status" value={tenant.isActive ? 'Active' : 'Inactive'} icon={Building2} variant={tenant.isActive ? 'gradient' : undefined} />
          <StatCard title="Users" value={`${tenant.usersCount} / ${tenant.maxUsers || '∞'}`} subtitle={`${tenant.activeUsersCount} active`} icon={Users} />
          <StatCard title="Projects" value={tenant.projectsCount} icon={FileText} />
          <StatCard title="Units" value={tenant.unitsCount} icon={Home} />
          <StatCard title="Revenue" value={`EGP ${Number(tenant.revenue || 0).toLocaleString()}`} icon={DollarSign} />
        </div>

        {/* Tenant Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-5 space-y-4">
            <h3 className="font-semibold text-[15px] tracking-tight">Tenant Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{tenant.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Slug</span><span className="font-mono">{tenant.slug}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span>{tenant.domain || '—'}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Max Users</span>
                {editingMaxUsers ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={maxUsersValue}
                      onChange={(e) => setMaxUsersValue(Number(e.target.value))}
                      className="w-20 rounded-lg border border-border/60 bg-background px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateTenant.mutate(
                            { id: tenant.id, data: { maxUsers: maxUsersValue } },
                            {
                              onSuccess: () => { setEditingMaxUsers(false); toast.success(`Max users updated to ${maxUsersValue}`); },
                              onError: () => toast.error('Failed to update max users'),
                            },
                          );
                        }
                        if (e.key === 'Escape') setEditingMaxUsers(false);
                      }}
                    />
                    <button
                      onClick={() => {
                        updateTenant.mutate(
                          { id: tenant.id, data: { maxUsers: maxUsersValue } },
                          {
                            onSuccess: () => { setEditingMaxUsers(false); toast.success(`Max users updated to ${maxUsersValue}`); },
                            onError: () => toast.error('Failed to update max users'),
                          },
                        );
                      }}
                      disabled={updateTenant.isPending}
                      className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                      title="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingMaxUsers(false)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold">{tenant.maxUsers || '∞'}</span>
                    <button
                      onClick={() => { setMaxUsersValue(tenant.maxUsers || 10); setEditingMaxUsers(true); }}
                      className="rounded-md p-1 text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Edit max users"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(tenant.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* Users Table */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
            <div className="border-b border-border/30 px-5 py-4">
              <h3 className="font-semibold flex items-center gap-2 text-[15px]">
                <Users className="h-4 w-4 text-rose-500/70" /> Users ({users.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">User</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Last Login</th>
                    <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No users</td></tr>
                  ) : (
                    users.map((u: any) => (
                      <tr key={u.id} className="border-b border-border/25 last:border-0 hover:bg-primary/[0.02] transition-colors duration-150">
                        <td className="px-5 py-3">
                          <div className="font-medium">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</div>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleToggleUser(u.id, u.isActive)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                              u.isActive
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                            }`}
                          >
                            {u.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                            {u.isActive ? 'Deactivate' : 'Activate'}
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
      </div>
    </div>
  );
}
