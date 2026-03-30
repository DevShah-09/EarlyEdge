/**
 * CONTEXT: AuthContext
 * Purpose: Global auth state using Supabase Auth.
 * Provides: { user, loading, signIn, signOut }
 * Used by: ProtectedRoute, Navbar, all pages needing user info
 */
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: '1', email: 'dr.julian@hospital.com', user_metadata: { full_name: 'Dr. Julian' } })
  const [loading, setLoading] = useState(false)

  // Mocking auth behavior
  useEffect(() => {
    // Initial load: user already set to mock
    setLoading(false)
  }, [])

  const signIn = async (email, password) => {
    // Basic mock sign in
    setUser({ id: '1', email, user_metadata: { full_name: 'Dr. Julian' } })
    return { user: { id: '1' } }
  }

  const signOut = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
