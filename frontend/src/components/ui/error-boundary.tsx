import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="text-center max-w-md animate-fade-in">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-1">
              An unexpected error occurred. Please try again.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/60 font-mono mb-5 break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
