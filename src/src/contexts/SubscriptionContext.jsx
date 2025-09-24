// src/contexts/SubscriptionContext.jsx
// Stub minimal pour satisfaire les imports depuis App.jsx.
// Ne change pas le design ni le comportement actuel : valeurs par défaut neutres.

import React, { createContext, useContext, useMemo } from 'react'

export const SubscriptionContext = createContext({
  tier: 'free',              // 'free' | 'pro' | 'premium'
  status: 'inactive',        // 'active' | 'past_due' | 'canceled' | 'inactive'
  expiresAt: null,
  setTier: () => {},
  refresh: async () => ({ tier: 'free', status: 'inactive' }),
})

export const SubscriptionProvider = ({ children }) => {
  const value = useMemo(() => ({
    tier: 'free',
    status: 'inactive',
    expiresAt: null,
    setTier: () => {},
    refresh: async () => ({ tier: 'free', status: 'inactive' }),
  }), [])

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)

// Export par défaut au cas où l'import utilise `default`
export default SubscriptionContext
