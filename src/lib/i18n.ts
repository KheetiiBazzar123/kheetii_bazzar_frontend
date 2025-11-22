import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import bnTranslations from './locales/bn.json';
import mrTranslations from './locales/mr.json';

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  bn: { translation: bnTranslations },
  mr: { translation: mrTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' 
      ? localStorage.getItem('language') || 'en' 
      : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
};

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];
