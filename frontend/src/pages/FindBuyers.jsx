import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CountryFilter from '../components/Buyers/CountryFilter'
import BuyerCard from '../components/Buyers/BuyerCard'
import PageHeader from '../components/shared/PageHeader'
import { Reveal, Stagger } from '../components/motion/Motion'
import Icon from '../lib/icons'
import { useBuyers } from '../hooks/useBuyers'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../context/CreditsContext'

const UNLOCK_COST = 5

export default function FindBuyers() {
  const [searchParams] = useSearchParams()
  const [country, setCountry] = useState(searchParams.get('country') || 'UAE')
  const [product] = useState(searchParams.get('product') || '')
  const [unlockMsg, setUnlockMsg] = useState('')
  const { leads, loading, error, search } = useBuyers()
  const { user, setShowLoginModal } = useAuth()
  const { balance, deduct } = useCredits()

  useEffect(() => {
    if (country && country !== 'All') search(country, product, user?.email)
  }, [country, product, user?.email, search])

  async function handleUnlock() {
    setUnlockMsg('')
    if (!user) {
      setShowLoginModal(true)
      return
    }
    if (balance != null && balance < UNLOCK_COST) {
      setUnlockMsg(`You need ${UNLOCK_COST} credits to unlock contacts. Top up on the Credits page.`)
      return
    }
    const ok = await deduct(UNLOCK_COST, `Unlock buyer contacts — ${country}`)
    if (ok) {
      await search(country, product, user.email)
    } else {
      setUnlockMsg('Could not deduct credits. Try again.')
    }
  }

  const isLocked = leads && !leads.premium && !leads.registered

  return (
    <div>
      <PageHeader
        icon="buyers"
        tint="blue"
        title="Find Buyers"
        subtitle="Verified buyer contacts across 41 countries."
      />

      <Reveal delay={0.05} className="mb-5">
        <CountryFilter selected={country} onSelect={setCountry} />
      </Reveal>

      {loading && (
        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Stagger.Item key={i}><div className="card p-5 h-40 skeleton" /></Stagger.Item>
          ))}
        </Stagger>
      )}
      {error && (
        <div className="card border-[#EF4444]/20 p-4 text-sm text-[#EF4444] flex items-center gap-2">
          <Icon name="shield" className="w-4 h-4" /> {error}
        </div>
      )}

      {!loading && leads?.leads?.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#94A3B8]">{leads.leads.length} buyers found in {country}</span>
            {!isLocked ? (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-[16px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                <Icon name="check" className="w-3 h-3" strokeWidth={2.5} /> Unlocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-[16px] bg-white/5 text-[#94A3B8] border border-white/10">
                <Icon name="lock" className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {leads.leads.map((lead, i) => (
              <Stagger.Item key={i}><BuyerCard lead={lead} locked={isLocked} /></Stagger.Item>
            ))}
          </Stagger>

          {isLocked && (
            <div className="text-center">
              <button
                onClick={handleUnlock}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#F59E0B] text-white font-semibold text-sm hover:bg-[#D97706] transition-colors shadow-[var(--shadow-glow)]"
              >
                <Icon name="lock" className="w-4 h-4" />
                Unlock all contacts — {UNLOCK_COST} credits
              </button>
              {unlockMsg && <p className="text-xs text-[#EF4444] mt-2">{unlockMsg}</p>}
            </div>
          )}
        </>
      ) : (
        !loading && country !== 'All' && (
          <div className="card flex flex-col items-center gap-2 py-12 text-center">
            <Icon name="buyers" className="w-7 h-7 text-[#64748B]" />
            <p className="text-sm text-[#94A3B8]">No buyer leads found for {country}.</p>
          </div>
        )
      )}
    </div>
  )
}
