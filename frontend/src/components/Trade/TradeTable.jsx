import { useNavigate } from 'react-router-dom'

export default function TradeTable({ rows }) {
  const navigate = useNavigate()
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-white/[.06] text-left text-[#64748B] text-xs uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">HS Code</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium text-right">FY24 ($M)</th>
            <th className="px-4 py-3 font-medium text-right">FY23 ($M)</th>
            <th className="px-4 py-3 font-medium text-right">YoY</th>
            <th className="px-4 py-3 font-medium text-right">Monthly Avg</th>
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
              <td className="px-4 py-3 text-right font-mono text-[#F1F5F9]">{p.export_usd_2024?.toFixed(1) ?? '—'}</td>
              <td className="px-4 py-3 text-right font-mono text-[#94A3B8]">{p.export_usd_2023?.toFixed(1) ?? '—'}</td>
              <td className={`px-4 py-3 text-right font-mono ${p.yoy_growth_pct >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {p.yoy_growth_pct != null ? `${p.yoy_growth_pct > 0 ? '+' : ''}${p.yoy_growth_pct.toFixed(1)}%` : '—'}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[#94A3B8]">{p.monthly_avg_2024?.toFixed(1) ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
