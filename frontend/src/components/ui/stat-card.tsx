import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  variant?: 'default' | 'gradient';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className = '', variant = 'default' }: StatCardProps) {
  if (variant === 'gradient') {
    return (
      <div className={`relative overflow-hidden rounded-2xl gradient-primary p-6 text-white shadow-soft-md ${className}`}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/70">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
            </div>
            <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {trend && (
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              {trend.value >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span className="font-semibold">{Math.abs(trend.value)}%</span>
              <span className="text-white/60">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-card rounded-2xl border border-border/60 p-6 shadow-soft hover:shadow-soft-md transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-primary/10 p-2.5 group-hover:bg-primary/15 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <div className={`flex items-center gap-1 font-semibold ${trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.value >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(trend.value)}%
          </div>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
