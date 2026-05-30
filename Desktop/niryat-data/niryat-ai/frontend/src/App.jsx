import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8001'

const TOPICS = [
  { label: 'Getting Started', query: 'How do I start exporting from India? Give me a step-by-step beginner guide.' },
  { label: 'Documents', query: 'What documents do I need for exporting goods from India?' },
  { label: 'Payment & LC', query: 'Explain payment terms in export — Advance, LC, DP, DA with examples.' },
  { label: 'Costing', query: 'How do I calculate FOB, CFR and CIF price for my export product?' },
  { label: 'Govt Schemes', query: 'What government schemes and incentives are available for Indian exporters?' },
  { label: 'Find Buyers', query: 'How do I find international buyers for my products?' },
]

const SUGGESTED = [
  'How do I get an IEC code?',
  'How do I calculate FOB price?',
  'What is a Letter of Credit?',
  'Which government schemes can I claim?',
  'Show me buyers in UAE',
  'What documents do I need to export?',
]

const BUYER_PATTERN = /\[BUYER_REQUEST:([A-Z_ ]+)\]/

function LoadingDots() {
  return (
    <div className="loading-dots">
      <span /><span /><span />
    </div>
  )
}

function BuyerCard({ lead }) {
  return (
    <div className="buyer-card">
      <div className="buyer-company">{lead.company}</div>
      <div className="buyer-detail"><strong>Product:</strong> {lead.product}</div>
      <div className="buyer-detail"><strong>City:</strong> {lead.city}</div>
      <div className="buyer-detail"><strong>Contact:</strong> {lead.contact_person}</div>
      <div className="buyer-detail"><strong>Email:</strong> {lead.email}</div>
      <div className="buyer-detail"><strong>Phone:</strong> {lead.phone}</div>
    </div>
  )
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
    .replace(/\n/g, '<br/>')
}

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [buyerLeads, setBuyerLeads] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function fetchBuyerLeads(country) {
    try {
      const res = await fetch(`${API_URL}/buyerleads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, product: '', user_email: '' }),
      })
      const data = await res.json()
      if (data.leads && data.leads.length > 0) {
        setBuyerLeads(data)
      }
    } catch (e) {
      console.error('Buyer leads error:', e)
    }
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setBuyerLeads(null)

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      })

      const data = await res.json()
      const aiText = data.response || data.detail || 'Sorry, something went wrong.'
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }])

      const buyerMatch = aiText.match(BUYER_PATTERN)
      if (buyerMatch) {
        await fetchBuyerLeads(buyerMatch[1].trim())
      }

      const lowerText = text.toLowerCase()
      if (lowerText.includes('buyer') && (lowerText.includes(' in ') || lowerText.includes(' from '))) {
        const countries = ['UAE', 'USA', 'UK', 'Germany', 'Saudi Arabia', 'China', 'Japan',
          'Singapore', 'Australia', 'Canada', 'Netherlands', 'France', 'Italy', 'Spain',
          'Belgium', 'South Korea', 'Malaysia', 'Thailand', 'Vietnam', 'Indonesia',
          'Bangladesh', 'Sri Lanka', 'Nepal', 'South Africa', 'Nigeria', 'Kenya',
          'Egypt', 'Turkey', 'Brazil', 'Mexico', 'Russia', 'Poland', 'Sweden',
          'Norway', 'Denmark', 'Switzerland', 'Austria', 'New Zealand', 'Israel',
          'Qatar', 'Kuwait']
        for (const c of countries) {
          if (lowerText.includes(c.toLowerCase())) {
            await fetchBuyerLeads(c)
            break
          }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not connect to the server. Please make sure the backend is running on port 8001.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const showWelcome = messages.length === 0

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">&#x1F6E5;</span>
          <h1>NiryatAI</h1>
          <span className="tagline">India Export Intelligence</span>
        </div>
      </header>

      <div className="topics-bar">
        {TOPICS.map(t => (
          <button
            key={t.label}
            className="topic-btn"
            onClick={() => sendMessage(t.query)}
            disabled={loading}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="chat-area">
        {showWelcome && (
          <div className="welcome">
            <h2>Welcome to NiryatAI</h2>
            <p>Your AI-powered export mentor. Ask me anything about exporting from India.</p>
            <div className="suggestions">
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  className="suggestion-btn"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="bubble">
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="bubble">
              <LoadingDots />
            </div>
          </div>
        )}

        {buyerLeads && buyerLeads.leads && buyerLeads.leads.length > 0 && (
          <div className="buyer-leads-section">
            <h3>Buyer Leads {buyerLeads.premium ? '' : '(Free Preview)'}</h3>
            <div className="buyer-grid">
              {buyerLeads.leads.map((lead, i) => (
                <BuyerCard key={i} lead={lead} />
              ))}
            </div>
            {!buyerLeads.premium && (
              <div className="premium-cta">
                Unlock full contact details with Premium
              </div>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      <footer className="input-area">
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about IEC, Incoterms, documents, buyers, costing..."
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
