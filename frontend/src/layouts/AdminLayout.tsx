import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, Building2, Home, Users, FileText, Receipt,
  BookOpen, DollarSign, Package, HardHat, ClipboardCheck, UserCog,
  LogOut, Menu, Wrench, UserCheck, Warehouse, Settings, X, Search,
  ChevronsLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CommandPalette } from '@/components/ui/command-palette';
import { NotificationBell } from '@/components/ui/notification-bell';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useTranslation } from 'react-i18next';

const navGroups = [
  {
    titleKey: 'nav.core',
    items: [
      { labelKey: 'nav.dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { labelKey: 'nav.projects', icon: Building2, href: '/projects' },
      { labelKey: 'nav.units', icon: Home, href: '/units' },
    ],
  },
  {
    titleKey: 'nav.sales_crm',
    items: [
      { labelKey: 'nav.leads', icon: Users, href: '/leads' },
      { labelKey: 'nav.customers', icon: Users, href: '/customers' },
      { labelKey: 'nav.bookings', icon: FileText, href: '/bookings' },
      { labelKey: 'nav.contracts', icon: FileText, href: '/contracts' },
      { labelKey: 'nav.brokers', icon: UserCheck, href: '/brokers' },
    ],
  },
  {
    titleKey: 'nav.finance',
    items: [
      { labelKey: 'nav.receipts', icon: Receipt, href: '/receipts' },
      { labelKey: 'nav.coa', icon: BookOpen, href: '/accounting/coa' },
      { labelKey: 'nav.journals', icon: DollarSign, href: '/accounting/journals' },
    ],
  },
  {
    titleKey: 'nav.operations',
    items: [
      { labelKey: 'nav.maintenance', icon: Wrench, href: '/maintenance' },
      { labelKey: 'nav.inventory', icon: Warehouse, href: '/inventory' },
      { labelKey: 'nav.procurement', icon: Package, href: '/procurement' },
      { labelKey: 'nav.contractors', icon: HardHat, href: '/contractors' },
      { labelKey: 'nav.handover', icon: ClipboardCheck, href: '/handover' },
    ],
  },
  {
    titleKey: 'nav.hr',
    items: [
      { labelKey: 'nav.employees', icon: UserCog, href: '/hr/employees' },
      { labelKey: 'nav.payroll', icon: DollarSign, href: '/hr/payroll' },
    ],
  },
  {
    titleKey: 'nav.system',
    items: [
      { labelKey: 'nav.settings', icon: Settings, href: '/settings' },
    ],
  },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-sidebar text-sidebar-foreground flex flex-col shrink-0 transition-all duration-300 ease-in-out
        ${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-[264px] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : sidebarOpen ? 'w-[256px]' : 'w-[68px]'
        }
      `}>
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 h-[60px] shrink-0 border-b border-white/[0.06]">
          {sidebarOpen ? (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shrink-0 shadow-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-[15px] tracking-tight block text-white">{t('app.name')}</span>
                <span className="text-[10px] text-sidebar-foreground/35 font-medium tracking-wide">{t('app.tagline')}</span>
              </div>
              {!isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-sidebar-foreground/30 hover:text-sidebar-foreground/60 transition-colors">
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              )}
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.08]">
                  <X className="h-5 w-5 text-sidebar-foreground/60" />
                </button>
              )}
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto p-2 rounded-lg hover:bg-white/[0.08] transition-colors">
              <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-0.5">
          {navGroups.map((group) => (
            <div key={group.titleKey} className="mb-1.5">
              {sidebarOpen && (
                <div className="px-3 pt-4 pb-2 text-[10px] uppercase tracking-[0.12em] text-sidebar-foreground/25 font-semibold">
                  {t(group.titleKey)}
                </div>
              )}
              {!sidebarOpen && group.titleKey !== 'nav.core' && (
                <div className="my-3 mx-3 border-t border-white/[0.04]" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      title={!sidebarOpen ? t(item.labelKey) : undefined}
                      className={`
                        group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200
                        ${active
                          ? 'bg-white/[0.1] text-white'
                          : 'text-sidebar-foreground/50 hover:bg-white/[0.05] hover:text-sidebar-foreground/80'
                        }
                        ${!sidebarOpen ? 'justify-center px-0' : ''}
                      `}
                    >
                      {active && sidebarOpen && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
                      )}
                      <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? 'text-primary-foreground' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70'}`} />
                      {sidebarOpen && <span className="truncate">{t(item.labelKey)}</span>}
                      {active && !sidebarOpen && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade card (collapsed = hidden) */}
        {sidebarOpen && (
          <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span className="text-xs font-semibold text-white/90">Enterprise</span>
            </div>
            <p className="text-[11px] text-sidebar-foreground/40 leading-relaxed">Full access to all modules and premium features.</p>
          </div>
        )}

        {/* Bottom user section */}
        <div className="border-t border-white/[0.06] p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3 hover:bg-white/[0.06] transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-[11px] font-bold text-white shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold truncate text-white/90">{user?.firstName} {user?.lastName}</div>
                <div className="text-[11px] text-sidebar-foreground/35 truncate">{user?.email}</div>
              </div>
              <button onClick={logout} title="Logout" className="p-2 rounded-lg hover:bg-white/[0.08] text-sidebar-foreground/30 hover:text-red-400 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-[11px] font-bold text-white shadow-sm">
                {initials}
              </div>
              <button onClick={logout} title="Logout" className="p-1.5 rounded-lg hover:bg-white/[0.08] text-sidebar-foreground/30 hover:text-red-400 transition-colors">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 lg:px-6 h-[60px]">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="hidden sm:flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground/70 hover:bg-muted/60 hover:border-border/70 hover:text-muted-foreground transition-all duration-200 min-w-[240px]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t('common.search_anything')}</span>
              <kbd className="ml-auto rounded-md border border-border/40 bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/50">Ctrl K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <NotificationBell />
            <ThemeToggle compact />
          </div>
        </div>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
