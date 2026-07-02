import { COSTING_ROWS } from '../data/static'

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

export default function Costing() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Costing Calculator</h1>
      <p className="text-sm text-[#94A3B8] mb-6">Sample FOB → CIF cost breakdown for a typical shipment.</p>

      <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] overflow-hidden">
        {COSTING_ROWS.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-5 py-3.5 border-b border-white/[.05] last:border-b-0 ${
              row.total ? 'bg-[#F59E0B]/10' : row.subtotal ? 'bg-white/[.02]' : ''
            }`}
          >
            <span className={`text-sm ${row.total || row.subtotal ? 'font-semibold text-[#F1F5F9]' : 'text-[#CBD5E1]'}`}>
              {row.label}
            </span>
            <span className={`font-mono text-sm ${row.total ? 'text-[#F59E0B] font-bold text-base' : 'text-[#F1F5F9]'}`}>
              {fmt(row.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
