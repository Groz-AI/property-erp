import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/theme.store';

const themes = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useThemeStore();

  if (compact) {
    const current = themes.find((t) => t.value === theme) || themes[0];
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    const Icon = current.icon;
    return (
      <button
        onClick={() => setTheme(next.value)}
        title={`Switch to ${next.label} theme`}
        className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/30 p-0.5">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`rounded-lg p-1.5 transition-all duration-200 ${
            theme === value
              ? 'bg-background text-foreground shadow-soft'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
