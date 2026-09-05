import { apiGet, apiPost } from './client'

export const getCreditsBalance = (email) => apiGet(`/credits/${encodeURIComponent(email)}`)

export const deductCredits = (email, amount, reason) =>
  apiPost('/credits/deduct', { email, amount, reason })

export const purchaseCredits = (email, tier, paymentId) =>
  apiPost('/credits/purchase', { email, tier, payment_id: paymentId })

export const applyPromo = (email, code) =>
  apiPost('/promo/apply', { email, code })
