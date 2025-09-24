// contexts/SupabaseAuthContext.jsx
// Stub minimal pour satisfaire l'import "/contexts/SupabaseAuthContext".
// Il n'active pas Supabase (aucun appel réseau) : il expose juste une API vide
// pour permettre au build Netlify de passer.

import React, { createContext, useContext, useMemo } from 'react'

const SupabaseAuthContext = createContext({
  user: null,
  session: null,
  signIn: async () => ({ user: null }),
  signOut: async () => {},
  refreshSession: async () => ({ session: null }),
})

export const SupabaseAuthProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      user: null,
      session: null,
      signIn: async () => ({ user: null }),
      signOut: async () => {},
      refreshSession: async () => ({ session: null }),
    }),
    []
  )

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export const useSupabaseAuth = () => useContext(SupabaseAuthContext)
export default SupabaseAuthContext
