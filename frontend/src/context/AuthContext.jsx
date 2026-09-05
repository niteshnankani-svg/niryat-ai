import { createContext, useContext, useState, useCallback } from 'react'
import { registerUser } from '../api/auth'

/**
 * Mock Google OAuth — no VITE_GOOGLE_CLIENT_ID configured yet.
 * Swapping in real Google Sign-In: replace loginMock's body with the
 * Google Identity Services callback, keep the same setUser() contract.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('niryatai_user')
    return stored ? JSON.parse(stored) : null
  })
  const [showLoginModal, setShowLoginModal] = useState(false)

  const login = useCallback(async ({ name, email }) => {
    const profile = { name, email: email.toLowerCase() }
    localStorage.setItem('niryatai_user', JSON.stringify(profile))
    setUser(profile)
    setShowLoginModal(false)
    try {
      await registerUser(profile.email, profile.name)
    } catch {
      // registration is best-effort; user stays logged in locally either way
    }
    return profile
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('niryatai_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
