import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, Building2, LogOut, Shield,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/platform' },
  { label: 'Tenants', icon: Building2, href: '/platform/tenants' },
];

export function PlatformLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[256px] bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="flex items-center gap-3 px-5 h-[60px] shrink-0 border-b border-white/[0.06]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shrink-0 shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-[15px] tracking-tight block text-white">Platform Admin</span>
            <span className="text-[10px] text-sidebar-foreground/35 font-medium tracking-wide">property.grozai.net</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200
                    ${active
                      ? 'bg-white/[0.1] text-white'
                      : 'text-sidebar-foreground/50 hover:bg-white/[0.05] hover:text-sidebar-foreground/80'
                    }
                  `}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-rose-500 to-orange-500" />
                  )}
                  <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? 'text-white' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3 hover:bg-white/[0.06] transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-[11px] font-bold text-white shrink-0 shadow-sm">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-6 h-[60px]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10">
              <Shield className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Super Admin Console</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle compact />
          </div>
        </div>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
