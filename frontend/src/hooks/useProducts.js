import { useState, useEffect } from 'react'
import { getProducts, getComtrade } from '../api/trade'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getProducts()
      .then((data) => { if (!cancelled) setProducts(data) })
      .catch((err) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { products, loading, error }
}

export function useComtrade() {
  const [comtrade, setComtrade] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getComtrade()
      .then((data) => { if (!cancelled) setComtrade(data) })
      .catch((err) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { comtrade, loading, error }
}
