import { useState } from 'react'
import { useCredits } from '../context/CreditsContext'
import RazorpayModal from '../components/shared/RazorpayModal'

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
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Credits</h1>
      <p className="text-sm text-[#94A3B8] mb-6">1 credit per AI question, 5 credits to unlock buyer contacts.</p>

      <div className="bg-gradient-to-br from-[#F59E0B]/10 to-transparent border border-[#F59E0B]/20 rounded-[14px] p-6 mb-6">
        <div className="text-xs text-[#94A3B8] mb-1">Current balance</div>
        <div className="text-4xl font-bold font-mono text-[#F1F5F9]">{balance ?? '—'}</div>
      </div>

      <h2 className="font-semibold text-[#F1F5F9] mb-3">Top up</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTier(t)}
            className={`relative text-left bg-[#181B24] border rounded-[14px] p-5 hover:border-[#F59E0B]/40 transition-colors ${
              t.popular ? 'border-[#F59E0B]/40' : 'border-white/[.06]'
            }`}
          >
            {t.popular && (
              <span className="absolute -top-2.5 left-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F59E0B] text-white">
                POPULAR
              </span>
            )}
            <div className="text-2xl font-bold font-mono text-[#F1F5F9] mb-1">{t.credits}</div>
            <div className="text-xs text-[#64748B] mb-3">credits</div>
            <div className="text-lg font-semibold text-[#F59E0B]">₹{t.price}</div>
          </button>
        ))}
      </div>

      <h2 className="font-semibold text-[#F1F5F9] mb-3">Promo code</h2>
      <form onSubmit={handlePromo} className="flex gap-2 mb-8">
        <input
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="NIRYAT50"
          className="flex-1 bg-[#181B24] border border-white/[.08] rounded-[10px] px-3.5 py-2.5 text-sm text-[#F1F5F9] outline-none focus:border-[#F59E0B]/40"
        />
        <button type="submit" className="px-4 py-2.5 rounded-[10px] bg-white/[.06] border border-white/[.08] text-sm text-[#F1F5F9] hover:bg-white/[.1] transition-colors">
          Apply
        </button>
      </form>
      {promoMsg && <p className="text-sm text-[#94A3B8] -mt-6 mb-8">{promoMsg}</p>}

      <h2 className="font-semibold text-[#F1F5F9] mb-3">Recent activity</h2>
      <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] overflow-hidden">
        {history.length === 0 && <p className="text-sm text-[#64748B] p-4">No transactions yet.</p>}
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
