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
      <aside className="w-[260px] bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="flex items-center gap-3 px-4 h-16 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-base tracking-tight block">Platform Admin</span>
            <span className="text-[10px] text-sidebar-foreground/40 font-medium">realestater.grozai.net</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 mb-0.5
                  ${active
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-sidebar-foreground/60 hover:bg-white/[0.06] hover:text-sidebar-foreground'
                  }
                `}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
                )}
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-white' : 'text-sidebar-foreground/50'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-[11px] font-bold text-white shrink-0">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 h-14">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-semibold text-muted-foreground">Super Admin</span>
          </div>
          <div className="flex items-center gap-1">
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
