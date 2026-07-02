import { DOCUMENTS } from '../data/static'

export default function Documents() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Export Documents</h1>
      <p className="text-sm text-[#94A3B8] mb-6">The paperwork every shipment needs — and what's only required sometimes.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENTS.map((d) => (
          <div key={d.name} className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{d.icon}</span>
              <span className={`text-xs px-2.5 py-1 rounded-[16px] border ${
                d.requirement === 'Mandatory'
                  ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                  : 'bg-white/5 text-[#94A3B8] border-white/10'
              }`}>
                {d.requirement}
              </span>
            </div>
            <div className="font-semibold text-[#F1F5F9]">{d.name}</div>
            <div className="text-sm text-[#94A3B8]">{d.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
