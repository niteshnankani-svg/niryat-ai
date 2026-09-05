import { apiPost } from './client'

export const fetchBuyerLeads = (country, product, userEmail) =>
  apiPost('/buyerleads', { country, product: product || '', user_email: userEmail || '' })
