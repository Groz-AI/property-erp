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
            value={`EGP ${((stats?.totalRevenue || 0) / 1_000_000).toFixed(1)}M`}
            subtitle="All confirmed receipts"
            icon={DollarSign}
            trend={{ value: 0, label: '' }}
          />
        </div>

        {/* Tenants Table */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
            <h3 className="font-semibold flex items-center gap-2.5 text-[15px]">
              <Building2 className="h-4 w-4 text-rose-500/70" /> All Tenants
            </h3>
            <Link
              to="/platform/tenants"
              className="text-xs font-semibold text-primary/80 hover:text-primary flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Tenant</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Users</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Projects</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Bookings</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-muted-foreground/60">No tenants yet</td>
                  </tr>
                ) : (
                  tenants.map((t: any) => (
                    <tr key={t.id} className="border-b border-border/25 last:border-0 hover:bg-primary/[0.02] transition-colors duration-150">
                      <td className="px-5 py-3.5">
                        <Link to={`/platform/tenants/${t.id}`} className="hover:text-primary transition-colors">
                          <div className="font-semibold">{t.name}</div>
                          <div className="text-[12px] text-muted-foreground/50 mt-0.5">{t.slug}{t.domain ? ` · ${t.domain}` : ''}</div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={t.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums">{t.usersCount}</td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums">{t.projectsCount}</td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums">{t.bookingsCount}</td>
                      <td className="px-5 py-3.5 text-right font-bold tabular-nums">EGP {Number(t.revenue || 0).toLocaleString()}</td>
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
