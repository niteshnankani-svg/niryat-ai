import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProducts, useComtrade } from '../hooks/useProducts'
import KPICard from '../components/shared/KPICard'
import Badge, { signalVariant } from '../components/shared/Badge'
import Icon from '../lib/icons'
import { Reveal, Stagger, Pressable, BarFill } from '../components/motion/Motion'

const QUICK_ACTIONS = [
  { to: '/trade', icon: 'trade', label: 'Explore Trade Data', desc: 'World imports vs India exports' },
  { to: '/buyers', icon: 'buyers', label: 'Find Buyers', desc: '41 countries of verified leads' },
  { to: '/guide', icon: 'guide', label: 'Getting Started', desc: 'Your export launch checklist' },
  { to: '/schemes', icon: 'schemes', label: 'Govt Schemes', desc: 'RoDTEP, Drawback & more' },
]

function BarRow({ label, value, max, index }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 3) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 shrink-0 text-sm text-[#CBD5E1] truncate" title={label}>{label}</div>
      <div className="flex-1 h-6 bg-white/[.04] rounded-full overflow-hidden">
        <BarFill pct={pct} delay={0.15 + index * 0.06} className="h-full" />
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
      <Reveal className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[.04] border border-white/[.06] text-[11px] text-[#94A3B8] mb-3">
          <Icon name="sparkles" className="w-3.5 h-3.5 text-[#F59E0B]" />
          Live · DGFT + UN Comtrade
        </div>
        <h1 className="text-[28px] leading-tight font-bold text-[#F1F5F9] tracking-tight">
          {user ? <>Welcome back, <span className="text-gradient">{user.name}</span></> : 'Export Intelligence Dashboard'}
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1.5">A snapshot of India's export opportunity, powered by DGFT + Comtrade data.</p>
      </Reveal>

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stagger.Item><KPICard icon="products" tint="amber" label="Total Products" value={pLoading ? '—' : products.length.toLocaleString()} /></Stagger.Item>
        <Stagger.Item><KPICard icon="buyers" tint="blue" label="Buyer Countries" value="41" /></Stagger.Item>
        <Stagger.Item><KPICard icon="handshake" tint="green" label="Comtrade Products" value={cLoading ? '—' : comtrade.length} /></Stagger.Item>
        <Stagger.Item><KPICard icon="trophy" tint="purple" label="Top Export" value={topProduct ? topProduct.commodity : '—'} sub={topProduct ? `$${topProduct.export_usd_2024.toFixed(0)}M` : ''} /></Stagger.Item>
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Reveal delay={0.1} className="card p-5">
          <h2 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <Icon name="chart" className="w-[18px] h-[18px] text-[#F59E0B]" />
            Top Exports (FY24)
          </h2>
          <div className="flex flex-col gap-3">
            {topExports.map((p, i) => (
              <BarRow key={p.hs_code} label={p.commodity} value={p.export_usd_2024} max={maxExport} index={i} />
            ))}
            {pLoading && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-6 w-full" />)}
              </div>
            )}
            {!pLoading && topExports.length === 0 && (
              <p className="text-sm text-[#64748B] py-4 text-center">No export data available yet.</p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.16} className="card p-5">
          <h2 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <Icon name="trade" className="w-[18px] h-[18px] text-[#F59E0B]" />
            Market Signals
          </h2>
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
            {topGrowing.length === 0 && (
              <p className="text-sm text-[#64748B] py-2">No growth data yet.</p>
            )}
          </div>
        </Reveal>
      </div>

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4" delay={0.2}>
        {QUICK_ACTIONS.map((a) => (
          <Stagger.Item key={a.to}>
            <Pressable className="h-full">
              <Link
                to={a.to}
                className="card card-hover p-4 flex flex-col gap-2 h-full group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-[10px] bg-[#F59E0B]/12 text-[#F59E0B] flex items-center justify-center">
                    <Icon name={a.icon} className="w-[18px] h-[18px]" />
                  </span>
                  <Icon name="arrow" className="w-4 h-4 text-[#64748B] group-hover:text-[#F59E0B] transition-colors" />
                </div>
                <span className="font-semibold text-sm text-[#F1F5F9] mt-1">{a.label}</span>
                <span className="text-xs text-[#64748B]">{a.desc}</span>
              </Link>
            </Pressable>
          </Stagger.Item>
        ))}
      </Stagger>
    </div>
  )
}
