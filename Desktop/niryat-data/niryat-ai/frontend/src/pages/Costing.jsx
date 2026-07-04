import { useState } from 'react'
import { COSTING_ROWS } from '../data/static'

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const DEFAULTS = COSTING_ROWS.reduce((acc, row) => {
  if (!row.subtotal && !row.total) acc[row.label] = row.amount
  return acc
}, {})

const INPUT_ROWS = [
  { label: 'Ex-factory price' },
  { label: 'Inland transport to port' },
  { label: 'Export packing' },
  { label: 'Documentation & customs' },
  { label: 'Ocean freight' },
  { label: 'Marine insurance' },
]

export default function Costing() {
  const [values, setValues] = useState(DEFAULTS)

  const setValue = (label, raw) => {
    const n = raw === '' ? 0 : Number(raw)
    if (Number.isNaN(n)) return
    setValues((prev) => ({ ...prev, [label]: n }))
  }

  const fob = values['Ex-factory price'] + values['Inland transport to port'] + values['Export packing'] + values['Documentation & customs']
  const cif = fob + values['Ocean freight'] + values['Marine insurance']

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Costing Calculator</h1>
        <button
          onClick={() => setValues(DEFAULTS)}
          className="text-xs text-[#94A3B8] hover:text-[#F59E0B] border border-white/10 hover:border-[#F59E0B]/30 rounded-[8px] px-3 py-1.5 shrink-0 transition-colors"
        >
          Reset to example
        </button>
      </div>
      <p className="text-sm text-[#94A3B8] mb-6">Enter your own numbers — FOB and CIF recalculate as you type.</p>

      <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] overflow-hidden">
        {INPUT_ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3 border-b border-white/[.05] last:border-b-0 gap-4">
            <span className="text-sm text-[#CBD5E1]">{row.label}</span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm text-[#64748B] font-mono">₹</span>
              <input
                type="number"
                min="0"
                value={values[row.label]}
                onChange={(e) => setValue(row.label, e.target.value)}
                className="w-28 bg-white/[.04] border border-white/10 focus:border-[#F59E0B]/50 rounded-[8px] px-2 py-1.5 text-sm font-mono text-[#F1F5F9] text-right outline-none transition-colors"
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[.02] border-b border-white/[.05]">
          <span className="text-sm font-semibold text-[#F1F5F9]">FOB price</span>
          <span className="font-mono text-sm font-semibold text-[#F1F5F9]">{fmt(fob)}</span>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-[#F59E0B]/10">
          <span className="text-sm font-semibold text-[#F1F5F9]">Final CIF price to buyer</span>
          <span className="font-mono text-base font-bold text-[#F59E0B]">{fmt(cif)}</span>
        </div>
      </div>
    </div>
  )
}
