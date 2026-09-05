import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DOCUMENTS } from '../data/static'
import PageHeader from '../components/shared/PageHeader'
import { Stagger } from '../components/motion/Motion'
import Icon from '../lib/icons'

export default function Documents() {
  const [openName, setOpenName] = useState(null)

  return (
    <div>
      <PageHeader
        icon="documents"
        title="Export Documents"
        subtitle="The paperwork every shipment needs — and what's only required sometimes. Click a card for details."
      />

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {DOCUMENTS.map((d) => {
          const isOpen = openName === d.name
          const mandatory = d.requirement === 'Mandatory'
          return (
            <Stagger.Item key={d.name}>
              <button
                onClick={() => setOpenName(isOpen ? null : d.name)}
                className={`text-left card card-hover w-full p-5 flex flex-col gap-2.5 ${isOpen ? 'border-[#F59E0B]/30' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-[10px] bg-[#F59E0B]/12 text-[#F59E0B] flex items-center justify-center">
                    <Icon name={d.icon} className="w-5 h-5" />
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-[16px] border ${
                    mandatory
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                      : 'bg-white/5 text-[#94A3B8] border-white/10'
                  }`}>
                    {mandatory && <Icon name="shield" className="w-3 h-3" />}
                    {d.requirement}
                  </span>
                </div>
                <div className="font-semibold text-[#F1F5F9]">{d.name}</div>
                <div className="text-sm text-[#94A3B8]">{d.description}</div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pt-3 border-t border-white/[.06] flex flex-col gap-2">
                        <p className="text-sm text-[#CBD5E1]">{d.detail}</p>
                        <p className="text-xs text-[#64748B]">
                          <span className="text-[#F59E0B] font-medium">Where to get it: </span>
                          {d.obtainFrom}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="inline-flex items-center gap-1 text-xs text-[#64748B] mt-1">
                  <Icon name={isOpen ? 'minus' : 'plus'} className="w-3.5 h-3.5" />
                  {isOpen ? 'Show less' : 'Show details'}
                </span>
              </button>
            </Stagger.Item>
          )
        })}
      </Stagger>
    </div>
  )
}
