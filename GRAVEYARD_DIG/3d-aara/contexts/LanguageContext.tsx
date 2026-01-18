import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { translations } from '../lib/translations';

type Locale = 'ar' | 'en';
type Translations = typeof translations.ar;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('ar');

  const t = useCallback((key: keyof Translations, replacements: { [key: string]: string | number } = {}) => {
    let translation = translations[locale][key] || translations['en'][key] || String(key);
    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      translation = translation.replace(regex, String(replacements[placeholder]));
    });
    return translation;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
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
