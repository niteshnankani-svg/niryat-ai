import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getCreditsBalance, deductCredits, purchaseCredits, applyPromo } from '../api/credits'

const CreditsContext = createContext(null)

const GUEST_EMAIL_KEY = 'niryatai_guest_id'

function getGuestEmail() {
  let id = localStorage.getItem(GUEST_EMAIL_KEY)
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2)}@niryatai.local`
    localStorage.setItem(GUEST_EMAIL_KEY, id)
  }
  return id
}

export function CreditsProvider({ children }) {
  const { user } = useAuth()
  const email = user?.email || getGuestEmail()
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCreditsBalance(email)
      setBalance(data.balance)
      setHistory(data.history || [])
    } catch {
      setBalance((b) => (b == null ? 0 : b))
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => { refresh() }, [refresh])

  const deduct = useCallback(async (amount, reason) => {
    try {
      const result = await deductCredits(email, amount, reason)
      setBalance(result.balance)
      return true
    } catch {
      return false
    }
  }, [email])

  const purchase = useCallback(async (tier, paymentId) => {
    const result = await purchaseCredits(email, tier, paymentId)
    await refresh()
    return result
  }, [email, refresh])

  const redeemPromo = useCallback(async (code) => {
    const result = await applyPromo(email, code)
    await refresh()
    return result
  }, [email, refresh])

  return (
    <CreditsContext.Provider value={{ email, balance, history, loading, deduct, purchase, redeemPromo, refresh }}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const ctx = useContext(CreditsContext)
  if (!ctx) throw new Error('useCredits must be used within CreditsProvider')
  return ctx
}
