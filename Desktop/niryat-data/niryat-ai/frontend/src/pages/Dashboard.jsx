import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProducts, useComtrade } from '../hooks/useProducts'
import KPICard from '../components/shared/KPICard'
import Badge, { signalVariant } from '../components/shared/Badge'

const QUICK_ACTIONS = [
  { to: '/trade', icon: '📈', label: 'Explore Trade Data', desc: 'World imports vs India exports' },
  { to: '/buyers', icon: '🌍', label: 'Find Buyers', desc: '41 countries of verified leads' },
  { to: '/guide', icon: '🚀', label: 'Getting Started', desc: 'Your export launch checklist' },
  { to: '/schemes', icon: '🏛️', label: 'Govt Schemes', desc: 'RoDTEP, Drawback & more' },
]

function BarRow({ label, value, max }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 3) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 shrink-0 text-sm text-[#CBD5E1] truncate" title={label}>{label}</div>
      <div className="flex-1 h-6 bg-white/[.04] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-20 shrink-0 text-right text-sm font-mono text-[#F1F5F9]">${value.toFixed(0)}M</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { products, loading: pLoading } = useProducts()
  const { comtrade, loading: cLoading } = useComtrade()

  const topExports = [...products]
    .filter((p) => p.export_usd_2024 != null)
    .sort((a, b) => b.export_usd_2024 - a.export_usd_2024)
    .slice(0, 8)
  const maxExport = topExports[0]?.export_usd_2024 || 0

  const topGrowing = [...products]
    .filter((p) => p.yoy_growth_pct != null)
    .sort((a, b) => b.yoy_growth_pct - a.yoy_growth_pct)
    .slice(0, 5)

  const signalCounts = comtrade.reduce((acc, p) => {
    const v = signalVariant(p.signal)
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})

  const topProduct = topExports[0]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">
        {user ? `Welcome back, ${user.name}` : 'Export Intelligence Dashboard'}
      </h1>
      <p className="text-sm text-[#94A3B8] mb-6">A snapshot of India's export opportunity, powered by DGFT + Comtrade data.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon="📦" label="Total Products" value={pLoading ? '—' : products.length.toLocaleString()} />
        <KPICard icon="🌍" label="Buyer Countries" value="41" />
        <KPICard icon="🤝" label="Comtrade Products" value={cLoading ? '—' : comtrade.length} />
        <KPICard icon="🏆" label="Top Export" value={topProduct ? topProduct.commodity : '—'} sub={topProduct ? `$${topProduct.export_usd_2024.toFixed(0)}M` : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5">
          <h2 className="font-semibold text-[#F1F5F9] mb-4">Top Exports (FY24)</h2>
          <div className="flex flex-col gap-3">
            {topExports.map((p) => (
              <BarRow key={p.hs_code} label={p.commodity} value={p.export_usd_2024} max={maxExport} />
            ))}
            {pLoading && <p className="text-sm text-[#64748B]">Loading...</p>}
          </div>
        </div>

        <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5">
          <h2 className="font-semibold text-[#F1F5F9] mb-4">Market Signals</h2>
          <div className="flex flex-col gap-3 mb-5">
            {['strong', 'moderate', 'saturated', 'hard'].map((v) => (
              <div key={v} className="flex items-center justify-between">
                <Badge variant={v}>
                  {{ strong: 'Strong lane', moderate: 'Moderate', saturated: 'Saturated', hard: 'Hard to enter' }[v]}
                </Badge>
                <span className="font-mono text-sm text-[#F1F5F9]">{signalCounts[v] || 0}</span>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-[#F1F5F9] mb-3 mt-6">Top Growing Products</h2>
          <div className="flex flex-col gap-2">
            {topGrowing.map((p) => (
              <div key={p.hs_code} className="flex items-center justify-between text-sm">
                <span className="text-[#CBD5E1] truncate">{p.commodity}</span>
                <span className="font-mono text-[#10B981] shrink-0 ml-2">+{p.yoy_growth_pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-4 hover:border-[#F59E0B]/30 transition-colors flex flex-col gap-1"
          >
            <span className="text-xl">{a.icon}</span>
            <span className="font-semibold text-sm text-[#F1F5F9]">{a.label}</span>
            <span className="text-xs text-[#64748B]">{a.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
