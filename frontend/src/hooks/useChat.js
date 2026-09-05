import { useState, useCallback } from 'react'
import { streamChat } from '../api/chat'
import { useCredits } from '../context/CreditsContext'

const BUYER_PATTERN = /\[BUYER_REQUEST:([A-Z_ ]+)\]/

export function useChat({ onBuyerRequest } = {}) {
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
      setMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
      setStreamingText('')
      deduct(1, 'AI chat query')

      const match = fullText.match(BUYER_PATTERN)
      if (match) onBuyerRequest?.(match[1].trim())
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection failed. Try again shortly.' }])
      setStreamingText('')
    } finally {
      setStreaming(false)
    }
  }, [messages, streaming, balance, deduct, onBuyerRequest])

  return { messages, streaming, streamingText, sendMessage }
}
