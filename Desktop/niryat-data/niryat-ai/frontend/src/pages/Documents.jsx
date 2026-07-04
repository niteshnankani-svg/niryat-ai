import { useState } from 'react'
import { DOCUMENTS } from '../data/static'

export default function Documents() {
  const [openName, setOpenName] = useState(null)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Export Documents</h1>
      <p className="text-sm text-[#94A3B8] mb-6">The paperwork every shipment needs — and what's only required sometimes. Click a card for details.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {DOCUMENTS.map((d) => {
          const isOpen = openName === d.name
          return (
            <button
              key={d.name}
              onClick={() => setOpenName(isOpen ? null : d.name)}
              className="text-left bg-[#181B24] border border-white/[.06] hover:border-[#F59E0B]/30 rounded-[14px] p-5 flex flex-col gap-2 transition-colors"
            >
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

              {isOpen && (
                <div className="mt-2 pt-3 border-t border-white/[.06] flex flex-col gap-2 animate-in">
                  <p className="text-sm text-[#CBD5E1]">{d.detail}</p>
                  <p className="text-xs text-[#64748B]">
                    <span className="text-[#F59E0B] font-medium">Where to get it: </span>
                    {d.obtainFrom}
                  </p>
                </div>
              )}
              <span className="text-xs text-[#64748B] mt-1">{isOpen ? '− Show less' : '+ Show details'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
