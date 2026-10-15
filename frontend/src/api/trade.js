import { apiPost } from './client'

// Trade data served from static snapshots in public/data/ instead of the
// live backend. Generated from backend/products.json + backend/trade_intel.py's
// merge logic (same CSVs, same output shape) — see the script used to build
// them. This is a stopgap while the Railway backend is down: it keeps the
// Trade Data / product pages working off whatever was last committed to git,
// but it's a point-in-time snapshot, not live data — it won't reflect any
// DGFT/Comtrade updates until someone regenerates and redeploys it.

async function fetchStatic(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export const getProducts = () => fetchStatic('/data/products.json')
export const getComtrade = () => fetchStatic('/data/comtrade.json')

export const getIntel = async (hsCode) => {
  const intel = await fetchStatic('/data/intel.json')
  const key = String(hsCode).slice(0, 4).padStart(4, '0')
  const entry = intel[key]
  if (!entry) throw new Error(`No intel for HS ${hsCode}`)
  return entry
}

export const fetchTradeData = ({ hs_code, year = '2023-2024', trade_type = 'export' }) =>
  apiPost('/tradedata', { hs_code, year, trade_type })
