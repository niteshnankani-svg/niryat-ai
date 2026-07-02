import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatMessage from './ChatMessage'
import { useChat } from '../../hooks/useChat'

const SUGGESTED = [
  { icon: '📋', text: 'How do I get an IEC code?' },
  { icon: '💰', text: 'How do I calculate FOB price?' },
  { icon: '🏦', text: 'What is a Letter of Credit?' },
  { icon: '🤝', text: 'Show me buyers in UAE' },
]

export default function ChatPanel({ onClose }) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const endRef = useRef(null)
  const { messages, streaming, streamingText, sendMessage } = useChat({
    onBuyerRequest: (country) => navigate(`/buyers?country=${encodeURIComponent(country)}`),
  })

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingText])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-40 sm:w-[380px] h-[560px] max-h-[70vh] bg-[#13151C] border border-white/[.08] rounded-[14px] shadow-2xl flex flex-col overflow-hidden animate-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[.06] bg-[#181B24]">
        <div>
          <div className="text-sm font-semibold text-[#F1F5F9]">NiryatAI Assistant</div>
          <div className="text-[11px] text-[#64748B]">Powered by Claude</div>
        </div>
        <button onClick={onClose} className="text-[#64748B] hover:text-[#F1F5F9] text-lg leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#64748B] mb-1">Try asking:</p>
            {SUGGESTED.map((q) => (
              <button
                key={q.text}
                onClick={() => sendMessage(q.text)}
                className="flex items-center gap-2 text-left text-sm px-3 py-2 rounded-[10px] bg-[#181B24] border border-white/[.06] text-[#CBD5E1] hover:border-[#F59E0B]/30 transition-colors"
              >
                <span>{q.icon}</span>{q.text}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}

        {streaming && (
          <ChatMessage role="assistant" content={streamingText || '...'} />
        )}

        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/[.06] flex items-center gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={streaming}
          placeholder="Ask about exports..."
          className="flex-1 bg-[#181B24] border border-white/[.08] rounded-[10px] px-3 py-2 text-sm text-[#F1F5F9] outline-none resize-none focus:border-[#F59E0B]/40"
        />
        <button
          onClick={() => { sendMessage(input); setInput('') }}
          disabled={!input.trim() || streaming}
          className="w-9 h-9 shrink-0 rounded-[10px] bg-[#F59E0B] disabled:opacity-40 flex items-center justify-center text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
        </button>
      </div>
    </div>
  )
}
