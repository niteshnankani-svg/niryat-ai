import { useState } from 'react'
import { GOVT_SCHEMES } from '../data/static'

export default function GovtSchemes() {
  const [openName, setOpenName] = useState(null)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Government Schemes</h1>
      <p className="text-sm text-[#94A3B8] mb-6">Incentives and support programs available to Indian exporters. Click a card for eligibility and how to apply.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {GOVT_SCHEMES.map((s) => {
          const isOpen = openName === s.name
          return (
            <button
              key={s.name}
              onClick={() => setOpenName(isOpen ? null : s.name)}
              className="text-left bg-[#181B24] border border-white/[.06] hover:border-[#F59E0B]/30 rounded-[14px] p-5 flex flex-col gap-1 transition-colors"
            >
              <div className="flex gap-4">
                <span className="text-3xl shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-[#F1F5F9]">{s.name}</div>
                  <div className="text-sm text-[#F59E0B] font-mono mb-1">{s.benefit}</div>
                  <div className="text-sm text-[#94A3B8]">{s.description}</div>
                </div>
              </div>

              {isOpen && (
                <div className="mt-2 pt-3 pl-[52px] border-t border-white/[.06] flex flex-col gap-3 animate-in">
                  <div>
                    <p className="text-xs text-[#F59E0B] font-medium mb-1">Eligibility</p>
                    <p className="text-sm text-[#CBD5E1]">{s.eligibility}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#F59E0B] font-medium mb-1">How to apply</p>
                    <ol className="text-sm text-[#CBD5E1] list-decimal list-inside flex flex-col gap-1">
                      {s.howToApply.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>
                </div>
              )}
              <span className="text-xs text-[#64748B] mt-1 pl-[52px]">{isOpen ? '− Show less' : '+ Eligibility & how to apply'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
