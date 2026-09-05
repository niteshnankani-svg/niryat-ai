import { useState } from 'react'
import { motion } from 'motion/react'
import { useCredits } from '../context/CreditsContext'
import RazorpayModal from '../components/shared/RazorpayModal'
import PageHeader from '../components/shared/PageHeader'
import { Reveal, Stagger, Pressable } from '../components/motion/Motion'
import Icon from '../lib/icons'

const TIERS = [
  { id: '50', credits: 50, price: 199 },
  { id: '200', credits: 200, price: 499, popular: true },
  { id: '500', credits: 500, price: 999 },
]

export default function Credits() {
  const { balance, history, redeemPromo } = useCredits()
  const [selectedTier, setSelectedTier] = useState(null)
  const [promo, setPromo] = useState('')
  const [promoMsg, setPromoMsg] = useState('')

  async function handlePromo(e) {
    e.preventDefault()
    if (!promo.trim()) return
    const result = await redeemPromo(promo.trim())
    setPromoMsg(result.ok ? `+${result.credits_added} credits added!` : result.message || 'Invalid code')
    setPromo('')
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        icon="credits"
        title="Credits"
        subtitle="1 credit per AI question, 5 credits to unlock buyer contacts."
      />

      <Reveal delay={0.05} className="relative overflow-hidden bg-gradient-to-br from-[#F59E0B]/12 to-transparent border border-[#F59E0B]/20 rounded-[14px] p-6 mb-6">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#F59E0B]/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="w-12 h-12 rounded-[14px] bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
            <Icon name="credits" className="w-6 h-6" />
          </span>
          <div>
            <div className="text-xs text-[#94A3B8] mb-0.5">Current balance</div>
            <motion.div key={balance} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold font-mono text-[#F1F5F9] leading-none">
              {balance ?? '—'}
            </motion.div>
          </div>
        </div>
      </Reveal>

      <h2 className="font-semibold text-[#F1F5F9] mb-3">Top up</h2>
      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {TIERS.map((t) => (
          <Stagger.Item key={t.id}>
            <Pressable className="h-full">
              <button
                onClick={() => setSelectedTier(t)}
                className={`relative text-left card w-full h-full p-5 transition-colors ${
                  t.popular ? 'border-[#F59E0B]/40 shadow-[var(--shadow-glow)]' : 'hover:border-[#F59E0B]/40'
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F59E0B] text-white">
                    <Icon name="sparkles" className="w-3 h-3" /> POPULAR
                  </span>
                )}
                <div className="text-2xl font-bold font-mono text-[#F1F5F9] mb-0.5">{t.credits}</div>
                <div className="text-xs text-[#64748B] mb-3">credits</div>
                <div className="text-lg font-semibold text-[#F59E0B]">₹{t.price}</div>
              </button>
            </Pressable>
          </Stagger.Item>
        ))}
      </Stagger>

      <h2 className="font-semibold text-[#F1F5F9] mb-3">Promo code</h2>
      <form onSubmit={handlePromo} className="flex gap-2 mb-2">
        <input
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="NIRYAT50"
          className="flex-1 bg-[#181B24] border border-white/[.08] rounded-[10px] px-3.5 py-2.5 text-sm text-[#F1F5F9] outline-none focus:border-[#F59E0B]/40 transition-colors"
        />
        <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-white/[.06] border border-white/[.08] text-sm text-[#F1F5F9] hover:bg-white/[.1] transition-colors">
          <Icon name="check" className="w-4 h-4" /> Apply
        </button>
      </form>
      {promoMsg && <p className="text-sm text-[#94A3B8] mb-8">{promoMsg}</p>}
      {!promoMsg && <div className="mb-8" />}

      <h2 className="font-semibold text-[#F1F5F9] mb-3">Recent activity</h2>
      <div className="card overflow-hidden">
        {history.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon name="clipboard" className="w-6 h-6 text-[#64748B]" />
            <p className="text-sm text-[#64748B]">No transactions yet.</p>
          </div>
        )}
        {[...history].reverse().slice(0, 10).map((h, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[.05] last:border-b-0 text-sm">
            <span className="text-[#CBD5E1]">{h.reason}</span>
            <span className={`font-mono ${h.amount >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {h.amount > 0 ? '+' : ''}{h.amount}
            </span>
          </div>
        ))}
      </div>

      {selectedTier && <RazorpayModal tier={selectedTier} onClose={() => setSelectedTier(null)} />}
    </div>
  )
}
