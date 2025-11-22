'use client';

import React, { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize i18n
    // Language is already loaded from localStorage in i18n.ts
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

// Re-export useTranslation hook for convenience
export { useTranslation } from 'react-i18next';
