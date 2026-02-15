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
      <div className={`relative overflow-hidden rounded-2xl gradient-primary p-6 text-white shadow-lg shadow-primary/20 ${className}`}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/[0.08]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/[0.05]" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-white/60">{title}</p>
              <p className="text-3xl font-bold tracking-tight leading-none">{value}</p>
              {subtitle && <p className="text-[12px] text-white/50 mt-1">{subtitle}</p>}
            </div>
            <div className="rounded-xl bg-white/[0.12] p-2.5 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white/80" />
            </div>
          </div>
          {trend && (
            <div className="mt-4 flex items-center gap-1.5 text-[12px]">
              <div className="flex items-center gap-1 rounded-full bg-white/[0.12] px-2 py-0.5 font-semibold">
                {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend.value)}%
              </div>
              <span className="text-white/50">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover:shadow-soft-md hover:border-border/80 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
          <p className="text-[26px] font-bold tracking-tight leading-none">{value}</p>
          {subtitle && <p className="text-[12px] text-muted-foreground/70 mt-1">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-primary/8 p-2.5 group-hover:bg-primary/12 transition-colors duration-300">
          <Icon className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors duration-300" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-[12px]">
          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${trend.value >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
            {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </div>
          <span className="text-muted-foreground/60">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
