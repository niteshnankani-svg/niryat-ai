import { useState } from 'react'
import ChatPanel from './ChatPanel'

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] shadow-lg shadow-[#F59E0B]/25 flex items-center justify-center text-white text-2xl hover:scale-105 transition-transform"
        aria-label="Open chat"
      >
        {open ? '×' : '💬'}
      </button>
    </>
  )
}
