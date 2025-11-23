'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Prevent hydration mismatch by waiting for client-side initialization
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

// Re-export useTranslation hook for convenience
export { useTranslation } from 'react-i18next';
