import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Building2, Home, DollarSign, AlertTriangle, FileText,
  Users, TrendingUp, Receipt, Clock, ArrowRight, Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { useBookings, useProjects, useReceipts, useUnits, useNotifications } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: bookings = [] } = useBookings() as { data: any[] };
  const { data: projects = [] } = useProjects() as { data: any[] };
  const { data: receipts = [] } = useReceipts() as { data: any[] };
  const { data: units = [] } = useUnits() as { data: any[] };
  const { data: notifications = [] } = useNotifications() as { data: any[] };

  const recentBookings = bookings.slice(0, 3);
  const totalRevenue = receipts.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);
  const activeProjects = projects.filter((p: any) => p.status === 'active').length;

  // Collections summary computed from receipts
  const confirmedReceipts = receipts.filter((r: any) => r.status === 'confirmed');
  const totalCollected = confirmedReceipts.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
  const pendingReceipts = receipts.filter((r: any) => r.status === 'draft');
  const totalPending = pendingReceipts.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
  const collectionTarget = totalCollected + totalPending || 1;

  // Unit status distribution
  const unitStatusMap: Record<string, number> = {};
  units.forEach((u: any) => { unitStatusMap[u.status] = (unitStatusMap[u.status] || 0) + 1; });
  const unitTotal = units.length || 1;
  const unitStatuses = Object.entries(unitStatusMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([status, count]) => ({ status, count, pct: Math.round((count / unitTotal) * 100) }));

  // Top agents from bookings
  const agentMap: Record<string, { name: string; deals: number; value: number }> = {};
  bookings.forEach((b: any) => {
    const agentId = b.agentId || 'unknown';
    if (!agentMap[agentId]) agentMap[agentId] = { name: agentId, deals: 0, value: 0 };
    agentMap[agentId].deals += 1;
    agentMap[agentId].value += Number(b.netPrice) || 0;
  });
  const topAgents = Object.values(agentMap).sort((a, b) => b.value - a.value).slice(0, 3);

  // Recent activity from notifications
  const recentActivity = notifications.slice(0, 5);

  return (
    <div>
      <PageHeader title={t('dashboard.title')} description={t('dashboard.welcome')} />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('dashboard.total_revenue')} value={`AED ${(totalRevenue / 1_000_000).toFixed(1)}M`} subtitle={`${receipts.length} receipts`} icon={DollarSign} trend={{ value: 8, label: 'vs last quarter' }} variant="gradient" />
          <StatCard title={t('dashboard.total_bookings')} value={bookings.length} subtitle={`Across ${projects.length} projects`} icon={Home} trend={{ value: 12, label: 'vs last month' }} />
          <StatCard title={t('dashboard.active_projects')} value={activeProjects} subtitle="Ready for sale" icon={Building2} />
          <StatCard title={t('dashboard.occupancy_rate')} value={`${projects.length > 0 ? Math.round((bookings.length / Math.max(projects.length, 1)) * 10) : 0}%`} subtitle={`${bookings.filter((b: any) => b.status === 'active').length} active`} icon={AlertTriangle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <h3 className="font-semibold flex items-center gap-2.5 text-[15px]"><FileText className="h-4 w-4 text-primary" /> {t('dashboard.recent_bookings')}</h3>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">Last 7 days</span>
            </div>
            <div className="divide-y divide-border/30">
              {recentBookings.map((b: any) => (
                <div key={b.id || b.bookingNumber} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-semibold">{b.bookingNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.customer?.firstName || ''} {b.customer?.lastName || ''} &middot; <span className="font-mono">{b.unit?.unitCode || b.unitId}</span></p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold">AED {Number(b.netPrice || 0).toLocaleString()}</p>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/bookings" className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-medium text-primary hover:bg-primary/5 border-t border-border/30 transition-colors">
              {t('dashboard.view_all')} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Collections Summary */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <h3 className="font-semibold flex items-center gap-2.5 text-[15px]"><Receipt className="h-4 w-4 text-primary" /> {t('dashboard.collection_summary')}</h3>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">Feb 2026</span>
            </div>
            <div className="p-5 space-y-5">
              {[
                { label: 'Total Collected', value: `AED ${totalCollected.toLocaleString()}`, pct: Math.round((totalCollected / collectionTarget) * 100), color: 'from-blue-500 to-indigo-500' },
                { label: 'Total Receipts', value: `${receipts.length} receipts`, pct: 100, color: 'from-emerald-500 to-teal-500' },
                { label: 'Pending', value: `AED ${totalPending.toLocaleString()}`, pct: Math.round((totalPending / collectionTarget) * 100), color: 'from-amber-500 to-orange-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground text-[13px]">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Status Distribution */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
              <h3 className="font-semibold flex items-center gap-2.5 text-[15px]"><Home className="h-4 w-4 text-primary" /> {t('dashboard.unit_status')}</h3>
            </div>
            <div className="p-5 space-y-4">
              {unitStatuses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No units found</p>
              ) : unitStatuses.map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <div className="w-24 shrink-0"><StatusBadge status={s.status} /></div>
                  <div className="flex-1 h-2.5 rounded-full bg-muted/60 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sales Agents */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
              <h3 className="font-semibold flex items-center gap-2.5 text-[15px]"><Users className="h-4 w-4 text-primary" /> {t('dashboard.top_agents')}</h3>
            </div>
            <div className="divide-y divide-border/30">
              {topAgents.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No bookings yet</div>
              ) : topAgents.map((a, idx) => (
                <div key={a.name} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0 ${colors[idx % colors.length]}`}>
                    {a.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-[11px] text-muted-foreground">{a.deals} deals closed</p>
                  </div>
                  <span className="text-sm font-bold gradient-text">AED {(a.value / 1_000_000).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
              <h3 className="font-semibold flex items-center gap-2.5 text-[15px]"><Sparkles className="h-4 w-4 text-primary" /> {t('dashboard.quick_actions')}</h3>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: t('dashboard.new_booking'), href: '/bookings', icon: FileText },
                { label: t('receipts.add'), href: '/receipts', icon: Receipt },
                { label: t('leads.add'), href: '/leads', icon: Users },
                { label: t('contracts.add'), href: '/contracts', icon: TrendingUp },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.href}
                    className="flex items-center gap-3 w-full rounded-xl border border-border/40 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted/40 hover:border-border hover:shadow-soft group"
                  >
                    <div className="rounded-lg bg-primary/10 p-1.5 group-hover:bg-primary/15 transition-colors">
                      <ActionIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {action.label}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 ml-auto opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <h3 className="font-semibold flex items-center gap-2.5 text-[15px]"><Clock className="h-4 w-4 text-primary" /> Recent Activity</h3>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">Last 48 hours</span>
          </div>
          <div className="divide-y divide-border/30">
            {recentActivity.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No recent activity</div>
            ) : recentActivity.map((item: any, i: number) => (
              <div key={item.id || i} className="px-5 py-3.5 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                <div className={`mt-0.5 h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${colors[i % colors.length]}`}>
                  {(item.type || 'SY').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{item.title}</span>
                    <StatusBadge status={item.type} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.message}</p>
                </div>
                <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap shrink-0 mt-0.5">{item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
