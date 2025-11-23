'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, languages } from '@/lib/i18n';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Sync with localStorage on mount
    const savedLang = localStorage.getItem('language') || 'en';
    if (i18n.language !== savedLang) {
      changeLanguage(savedLang);
    }
    setCurrentLang(savedLang);

    // Listen for language changes
    const handleLanguageChange = (lang: string) => {
      setCurrentLang(lang);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    setCurrentLang(langCode);
    setShowDropdown(false);
    
    // Force a re-render of the page
    window.dispatchEvent(new Event('languagechange'));
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Change language"
      >
        <GlobeAltIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {currentLanguage.nativeName}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLang === language.code
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{language.nativeName}</span>
                  {currentLang === language.code && (
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {language.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
