import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import KPICard from '../components/shared/KPICard'
import Badge, { signalVariant } from '../components/shared/Badge'
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
      <button onClick={() => navigate('/trade')} className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] mb-4 flex items-center gap-1.5">
        <span>←</span> Back to Trade Data
      </button>

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading...</p>
      ) : error ? (
        <p className="text-sm text-[#EF4444]">{error}</p>
      ) : intel ? (
        <>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[#F59E0B] text-sm">HS {intel.hs_code}</span>
            {intel.signal && <Badge variant={signalVariant(intel.signal)}>{intel.signal}</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">{intel.commodity || live?.Commodity}</h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <KPICard icon="📤" label="Export FY24" value={intel.dgft_export_2024 != null ? `$${intel.dgft_export_2024.toFixed(1)}M` : '—'} />
            <KPICard icon="📥" label="Export FY23" value={intel.dgft_export_2023 != null ? `$${intel.dgft_export_2023.toFixed(1)}M` : '—'} />
            <KPICard icon="📅" label="Monthly Avg" value={intel.dgft_monthly_avg != null ? `$${intel.dgft_monthly_avg.toFixed(1)}M` : '—'} />
          </div>

          {intel.world_imports_usd_m != null && (
            <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5 mb-6 grid grid-cols-3 gap-4">
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
            <Link to={`/buyers?product=${encodeURIComponent(intel.commodity || '')}`} className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-4 hover:border-[#F59E0B]/30 transition-colors">
              <span className="text-xl block mb-1">🤝</span>
              <span className="font-semibold text-sm text-[#F1F5F9]">Find buyers</span>
            </Link>
            <Link to="/schemes" className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-4 hover:border-[#F59E0B]/30 transition-colors">
              <span className="text-xl block mb-1">🏛️</span>
              <span className="font-semibold text-sm text-[#F1F5F9]">Govt schemes</span>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  )
}
