import { PAYMENT_METHODS } from '../data/static'

const RISK_STYLE = {
  Safest: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  'Very safe': 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  Medium: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  Risky: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
}

export default function Payment() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Payment & Letter of Credit</h1>
      <p className="text-sm text-[#94A3B8] mb-6">Choose payment terms based on how well you trust the buyer.</p>

      <div className="flex flex-col gap-3">
        {PAYMENT_METHODS.map((m) => (
          <div key={m.name} className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5 flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[#F1F5F9] mb-1">{m.name}</div>
              <div className="text-sm text-[#94A3B8]">{m.description}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className={`text-xs px-2.5 py-1 rounded-[16px] border ${RISK_STYLE[m.risk]}`}>{m.risk}</span>
            </div>
            <div className="text-xs text-[#64748B] w-20 shrink-0 text-right font-mono">{m.speed}</div>
            <div className="text-xs text-[#64748B] w-32 shrink-0 text-right font-mono">{m.cost}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
