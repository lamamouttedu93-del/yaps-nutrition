// src/contexts/LanguageContext.jsx
// Stub minimal pour satisfaire l'import depuis App.jsx sans changer le design.
// Tu pourras brancher ta vraie logique de langue plus tard.

import React, { createContext, useContext, useMemo } from 'react'

const LanguageContext = createContext({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key, // fonction de traduction basique: renvoie la clé telle quelle
})

export const LanguageProvider = ({ children }) => {
  const value = useMemo(() => ({
    lang: 'fr',
    setLang: () => {},
    t: (key) => key,
  }), [])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
export default LanguageContext
