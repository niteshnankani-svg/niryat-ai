import { useState } from 'react'
import { motion } from 'motion/react'
import { COSTING_ROWS } from '../data/static'
import PageHeader from '../components/shared/PageHeader'
import { Reveal } from '../components/motion/Motion'
import Icon from '../lib/icons'

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
      <PageHeader
        icon="costing"
        title="Costing Calculator"
        subtitle="Enter your own numbers — FOB and CIF recalculate as you type."
        action={
          <button
            onClick={() => setValues(DEFAULTS)}
            className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F59E0B] border border-white/10 hover:border-[#F59E0B]/30 rounded-[8px] px-3 py-1.5 transition-colors"
          >
            <Icon name="reset" className="w-3.5 h-3.5" /> Reset
          </button>
        }
      />

      <Reveal delay={0.1} className="card overflow-hidden">
        {INPUT_ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3 border-b border-white/[.05] gap-4 hover:bg-white/[.02] transition-colors">
            <span className="text-sm text-[#CBD5E1]">{row.label}</span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm text-[#64748B] font-mono">₹</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={values[row.label]}
                onChange={(e) => setValue(row.label, e.target.value)}
                className="w-28 bg-white/[.04] border border-white/10 focus:border-[#F59E0B]/50 rounded-[8px] px-2 py-1.5 text-sm font-mono text-[#F1F5F9] text-right outline-none transition-colors"
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[.02] border-b border-white/[.05]">
          <span className="text-sm font-semibold text-[#F1F5F9]">FOB price</span>
          <motion.span key={fob} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-mono text-sm font-semibold text-[#F1F5F9]">{fmt(fob)}</motion.span>
        </div>

        <div className="flex items-center justify-between px-5 py-4 bg-[#F59E0B]/10">
          <span className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
            <Icon name="ship" className="w-4 h-4 text-[#F59E0B]" />
            Final CIF price to buyer
          </span>
          <motion.span key={cif} initial={{ opacity: 0.4, y: -2 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-base font-bold text-[#F59E0B]">{fmt(cif)}</motion.span>
        </div>
      </Reveal>

      <p className="text-xs text-[#64748B] mt-3 flex items-center gap-1.5">
        <Icon name="sparkles" className="w-3.5 h-3.5 text-[#F59E0B]" />
        FOB = ex-factory + inland + packing + docs. CIF adds ocean freight + marine insurance.
      </p>
    </div>
  )
}
