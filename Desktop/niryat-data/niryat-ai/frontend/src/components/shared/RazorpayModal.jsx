import { useState } from 'react'
import { useCredits } from '../../context/CreditsContext'

/**
 * Mock Razorpay checkout — no VITE_RAZORPAY_KEY_ID configured yet.
 * Real integration: load the Razorpay JS SDK, open Razorpay.open({...}),
 * and pass the real payment_id/signature to purchase() for server-side
 * verification instead of the "mock_" prefix credits.py currently accepts.
 */
export default function RazorpayModal({ tier, onClose }) {
  const { purchase } = useCredits()
  const [status, setStatus] = useState('idle') // idle | processing | success | error

  async function handlePay() {
    setStatus('processing')
    await new Promise((r) => setTimeout(r, 900))
    try {
      await purchase(tier.id, `mock_${Date.now()}`)
      setStatus('success')
      setTimeout(onClose, 1200)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#181B24] border border-white/[.08] rounded-[14px] p-6 animate-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#3395FF]/15 flex items-center justify-center text-[#3395FF] font-bold text-sm">R</div>
          <h3 className="font-semibold text-[#F1F5F9]">Razorpay Checkout</h3>
        </div>

        <div className="bg-[#0F1117] border border-white/[.06] rounded-[10px] p-4 mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-[#94A3B8]">{tier.credits} credits</div>
            <div className="text-xs text-[#64748B]">NiryatAI top-up</div>
          </div>
          <div className="font-mono text-lg font-bold text-[#F1F5F9]">₹{tier.price}</div>
        </div>

        {status === 'success' ? (
          <div className="text-center py-2 text-[#10B981] text-sm font-medium">✓ Payment successful — credits added!</div>
        ) : status === 'error' ? (
          <div className="text-center py-2 text-[#EF4444] text-sm">Payment failed. Try again.</div>
        ) : (
          <button
            onClick={handlePay}
            disabled={status === 'processing'}
            className="w-full py-2.5 rounded-[10px] bg-[#3395FF] text-white font-semibold text-sm hover:bg-[#2680E8] transition-colors disabled:opacity-60"
          >
            {status === 'processing' ? 'Processing...' : `Pay ₹${tier.price} with Razorpay`}
          </button>
        )}
        <p className="text-[11px] text-[#64748B] text-center mt-3">Demo checkout — no real payment is charged.</p>
      </div>
    </div>
  )
}
