import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import KPICard from '../components/shared/KPICard'
import Badge, { signalVariant } from '../components/shared/Badge'
import Icon from '../lib/icons'
import { getIntel, fetchTradeData } from '../api/trade'

export default function ProductDetail() {
  const { hsCode } = useParams()
  const navigate = useNavigate()
  const [intel, setIntel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [live, setLive] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getIntel(hsCode)
      .then((data) => { if (!cancelled) setIntel(data) })
      .catch(() => { if (!cancelled) setError('No intel data for this HS code yet.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    fetchTradeData({ hs_code: hsCode })
      .then((res) => { if (!cancelled && res.data?.length) setLive(res.data[0]) })
      .catch(() => {})

    return () => { cancelled = true }
  }, [hsCode])

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/trade')} className="group text-sm text-[#94A3B8] hover:text-[#F1F5F9] mb-4 inline-flex items-center gap-1.5 transition-colors">
        <Icon name="arrow" className="w-4 h-4 -rotate-[135deg] group-hover:-translate-x-0.5 transition-transform" /> Back to Trade Data
      </button>

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-8 w-2/3" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28" />)}
          </div>
        </div>
      ) : error ? (
        <div className="card flex flex-col items-center gap-2 py-12 text-center">
          <Icon name="search" className="w-7 h-7 text-[#64748B]" />
          <p className="text-sm text-[#94A3B8]">{error}</p>
        </div>
      ) : intel ? (
        <>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[#F59E0B] text-sm">HS {intel.hs_code}</span>
            {intel.signal && <Badge variant={signalVariant(intel.signal)}>{intel.signal}</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">{intel.commodity || live?.Commodity}</h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <KPICard icon="ship" tint="amber" label="Export FY24" value={intel.dgft_export_2024 != null ? `$${intel.dgft_export_2024.toFixed(1)}M` : '—'} />
            <KPICard icon="download" tint="blue" label="Export FY23" value={intel.dgft_export_2023 != null ? `$${intel.dgft_export_2023.toFixed(1)}M` : '—'} />
            <KPICard icon="calendar" tint="purple" label="Monthly Avg" value={intel.dgft_monthly_avg != null ? `$${intel.dgft_monthly_avg.toFixed(1)}M` : '—'} />
          </div>

          {intel.world_imports_usd_m != null && (
            <div className="card p-5 mb-6 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-[#64748B] mb-1">World Imports</div>
                <div className="font-mono text-lg text-[#F1F5F9]">${intel.world_imports_usd_m.toLocaleString()}M</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] mb-1">India Exports</div>
                <div className="font-mono text-lg text-[#F1F5F9]">${intel.india_exports_usd_m?.toLocaleString() ?? '—'}M</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] mb-1">India's Share</div>
                <div className="font-mono text-lg text-[#F1F5F9]">{intel.india_share_pct != null ? `${intel.india_share_pct}%` : '—'}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Link to={`/buyers?product=${encodeURIComponent(intel.commodity || '')}`} className="card card-hover p-4 flex flex-col gap-2 group">
              <span className="w-9 h-9 rounded-[10px] bg-[#10B981]/12 text-[#10B981] flex items-center justify-center"><Icon name="handshake" className="w-[18px] h-[18px]" /></span>
              <span className="font-semibold text-sm text-[#F1F5F9] flex items-center gap-1">Find buyers <Icon name="arrow" className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#F59E0B] transition-colors" /></span>
            </Link>
            <Link to="/schemes" className="card card-hover p-4 flex flex-col gap-2 group">
              <span className="w-9 h-9 rounded-[10px] bg-[#A78BFA]/12 text-[#A78BFA] flex items-center justify-center"><Icon name="schemes" className="w-[18px] h-[18px]" /></span>
              <span className="font-semibold text-sm text-[#F1F5F9] flex items-center gap-1">Govt schemes <Icon name="arrow" className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#F59E0B] transition-colors" /></span>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  )
}
