import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GETTING_STARTED_STEPS } from '../data/static'
import PageHeader from '../components/shared/PageHeader'
import { Stagger } from '../components/motion/Motion'
import Icon from '../lib/icons'

const STATUS_STYLE = {
  done: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  'in-progress': 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  'not-started': 'bg-white/5 text-[#64748B] border-white/10',
}
const STATUS_LABEL = { done: 'Done', 'in-progress': 'In Progress', 'not-started': 'Not Started' }

export default function GettingStarted() {
  const [openStep, setOpenStep] = useState(1)
  const doneCount = GETTING_STARTED_STEPS.filter((s) => s.status === 'done').length
  const progress = Math.round((doneCount / GETTING_STARTED_STEPS.length) * 100)

  return (
    <div className="max-w-3xl">
      <PageHeader
        icon="guide"
        title="Getting Started"
        subtitle="Your six-step path from IEC registration to your first shipment."
      />

      {/* Progress bar */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#CBD5E1] font-medium">Launch progress</span>
          <span className="font-mono text-[#F59E0B]">{doneCount}/{GETTING_STARTED_STEPS.length} done</span>
        </div>
        <div className="h-2 bg-white/[.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <Stagger className="flex flex-col gap-3">
        {GETTING_STARTED_STEPS.map((s) => {
          const isOpen = openStep === s.step
          return (
            <Stagger.Item key={s.step}>
              <div className="card overflow-hidden">
                <button
                  onClick={() => setOpenStep(isOpen ? null : s.step)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[.02] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono shrink-0 ${s.status === 'done' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-white/[.06] text-[#94A3B8]'}`}>
                    {s.status === 'done' ? <Icon name="check" className="w-4 h-4" strokeWidth={2.5} /> : s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#F1F5F9]">{s.title}</div>
                    <div className="text-sm text-[#94A3B8] truncate">{s.description}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-[16px] border shrink-0 hidden sm:inline ${STATUS_STYLE[s.status]}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-[#64748B] shrink-0">
                    <Icon name="plus" className="w-4 h-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pl-[52px] text-sm text-[#CBD5E1]">{s.detail}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Stagger.Item>
          )
        })}
      </Stagger>
    </div>
  )
}
