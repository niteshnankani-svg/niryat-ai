import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/shared/SearchBar'
import KPICard from '../components/shared/KPICard'
import TradeTable from '../components/Trade/TradeTable'
import ComparisonTable from '../components/Trade/ComparisonTable'
import PageHeader from '../components/shared/PageHeader'
import { Reveal, Stagger } from '../components/motion/Motion'
import Icon from '../lib/icons'
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

  const TABS = [
    { id: 'india', label: 'India Exports', icon: 'flag' },
    { id: 'world', label: 'World Comparison', icon: 'buyers' },
  ]

  return (
    <div>
      <PageHeader
        icon="trade"
        title="Trade Data"
        subtitle="DGFT export statistics and Comtrade world-market comparisons."
      />

      <Reveal delay={0.05} className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by product or HS code..." className="max-w-sm flex-1" />
        <div className="flex bg-[#181B24] border border-white/[.06] rounded-[10px] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${
                view === t.id ? 'bg-[#F59E0B] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <Icon name={t.icon} className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {view === 'world' && (
        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Stagger.Item><KPICard icon="buyers" tint="blue" label="Total World Imports" value={`$${totalWorld.toLocaleString()}M`} /></Stagger.Item>
          <Stagger.Item><KPICard icon="flag" tint="amber" label="India's Exports" value={`$${totalIndia.toLocaleString()}M`} /></Stagger.Item>
          <Stagger.Item><KPICard icon="chart" tint="green" label="Avg India Share" value={`${avgShare.toFixed(1)}%`} /></Stagger.Item>
        </Stagger>
      )}

      {loading ? (
        <div className="card p-4 flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-9 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-12 text-center">
          <Icon name="search" className="w-7 h-7 text-[#64748B]" />
          <p className="text-sm text-[#94A3B8]">{query ? `No products match "${query}".` : 'No trade data available yet.'}</p>
        </div>
      ) : (
        <Reveal delay={0.1}>
          {view === 'india'
            ? <TradeTable rows={rows.slice(0, visible)} />
            : <ComparisonTable rows={rows.slice(0, visible)} />}
          {visible < rows.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 mx-auto block px-4 py-2 rounded-[10px] bg-white/[.05] border border-white/[.08] text-sm text-[#CBD5E1] hover:bg-white/[.08] hover:border-[#F59E0B]/30 transition-colors"
            >
              Load more ({rows.length - visible} remaining)
            </button>
          )}
        </Reveal>
      )}
    </div>
  )
}
