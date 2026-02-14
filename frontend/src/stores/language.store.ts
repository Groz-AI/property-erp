import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageState {
  language: Language;
  direction: Direction;
  setLanguage: (language: Language) => void;
}

function applyLanguage(lang: Language) {
  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
  document.body.style.fontFamily = lang === 'ar'
    ? '"Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif'
    : '"Inter", "Segoe UI", system-ui, sans-serif';
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      direction: 'ltr',
      setLanguage: (language) => {
        const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
        applyLanguage(language);
        set({ language, direction });
      },
    }),
    {
      name: 'erp-language',
      onRehydrateStorage: () => (state) => {
        if (state) applyLanguage(state.language);
      },
    },
  ),
);
