import React, { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext({ language: 'fr', setLanguage: () => {} });

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr'); // défaut sûr
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
