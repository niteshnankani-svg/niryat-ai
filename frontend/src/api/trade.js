import { apiGet, apiPost } from './client'

export const getProducts = () => apiGet('/products')
export const getComtrade = () => apiGet('/comtrade')
export const getIntel = (hsCode) => apiGet(`/intel/${hsCode}`)

export const fetchTradeData = ({ hs_code, year = '2023-2024', trade_type = 'export' }) =>
  apiPost('/tradedata', { hs_code, year, trade_type })
