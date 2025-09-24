import React, { createContext, useContext, useMemo } from 'react'

export const SubscriptionContext = createContext({
  tier: 'free',
  status: 'inactive',
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
export default SubscriptionContext
