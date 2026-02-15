import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="relative inline-block mb-6">
          <span className="text-[120px] sm:text-[150px] font-black gradient-text leading-none">404</span>
          <div className="absolute inset-0 blur-3xl opacity-20 gradient-primary rounded-full" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('not_found.title')}</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
          {t('not_found.description')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> {t('not_found.go_back')}
          </button>
          <Link to="/dashboard" className="btn-primary">
            <Home className="h-4 w-4" /> {t('not_found.dashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}
