import { API_URL } from './client'

/**
 * Streams a chat response via SSE. Calls onChunk(text) as fragments arrive,
 * and onDone(fullText) once the stream completes.
 */
export async function streamChat({ message, history }, onChunk, onDone) {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') continue
      try {
        const parsed = JSON.parse(payload)
        if (parsed.chunk) {
          fullText += parsed.chunk
          onChunk(fullText)
        }
      } catch {
        // ignore malformed SSE payload
      }
    }
  }
  onDone(fullText)
  return fullText
}
