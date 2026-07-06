import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import ChatPanel from './ChatPanel'
import Icon from '../../lib/icons'

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <AnimatePresence>{open && <ChatPanel key="panel" onClose={() => setOpen(false)} />}</AnimatePresence>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] shadow-lg shadow-[#F59E0B]/25 flex items-center justify-center text-white"
        aria-label={open ? 'Close chat' : 'Open chat'}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'chat'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Icon name={open ? 'close' : 'chat'} className="w-6 h-6" strokeWidth={2} />
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  )
}
