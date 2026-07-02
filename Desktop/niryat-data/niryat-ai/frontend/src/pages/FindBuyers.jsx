import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CountryFilter from '../components/Buyers/CountryFilter'
import BuyerCard from '../components/Buyers/BuyerCard'
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
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Find Buyers</h1>
      <p className="text-sm text-[#94A3B8] mb-5">Verified buyer contacts across 41 countries.</p>

      <div className="mb-5">
        <CountryFilter selected={country} onSelect={setCountry} />
      </div>

      {loading && <p className="text-sm text-[#64748B]">Loading buyer leads...</p>}
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}

      {leads?.leads?.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#94A3B8]">{leads.leads.length} buyers found in {country}</span>
            {!isLocked && <span className="text-xs px-2.5 py-1 rounded-[16px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">✓ Unlocked</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {leads.leads.map((lead, i) => <BuyerCard key={i} lead={lead} locked={isLocked} />)}
          </div>

          {isLocked && (
            <div className="text-center">
              <button
                onClick={handleUnlock}
                className="px-5 py-2.5 rounded-[10px] bg-[#F59E0B] text-white font-semibold text-sm hover:bg-[#D97706] transition-colors"
              >
                Unlock all contacts — {UNLOCK_COST} credits
              </button>
              {unlockMsg && <p className="text-xs text-[#EF4444] mt-2">{unlockMsg}</p>}
            </div>
          )}
        </>
      ) : (
        !loading && country !== 'All' && <p className="text-sm text-[#64748B]">No buyer leads found for {country}.</p>
      )}
    </div>
  )
}
