import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/shared/SearchBar'
import KPICard from '../components/shared/KPICard'
import TradeTable from '../components/Trade/TradeTable'
import ComparisonTable from '../components/Trade/ComparisonTable'
import { useProducts, useComtrade } from '../hooks/useProducts'

const PAGE_SIZE = 30

export default function TradeData() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [view, setView] = useState('india') // 'india' | 'world'
  const [visible, setVisible] = useState(PAGE_SIZE)

  const { products, loading: pLoading } = useProducts()
  const { comtrade, loading: cLoading } = useComtrade()

  useEffect(() => { setVisible(PAGE_SIZE) }, [query, view])

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter((p) => p.commodity?.toLowerCase().includes(q) || p.hs_code?.includes(q))
  }, [products, query])

  const filteredComtrade = useMemo(() => {
    if (!query.trim()) return comtrade
    const q = query.toLowerCase()
    return comtrade.filter((p) => p.commodity?.toLowerCase().includes(q) || p.hs_code?.includes(q))
  }, [comtrade, query])

  const totalWorld = filteredComtrade.reduce((s, p) => s + (p.world_imports_usd_m || 0), 0)
  const totalIndia = filteredComtrade.reduce((s, p) => s + (p.india_exports_usd_m || 0), 0)
  const avgShare = filteredComtrade.length
    ? filteredComtrade.reduce((s, p) => s + (p.india_share_pct || 0), 0) / filteredComtrade.length
    : 0

  const rows = view === 'india' ? filteredProducts : filteredComtrade
  const loading = view === 'india' ? pLoading : cLoading

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Trade Data</h1>
      <p className="text-sm text-[#94A3B8] mb-5">DGFT export statistics and Comtrade world-market comparisons.</p>

      <div className="flex items-center gap-3 mb-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by product or HS code..." className="max-w-sm" />
        <div className="flex bg-[#181B24] border border-white/[.06] rounded-[10px] p-1">
          <button
            onClick={() => setView('india')}
            className={`px-3.5 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${view === 'india' ? 'bg-[#F59E0B] text-white' : 'text-[#94A3B8]'}`}
          >
            India Exports
          </button>
          <button
            onClick={() => setView('world')}
            className={`px-3.5 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${view === 'world' ? 'bg-[#F59E0B] text-white' : 'text-[#94A3B8]'}`}
          >
            World Comparison
          </button>
        </div>
      </div>

      {view === 'world' && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          <KPICard icon="🌍" label="Total World Imports" value={`$${totalWorld.toLocaleString()}M`} />
          <KPICard icon="🇮🇳" label="India's Exports" value={`$${totalIndia.toLocaleString()}M`} />
          <KPICard icon="📊" label="Avg India Share" value={`${avgShare.toFixed(1)}%`} />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#64748B]">No products match "{query}".</p>
      ) : (
        <>
          {view === 'india'
            ? <TradeTable rows={rows.slice(0, visible)} />
            : <ComparisonTable rows={rows.slice(0, visible)} />}
          {visible < rows.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 mx-auto block px-4 py-2 rounded-[10px] bg-white/[.05] border border-white/[.08] text-sm text-[#CBD5E1] hover:bg-white/[.08] transition-colors"
            >
              Load more ({rows.length - visible} remaining)
            </button>
          )}
        </>
      )}
    </div>
  )
}
