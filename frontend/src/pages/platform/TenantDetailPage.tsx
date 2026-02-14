import { useParams, Link } from 'react-router-dom';
import {
  Building2, Users, FileText, Home, DollarSign, ArrowLeft,
  Power, PowerOff, Mail, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { usePlatformTenant, usePlatformTenantUsers, useToggleTenantActive, useToggleUserActive } from '@/hooks/useApi';

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tenant, isLoading } = usePlatformTenant(id || '') as { data: any; isLoading: boolean };
  const { data: users = [] } = usePlatformTenantUsers(id || '') as { data: any[] };
  const toggleTenant = useToggleTenantActive();
  const toggleUser = useToggleUserActive();

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
            <Link to="/platform/tenants" className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
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
          <StatCard title="Users" value={tenant.usersCount} subtitle={`${tenant.activeUsersCount} active`} icon={Users} />
          <StatCard title="Projects" value={tenant.projectsCount} icon={FileText} />
          <StatCard title="Units" value={tenant.unitsCount} icon={Home} />
          <StatCard title="Revenue" value={`AED ${Number(tenant.revenue || 0).toLocaleString()}`} icon={DollarSign} />
        </div>

        {/* Tenant Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border/60 shadow-soft p-5 space-y-3">
            <h3 className="font-semibold text-sm">Tenant Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{tenant.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Slug</span><span className="font-mono">{tenant.slug}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span>{tenant.domain || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(tenant.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* Users Table */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
              <h3 className="font-semibold flex items-center gap-2 text-[15px]">
                <Users className="h-4 w-4 text-rose-500" /> Users ({users.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">User</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Status</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Last Login</th>
                    <th className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No users</td></tr>
                  ) : (
                    users.map((u: any) => (
                      <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
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
