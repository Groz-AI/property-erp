import { X, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
}

export function FormDialog({ open, onClose, title, children, onSubmit, submitLabel = 'Save', loading = false }: FormDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card border border-border/50 shadow-soft-lg max-h-[85vh] flex flex-col animate-fade-in-scale">
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 shrink-0">
          <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-muted transition-colors text-muted-foreground/60 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col min-h-0">
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            {children}
          </div>
          {onSubmit && (
            <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4 bg-muted/10 shrink-0">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? 'Saving...' : submitLabel}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-foreground/70 mb-2">
        {label} {required && <span className="text-red-500/80">*</span>}
      </label>
      {children}
    </div>
  );
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`input-field ${props.className || ''}`}
    />
  );
}

export function FormSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`input-field ${props.className || ''}`}
    >
      {children}
    </select>
  );
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`input-field resize-none ${props.className || ''}`}
    />
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
