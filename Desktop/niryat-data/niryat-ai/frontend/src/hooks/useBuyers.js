import { useState, useCallback } from 'react'
import { fetchBuyerLeads } from '../api/buyers'

export function useBuyers() {
  const [leads, setLeads] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (country, product, email) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBuyerLeads(country, product, email)
      setLeads(data)
    } catch (err) {
      setError(err.message)
      setLeads(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { leads, loading, error, search }
}
