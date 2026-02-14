const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  available:        { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  sold:             { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  reserved:         { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  soft_reserved:    { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  blocked:          { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  delivered:        { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' },
  under_maintenance:{ bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  legal_hold:       { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  cancelled:        { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  active:           { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  inactive:         { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  converted:        { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  expired:          { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  draft:            { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  under_review:     { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  signed:           { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  completed:        { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  transferred:      { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
  confirmed:        { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  reversed:         { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  posted:           { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  new:              { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  contacted:        { bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' },
  qualified:        { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' },
  opportunity:      { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  won:              { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  lost:             { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  open:             { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  assigned:         { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  in_progress:      { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  resolved:         { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  closed:           { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  pending:          { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  approved:         { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  rejected:         { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  paid:             { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  overdue:          { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  partially_paid:   { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  upcoming:         { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  due:              { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const fallback = { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' };

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || fallback;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
