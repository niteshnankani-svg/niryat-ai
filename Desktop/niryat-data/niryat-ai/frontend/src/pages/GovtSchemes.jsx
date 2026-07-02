import { GOVT_SCHEMES } from '../data/static'

export default function GovtSchemes() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Government Schemes</h1>
      <p className="text-sm text-[#94A3B8] mb-6">Incentives and support programs available to Indian exporters.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GOVT_SCHEMES.map((s) => (
          <div key={s.name} className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5 flex gap-4">
            <span className="text-3xl shrink-0">{s.icon}</span>
            <div>
              <div className="font-semibold text-[#F1F5F9]">{s.name}</div>
              <div className="text-sm text-[#F59E0B] font-mono mb-1">{s.benefit}</div>
              <div className="text-sm text-[#94A3B8]">{s.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
