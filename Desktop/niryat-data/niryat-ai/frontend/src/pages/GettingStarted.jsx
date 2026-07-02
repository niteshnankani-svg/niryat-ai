import { useState } from 'react'
import { GETTING_STARTED_STEPS } from '../data/static'

const STATUS_STYLE = {
  done: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  'in-progress': 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  'not-started': 'bg-white/5 text-[#64748B] border-white/10',
}
const STATUS_LABEL = { done: 'Done', 'in-progress': 'In Progress', 'not-started': 'Not Started' }

export default function GettingStarted() {
  const [openStep, setOpenStep] = useState(1)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Getting Started</h1>
      <p className="text-sm text-[#94A3B8] mb-6">Your six-step path from IEC registration to your first shipment.</p>

      <div className="flex flex-col gap-3">
        {GETTING_STARTED_STEPS.map((s) => {
          const isOpen = openStep === s.step
          return (
            <div key={s.step} className="bg-[#181B24] border border-white/[.06] rounded-[14px] overflow-hidden">
              <button
                onClick={() => setOpenStep(isOpen ? null : s.step)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-white/[.06] flex items-center justify-center text-sm font-mono text-[#94A3B8] shrink-0">
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#F1F5F9]">{s.title}</div>
                  <div className="text-sm text-[#94A3B8] truncate">{s.description}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-[16px] border shrink-0 ${STATUS_STYLE[s.status]}`}>
                  {STATUS_LABEL[s.status]}
                </span>
                <span className="text-[#64748B] shrink-0">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pl-[52px] text-sm text-[#CBD5E1] animate-in">{s.detail}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
