export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ar'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

// A simple client-side translation dictionary for now
export const translations = {
  en: {
    dashboard: 'Dashboard',
    videos: 'Videos',
    words: 'Words',
    logout: 'Logout',
    welcomeBack: 'Welcome back',
    totalWords: 'Total Words',
    totalVideos: 'Total Videos',
    categories: 'Categories',
  },
  ar: {
    dashboard: 'لوحة القيادة',
    videos: 'الفيديوهات',
    words: 'الكلمات',
    logout: 'تسجيل الخروج',
    welcomeBack: 'مرحباً بعودتك',
    totalWords: 'إجمالي الكلمات',
    totalVideos: 'إجمالي الفيديوهات',
    categories: 'الأقسام',
  }
};

export function useTranslation(locale: Locale = 'en') {
  return {
    t: (key: keyof typeof translations['en']) => translations[locale][key] || key,
    locale,
  };
}
