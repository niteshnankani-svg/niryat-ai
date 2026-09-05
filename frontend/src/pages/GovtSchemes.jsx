import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GOVT_SCHEMES } from '../data/static'
import PageHeader from '../components/shared/PageHeader'
import { Stagger } from '../components/motion/Motion'
import Icon from '../lib/icons'

export default function GovtSchemes() {
  const [openName, setOpenName] = useState(null)

  return (
    <div>
      <PageHeader
        icon="schemes"
        title="Government Schemes"
        subtitle="Incentives and support programs available to Indian exporters. Click a card for eligibility and how to apply."
      />

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {GOVT_SCHEMES.map((s) => {
          const isOpen = openName === s.name
          return (
            <Stagger.Item key={s.name}>
              <button
                onClick={() => setOpenName(isOpen ? null : s.name)}
                className={`text-left card card-hover w-full p-5 flex flex-col gap-1 ${isOpen ? 'border-[#F59E0B]/30' : ''}`}
              >
                <div className="flex gap-4">
                  <span className="w-11 h-11 rounded-[12px] bg-[#F59E0B]/12 text-[#F59E0B] flex items-center justify-center shrink-0">
                    <Icon name={s.icon} className="w-[22px] h-[22px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#F1F5F9]">{s.name}</div>
                    <div className="text-sm text-[#F59E0B] font-mono mb-1">{s.benefit}</div>
                    <div className="text-sm text-[#94A3B8]">{s.description}</div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pt-3 pl-[60px] border-t border-white/[.06] flex flex-col gap-3">
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
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="inline-flex items-center gap-1 text-xs text-[#64748B] mt-1 pl-[60px]">
                  <Icon name={isOpen ? 'minus' : 'plus'} className="w-3.5 h-3.5" />
                  {isOpen ? 'Show less' : 'Eligibility & how to apply'}
                </span>
              </button>
            </Stagger.Item>
          )
        })}
      </Stagger>
    </div>
  )
}
