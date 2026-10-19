import { useState, useCallback } from 'react'
import { streamChat } from '../api/chat'
import { useCredits } from '../context/CreditsContext'

const BUYER_PATTERN = /\[BUYER_REQUEST:([A-Z_ ]+)\]/
const HSN_PATTERN = /\[HSN_REQUEST:([^\]]+)\]/

export function useChat({ onBuyerRequest, onHsnRequest } = {}) {
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const { balance, deduct } = useCredits()

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || streaming) return
    if (balance != null && balance < 1) {
      setMessages((prev) => [...prev, { role: 'user', content: text.trim() },
        { role: 'assistant', content: "You're out of credits. Top up on the Credits page to keep chatting." }])
      return
    }

    const userText = text.trim()
    setMessages((prev) => [...prev, { role: 'user', content: userText }])
    setStreaming(true)
    setStreamingText('')

    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))

    try {
      const fullText = await streamChat({ message: userText, history }, setStreamingText, () => {})

      const buyerMatch = fullText.match(BUYER_PATTERN)
      const hsnMatch = fullText.match(HSN_PATTERN)
      // Strip both tags so they never show up as literal brackets in the
      // chat bubble — they're routing signals for the app, not for the user.
      const displayText = fullText.replace(BUYER_PATTERN, '').replace(HSN_PATTERN, '').trim()

      setMessages((prev) => [...prev, { role: 'assistant', content: displayText }])
      setStreamingText('')
      deduct(1, 'AI chat query')

      if (buyerMatch) onBuyerRequest?.(buyerMatch[1].trim())
      if (hsnMatch) onHsnRequest?.(hsnMatch[1].trim())
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection failed. Try again shortly.' }])
      setStreamingText('')
    } finally {
      setStreaming(false)
    }
  }, [messages, streaming, balance, deduct, onBuyerRequest, onHsnRequest])

  return { messages, streaming, streamingText, sendMessage }
}
