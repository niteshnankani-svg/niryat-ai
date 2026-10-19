import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import { requestHsnCode } from '../../api/trade'

/**
 * Opened when the chat assistant can't find an HS code for a product the
 * user described (see HSN_PATTERN in useChat.js). Logs the request via
 * POST /hsn/request for manual research and follow-up — same pattern as
 * registered_emails.json, just a dedicated log instead of piggybacking on
 * the login/registration flow.
 */
export default function HsnRequestModal({ product, onClose }) {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  if (!product) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    setStatus('sending')
    try {
      await requestHsnCode({ product, email: email.trim(), note: note.trim() })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hsn-request-title"
    >
      <motion.div
        className="w-full max-w-sm bg-[#181B24] border border-white/[.08] rounded-[14px] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        {status === 'sent' ? (
          <>
            <h3 id="hsn-request-title" className="font-semibold text-[#F1F5F9] mb-1.5">Request logged</h3>
            <p className="text-sm text-[#94A3B8] mb-4">
              We'll research the HSN code for <span className="text-[#F1F5F9]">"{product}"</span> and follow up at {email}.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-[10px] bg-[#F59E0B] text-white font-semibold text-sm hover:bg-[#D97706] transition-colors"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h3 id="hsn-request-title" className="font-semibold text-[#F1F5F9] mb-1">Request this HSN code</h3>
            <p className="text-xs text-[#64748B] mb-4">
              No match on file for <span className="text-[#CBD5E1]">"{product}"</span>. Leave your email and we'll research the exact code and get back to you.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label htmlFor="hsn-request-email" className="text-xs text-[#94A3B8] mb-1 block">Email</label>
                <input
                  id="hsn-request-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#0F1117] border border-white/[.08] rounded-[10px] px-3 py-2 text-sm text-[#F1F5F9] outline-none focus:border-[#F59E0B]/40"
                />
              </div>
              <div>
                <label htmlFor="hsn-request-note" className="text-xs text-[#94A3B8] mb-1 block">Anything else? (optional)</label>
                <textarea
                  id="hsn-request-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="More detail about the product, materials, use case..."
                  className="w-full bg-[#0F1117] border border-white/[.08] rounded-[10px] px-3 py-2 text-sm text-[#F1F5F9] outline-none resize-none focus:border-[#F59E0B]/40"
                />
              </div>
              {status === 'error' && (
                <p className="text-xs text-red-400">Something went wrong — try again in a moment.</p>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-1 py-2.5 rounded-[10px] bg-[#F59E0B] text-white font-semibold text-sm hover:bg-[#D97706] disabled:opacity-50 transition-colors"
              >
                {status === 'sending' ? 'Sending...' : 'Request code'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Not now
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
