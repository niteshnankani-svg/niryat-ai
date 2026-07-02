import { useNavigate } from 'react-router-dom'
import Badge, { signalVariant } from '../shared/Badge'

export default function ComparisonTable({ rows }) {
  const navigate = useNavigate()
  return (
    <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[.06] text-left text-[#64748B]">
            <th className="px-4 py-3 font-medium">HS Code</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium text-right">World Imports</th>
            <th className="px-4 py-3 font-medium text-right">India Exports</th>
            <th className="px-4 py-3 font-medium text-right">India %</th>
            <th className="px-4 py-3 font-medium">Signal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.hs_code}
              onClick={() => navigate(`/trade/${p.hs_code}`)}
              className="border-b border-white/[.04] last:border-b-0 hover:bg-white/[.03] cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-mono text-[#F59E0B]">{p.hs_code}</td>
              <td className="px-4 py-3 text-[#F1F5F9]">{p.commodity}</td>
              <td className="px-4 py-3 text-right font-mono text-[#F1F5F9]">
                {p.world_imports_usd_m != null ? `$${p.world_imports_usd_m.toLocaleString()}M` : '—'}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[#F1F5F9]">
                {p.india_exports_usd_m != null ? `$${p.india_exports_usd_m.toLocaleString()}M` : '—'}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[#94A3B8]">
                {p.india_share_pct != null ? `${p.india_share_pct}%` : '—'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={signalVariant(p.signal)}>{p.signal || 'No data'}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
