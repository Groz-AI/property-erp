import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, Building2, Home, Users, FileText, Receipt,
  BookOpen, DollarSign, Package, HardHat, ClipboardCheck, UserCog,
  LogOut, Menu, Wrench, UserCheck, Warehouse, Settings, X, Search,
  ChevronsLeft, ChevronRight,
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
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-sidebar text-sidebar-foreground flex flex-col shrink-0 transition-all duration-300 ease-in-out
        ${isMobile ? `fixed inset-y-0 left-0 z-50 w-[260px] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` : sidebarOpen ? 'w-[260px]' : 'w-[68px]'}
      `}>
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shrink-0">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-base tracking-tight block">{t('app.name')}</span>
                <span className="text-[10px] text-sidebar-foreground/40 font-medium">{t('app.tagline')}</span>
              </div>
              {!isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-white/10 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors">
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              )}
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              )}
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto p-1.5 rounded-md hover:bg-white/10 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => (
            <div key={group.titleKey} className="mb-1">
              {sidebarOpen && (
                <div className="px-3 pt-5 pb-1.5 text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/30 font-semibold">
                  {t(group.titleKey)}
                </div>
              )}
              {!sidebarOpen && group.titleKey !== 'nav.core' && (
                <div className="my-2 mx-2 border-t border-white/5" />
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    title={!sidebarOpen ? t(item.labelKey) : undefined}
                    className={`
                      group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200
                      ${active
                        ? 'bg-white/[0.12] text-white shadow-sm'
                        : 'text-sidebar-foreground/60 hover:bg-white/[0.06] hover:text-sidebar-foreground'
                      }
                      ${!sidebarOpen ? 'justify-center px-0' : ''}
                    `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full gradient-primary" />
                    )}
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-white' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'}`} />
                    {sidebarOpen && <span className="truncate">{t(item.labelKey)}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom user section */}
        <div className="border-t border-white/[0.06] p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-[11px] font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-sidebar-foreground/40 truncate">{user?.email}</div>
              </div>
              <button onClick={logout} title="Logout" className="p-1.5 rounded-md hover:bg-white/10 text-sidebar-foreground/40 hover:text-red-400 transition-colors">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-[11px] font-bold text-white">
                {initials}
              </div>
              <button onClick={logout} title="Logout" className="p-1.5 rounded-md hover:bg-white/10 text-sidebar-foreground/40 hover:text-red-400 transition-colors">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6 h-14">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="hidden sm:flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground hover:bg-muted/80 hover:border-border transition-all duration-200 min-w-[220px]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t('common.search_anything')}</span>
              <kbd className="ml-auto rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/70">Ctrl K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-1">
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
