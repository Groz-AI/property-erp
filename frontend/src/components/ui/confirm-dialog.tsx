import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const iconBg = variant === 'danger' ? 'bg-red-100 dark:bg-red-500/10' : 'bg-amber-100 dark:bg-amber-500/10';
  const iconColor = variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400';
  const btnClass = variant === 'danger'
    ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
    : 'bg-amber-500 text-white hover:bg-amber-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card border border-border/60 shadow-soft-lg mx-4 p-6 animate-fade-in-scale">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
            <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${btnClass}`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
