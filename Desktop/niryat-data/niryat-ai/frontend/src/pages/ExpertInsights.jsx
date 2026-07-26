import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import videoDb from '../data/videoSummaries.json'
import PageHeader from '../components/shared/PageHeader'
import { Stagger } from '../components/motion/Motion'
import Icon from '../lib/icons'

const master = videoDb.sessions.find((s) => s.slug === 'master-summary')
const sessions = videoDb.sessions.filter((s) => s.slug !== 'master-summary')

/* --- tiny markdown-ish renderer (bold + bullets + numbered + sub-headings) --- */

function Inline({ text }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-[#F1F5F9] font-semibold">{part}</strong>
    ) : (
      part
    )
  )
}

function SectionBody({ content }) {
  const lines = content.split('\n')
  const blocks = []
  let list = null

  const flush = () => {
    if (list) {
      blocks.push(list)
      list = null
    }
  }

  lines.forEach((raw, i) => {
    const line = raw.trimEnd()
    const trimmed = line.trim()
    if (!trimmed) {
      flush()
      return
    }
    const bullet = trimmed.match(/^-\s+(.*)/)
    const numbered = trimmed.match(/^(\d+)\.\s+(.*)/)
    const subhead = trimmed.match(/^###\s+(.*)/)

    if (subhead) {
      flush()
      blocks.push({ type: 'subhead', text: subhead[1], key: i })
    } else if (bullet) {
      const nested = /^\s{2,}/.test(raw)
      if (!list || list.type !== 'ul') {
        flush()
        list = { type: 'ul', items: [], key: i }
      }
      list.items.push({ text: bullet[1], nested })
    } else if (numbered) {
      if (!list || list.type !== 'ol') {
        flush()
        list = { type: 'ol', items: [], key: i }
      }
      list.items.push({ text: numbered[2], nested: false })
    } else {
      flush()
      blocks.push({ type: 'p', text: trimmed, key: i })
    }
  })
  flush()

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((b) => {
        if (b.type === 'subhead') {
          return (
            <p key={b.key} className="text-[13px] font-semibold text-[#F59E0B] mt-2">
              <Inline text={b.text} />
            </p>
          )
        }
        if (b.type === 'ul' || b.type === 'ol') {
          const Tag = b.type
          return (
            <Tag
              key={b.key}
              className={`text-sm text-[#CBD5E1] flex flex-col gap-1.5 ${
                b.type === 'ol' ? 'list-decimal' : 'list-disc'
              } list-outside ml-4`}
            >
              {b.items.map((item, j) => (
                <li key={j} className={item.nested ? 'ml-4' : ''}>
                  <Inline text={item.text} />
                </li>
              ))}
            </Tag>
          )
        }
        return (
          <p key={b.key} className="text-sm text-[#CBD5E1]">
            <Inline text={b.text} />
          </p>
        )
      })}
    </div>
  )
}

/* --- session card --- */

function SessionCard({ session, isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`text-left card card-hover w-full p-5 flex flex-col gap-1 ${
        isOpen ? 'border-[#F59E0B]/30' : ''
      }`}
    >
      <div className="flex gap-4">
        <span className="w-11 h-11 rounded-[12px] bg-[#F59E0B]/12 text-[#F59E0B] flex items-center justify-center shrink-0">
          <Icon name={session.icon} className="w-[22px] h-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-white/[.06] text-[#94A3B8] px-1.5 py-0.5 rounded-full">
              Day {session.day} · Session {session.session}
            </span>
          </div>
          <div className="font-semibold text-[#F1F5F9]">{session.shortTitle}</div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {session.topics.map((t) => (
              <span
                key={t}
                className="text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-1.5 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
          {!isOpen && (
            <p className="text-sm text-[#94A3B8] mt-2 line-clamp-3">
              <Inline text={session.overview} />
            </p>
          )}
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
            <div className="mt-2 pt-3 border-t border-white/[.06] flex flex-col gap-4">
              {session.sections.map((sec) => (
                <div key={sec.heading}>
                  <p className="text-xs text-[#F59E0B] font-medium mb-1.5 uppercase tracking-wide">
                    {sec.heading}
                  </p>
                  <SectionBody content={sec.content} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="inline-flex items-center gap-1 text-xs text-[#64748B] mt-2">
        <Icon name={isOpen ? 'minus' : 'plus'} className="w-3.5 h-3.5" />
        {isOpen ? 'Collapse session' : `Read full session notes (${session.sections.length} sections)`}
      </span>
    </button>
  )
}

/* --- page --- */

export default function ExpertInsights() {
  const [openSlug, setOpenSlug] = useState(null)
  const [masterOpen, setMasterOpen] = useState(false)

  return (
    <div>
      <PageHeader
        icon="sparkles"
        title="Expert Insights"
        subtitle="Session-by-session knowledge from our private live EXIM training recordings — practical instructor guidance and real trader Q&A you won't find in any public document."
      />

      <div className="mb-5 flex items-center gap-2 text-xs text-[#94A3B8] bg-[#F59E0B]/[.06] border border-[#F59E0B]/20 rounded-[12px] px-4 py-3">
        <Icon name="lock" className="w-4 h-4 text-[#F59E0B] shrink-0" />
        <span>
          <strong className="text-[#F1F5F9] font-medium">Exclusive content.</strong>{' '}
          Summarized in English from unlisted live-course recordings (Days 1–6). The NiryatAI
          chat assistant also draws on this knowledge automatically.
        </span>
      </div>

      {master && (
        <div className="mb-6">
          <SessionCard
            session={{ ...master, day: '1–6', session: 'All', shortTitle: master.shortTitle }}
            isOpen={masterOpen}
            onToggle={() => setMasterOpen(!masterOpen)}
          />
        </div>
      )}

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {sessions.map((s) => (
          <Stagger.Item key={s.slug}>
            <SessionCard
              session={s}
              isOpen={openSlug === s.slug}
              onToggle={() => setOpenSlug(openSlug === s.slug ? null : s.slug)}
            />
          </Stagger.Item>
        ))}
      </Stagger>
    </div>
  )
}
