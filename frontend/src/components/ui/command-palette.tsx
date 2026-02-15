import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Building2, Home, Users, FileText, Receipt,
  BookOpen, DollarSign, Package, HardHat, ClipboardCheck, UserCog,
  Wrench, UserCheck, Warehouse, Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const commandDefs = [
  { labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.projects', href: '/projects', icon: Building2 },
  { labelKey: 'nav.units', href: '/units', icon: Home },
  { labelKey: 'nav.leads', href: '/leads', icon: Users },
  { labelKey: 'nav.customers', href: '/customers', icon: Users },
  { labelKey: 'nav.bookings', href: '/bookings', icon: FileText },
  { labelKey: 'nav.contracts', href: '/contracts', icon: FileText },
  { labelKey: 'nav.receipts', href: '/receipts', icon: Receipt },
  { labelKey: 'nav.coa', href: '/accounting/coa', icon: BookOpen },
  { labelKey: 'nav.journals', href: '/accounting/journals', icon: DollarSign },
  { labelKey: 'nav.employees', href: '/hr/employees', icon: UserCog },
  { labelKey: 'nav.payroll', href: '/hr/payroll', icon: DollarSign },
  { labelKey: 'nav.maintenance', href: '/maintenance', icon: Wrench },
  { labelKey: 'nav.brokers', href: '/brokers', icon: UserCheck },
  { labelKey: 'nav.inventory', href: '/inventory', icon: Warehouse },
  { labelKey: 'nav.procurement', href: '/procurement', icon: Package },
  { labelKey: 'nav.contractors', href: '/contractors', icon: HardHat },
  { labelKey: 'nav.handover', href: '/handover', icon: ClipboardCheck },
  { labelKey: 'nav.settings', href: '/settings', icon: Settings },
];

export function CommandPalette() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands = commandDefs.map((c) => ({ ...c, label: t(c.labelKey) }));
  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const execute = (index: number) => {
    const cmd = filtered[index];
    if (cmd) {
      navigate(cmd.href);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(selectedIndex);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-soft-lg mx-4 overflow-hidden animate-fade-in-scale">
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-4">
          <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('common.search_pages')}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/50">
            ESC
          </kbd>
        </div>
        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground/60">{t('common.no_results')}</div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.href}
                  onClick={() => execute(i)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    i === selectedIndex ? 'bg-primary/8 text-primary font-medium' : 'text-foreground/80 hover:bg-muted/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${i === selectedIndex ? 'text-primary' : 'text-muted-foreground/40'}`} />
                  <span>{cmd.label}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="border-t border-border/30 px-4 py-2.5 flex items-center gap-4 text-[10px] text-muted-foreground/40 bg-muted/10">
          <span className="flex items-center gap-1"><kbd className="rounded-md border border-border/30 bg-background/50 px-1 py-0.5 font-mono">↑↓</kbd> {t('common.navigate')}</span>
          <span className="flex items-center gap-1"><kbd className="rounded-md border border-border/30 bg-background/50 px-1 py-0.5 font-mono">↵</kbd> {t('common.open')}</span>
          <span className="flex items-center gap-1"><kbd className="rounded-md border border-border/30 bg-background/50 px-1 py-0.5 font-mono">Esc</kbd> {t('common.close')}</span>
        </div>
      </div>
    </div>
  );
}
