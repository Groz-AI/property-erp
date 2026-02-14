import { Link } from 'react-router-dom';
import {
  Building2, Users, DollarSign, FileText, ArrowRight,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { usePlatformStats, usePlatformTenants } from '@/hooks/useApi';

export function PlatformDashboard() {
  const { data: stats } = usePlatformStats() as { data: any };
  const { data: tenants = [] } = usePlatformTenants() as { data: any[] };

  return (
    <div>
      <PageHeader title="Platform Overview" description="Manage all tenants and monitor platform health" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tenants"
            value={stats?.totalTenants || 0}
            subtitle={`${stats?.activeTenants || 0} active`}
            icon={Building2}
            variant="gradient"
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.activeUsers || 0} active`}
            icon={Users}
          />
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            subtitle="Across all tenants"
            icon={FileText}
          />
          <StatCard
            title="Platform Revenue"
            value={`AED ${((stats?.totalRevenue || 0) / 1_000_000).toFixed(1)}M`}
            subtitle="All confirmed receipts"
            icon={DollarSign}
            trend={{ value: 0, label: '' }}
          />
        </div>

        {/* Tenants Table */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <h3 className="font-semibold flex items-center gap-2.5 text-[15px]">
              <Building2 className="h-4 w-4 text-rose-500" /> All Tenants
            </h3>
            <Link
              to="/platform/tenants"
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Tenant</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Users</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Projects</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Bookings</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No tenants yet</td>
                  </tr>
                ) : (
                  tenants.map((t: any) => (
                    <tr key={t.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/platform/tenants/${t.id}`} className="hover:text-primary transition-colors">
                          <div className="font-semibold">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.slug}{t.domain ? ` · ${t.domain}` : ''}</div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={t.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium">{t.usersCount}</td>
                      <td className="px-5 py-3.5 text-right font-medium">{t.projectsCount}</td>
                      <td className="px-5 py-3.5 text-right font-medium">{t.bookingsCount}</td>
                      <td className="px-5 py-3.5 text-right font-semibold">AED {Number(t.revenue || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
