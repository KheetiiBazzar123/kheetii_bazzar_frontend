'use client';

import React, { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize i18n on client-side
    const initLanguage = async () => {
      const savedLang = localStorage.getItem('language') || 'en';
      if (i18n.language !== savedLang) {
        await i18n.changeLanguage(savedLang);
      }
      setIsInitialized(true);
    };

    initLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Re-export useTranslation hook for convenience
export { useTranslation } from 'react-i18next';
