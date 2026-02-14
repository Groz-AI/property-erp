import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const toggle = () => {
    i18n.changeLanguage(isArabic ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggle}
      title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
      className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 border border-border/60"
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{isArabic ? 'EN' : 'AR'}</span>
    </button>
  );
}
