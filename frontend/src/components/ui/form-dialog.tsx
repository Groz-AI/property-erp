import { X, Loader2 } from 'lucide-react';

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card border border-border/60 shadow-soft-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in-scale">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="px-6 py-5 space-y-4">
            {children}
          </div>
          {onSubmit && (
            <div className="flex items-center justify-end gap-3 border-t border-border/50 px-6 py-4 bg-muted/20">
              <button type="button" onClick={onClose} className="rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow disabled:opacity-50 transition-all duration-200 flex items-center gap-2">
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
      <label className="block text-[13px] font-medium text-foreground/80 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 ${props.className || ''}`}
    />
  );
}

export function FormSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 ${props.className || ''}`}
    >
      {children}
    </select>
  );
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 resize-none ${props.className || ''}`}
    />
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}
