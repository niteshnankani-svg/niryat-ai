import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const API_URL = 'https://backend-production-a3c6.up.railway.app'
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD'

const TOPICS = [
  { icon: '🚀', label: 'Getting Started', query: 'How do I start exporting from India? Give me a step-by-step beginner guide.' },
  { icon: '📄', label: 'Documents', query: 'What documents do I need for exporting goods from India?' },
  { icon: '💳', label: 'Payment & LC', query: 'Explain payment terms in export — Advance, LC, DP, DA with examples.' },
  { icon: '📊', label: 'Costing', query: 'How do I calculate FOB, CFR and CIF price for my export product?' },
  { icon: '🏛️', label: 'Govt Schemes', query: 'What government schemes and incentives are available for Indian exporters?' },
  { icon: '🌍', label: 'Find Buyers', query: 'How do I find international buyers for my products?' },
]

const SUGGESTED = [
  { icon: '📋', text: 'How do I get an IEC code?' },
  { icon: '💰', text: 'How do I calculate FOB price?' },
  { icon: '🏦', text: 'What is a Letter of Credit?' },
  { icon: '🎁', text: 'Which government schemes can I claim?' },
  { icon: '🤝', text: 'Show me buyers in UAE' },
  { icon: '📦', text: 'What documents do I need to export?' },
]

const BUYER_PATTERN = /\[BUYER_REQUEST:([A-Z_ ]+)\]/

function BuyerCard({ lead }) {
  return (
    <div className="buyer-card">
      <div className="buyer-card-header">
        <span className="buyer-avatar">{lead.company[0]}</span>
        <div>
          <div className="buyer-company">{lead.company}</div>
          <div className="buyer-city">{lead.city}</div>
        </div>
      </div>
      <div className="buyer-details">
        <div className="buyer-detail"><span className="detail-icon">📦</span>{lead.product}</div>
        <div className="buyer-detail"><span className="detail-icon">👤</span>{lead.contact_person}</div>
        <div className="buyer-detail"><span className="detail-icon">📧</span>{lead.email}</div>
        <div className="buyer-detail"><span className="detail-icon">📞</span>{lead.phone}</div>
      </div>
    </div>
  )
}

function TradeDataTable({ data, exchangeRate, currency }) {
  if (!data || data.length === 0) return null

  const valueKeys = Object.keys(data[0]).filter(k =>
    k.match(/^\d{4}/) || k === '%Share' || k === '%Growth'
  )

  return (
    <div className="trade-section">
      <div className="trade-header-bar">
        <h3>DGFT Trade Statistics</h3>
        <div className="trade-meta">
          {exchangeRate && <span className="exchange-badge">1 USD = {exchangeRate} INR</span>}
          <span className="result-count">{data.length} results</span>
        </div>
      </div>
      <div className="trade-table-wrap">
        <table className="trade-table">
          <thead>
            <tr>
              <th>#</th>
              <th>HS Code</th>
              <th>Commodity</th>
              {valueKeys.map(k => {
                if (k === '%Share' || k === '%Growth') return <th key={k}>{k}</th>
                const label = currency === 'INR' ? `${k} (Cr)` : `${k} ($M)`
                return <th key={k}>{label}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 30).map((row, i) => (
              <tr key={i}>
                <td className="td-num">{row['S.No.'] || i + 1}</td>
                <td className="td-code">{row['HSCode']}</td>
                <td className="td-commodity">{row['Commodity']}</td>
                {valueKeys.map(k => {
                  let val = row[k] || ''
                  if (currency === 'INR' && k.match(/^\d{4}/) && exchangeRate && val) {
                    const num = parseFloat(val.replace(/,/g, ''))
                    if (!isNaN(num)) {
                      val = (num * exchangeRate / 10).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                  }
                  const isGrowth = k === '%Growth'
                  const growthClass = isGrowth && val ? (parseFloat(val) >= 0 ? 'positive' : 'negative') : ''
                  return <td key={k} className={`td-val ${growthClass}`}>{val}{isGrowth && val ? '%' : ''}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 30 && (
        <div className="trade-table-note">Showing top 30 of {data.length} results</div>
      )}
    </div>
  )
}

function TradeDataModal({ onClose, onSubmit }) {
  const [hsCode, setHsCode] = useState('')
  const [year, setYear] = useState('2024')
  const [tradeType, setTradeType] = useState('export')

  function handleSubmit(e) {
    e.preventDefault()
    if (!hsCode.trim()) return
    onSubmit({ hs_code: hsCode.trim(), year: `${year}-${parseInt(year) + 1}`, trade_type: tradeType })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-icon">📈</div>
        <h3>DGFT Trade Data</h3>
        <p className="modal-sub">Live data from tradestat.commerce.gov.in</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>HS Code</label>
            <input
              type="text"
              value={hsCode}
              onChange={e => setHsCode(e.target.value)}
              placeholder="e.g. 0902 (Tea), 6203 (Garments)"
              maxLength={8}
              autoFocus
            />
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Year</label>
              <select value={year} onChange={e => setYear(e.target.value)}>
                <option value="2025">2025-2026</option>
                <option value="2024">2024-2025</option>
                <option value="2023">2023-2024</option>
                <option value="2022">2022-2023</option>
                <option value="2021">2021-2022</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Type</label>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn ${tradeType === 'export' ? 'active' : ''}`}
                  onClick={() => setTradeType('export')}>Export</button>
                <button type="button" className={`toggle-btn ${tradeType === 'import' ? 'active' : ''}`}
                  onClick={() => setTradeType('import')}>Import</button>
              </div>
            </div>
          </div>
          <button type="submit" className="modal-submit">Search Trade Data</button>
        </form>
      </div>
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
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')
}

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [buyerLeads, setBuyerLeads] = useState(null)
  const [tradeData, setTradeData] = useState(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeLoading, setTradeLoading] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(null)
  const [currency, setCurrency] = useState('USD')
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetch(EXCHANGE_API)
      .then(r => r.json())
      .then(d => setExchangeRate(d.rates?.INR || 85))
      .catch(() => setExchangeRate(85))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, tradeData])

  async function fetchBuyerLeads(country) {
    try {
      const res = await fetch(`${API_URL}/buyerleads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, product: '', user_email: '' }),
      })
      const data = await res.json()
      if (data.leads && data.leads.length > 0) setBuyerLeads(data)
    } catch (e) {
      console.error('Buyer leads error:', e)
    }
  }

  async function fetchTradeData({ hs_code, year, trade_type }) {
    setTradeLoading(true)
    setTradeData(null)
    setMessages(prev => [...prev, {
      role: 'user',
      content: `Show ${trade_type} trade data for HS Code ${hs_code} (${year})`
    }])
    try {
      const res = await fetch(`${API_URL}/tradedata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hs_code, year, trade_type }),
      })
      const result = await res.json()
      if (result.data && result.data.length > 0) {
        setTradeData(result.data)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Found ${result.data.length} ${trade_type} commodit${result.data.length === 1 ? 'y' : 'ies'} for HS ${hs_code} (${year}). Toggle USD/INR below the table.`
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `No trade data found for HS Code ${hs_code} in ${year}. Try a broader code (2-digit) or different year.`
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Could not fetch trade data. DGFT server may be temporarily unavailable.'
      }])
    } finally {
      setTradeLoading(false)
    }
  }

  const checkBuyerLeads = useCallback(async (userText, aiText) => {
    const buyerMatch = aiText.match(BUYER_PATTERN)
    if (buyerMatch) { await fetchBuyerLeads(buyerMatch[1].trim()); return }
    const lt = userText.toLowerCase()
    if (lt.includes('buyer') && (lt.includes(' in ') || lt.includes(' from '))) {
      const countries = ['UAE','USA','UK','Germany','Saudi Arabia','China','Japan','Singapore',
        'Australia','Canada','Netherlands','France','Italy','Spain','Belgium','South Korea',
        'Malaysia','Thailand','Vietnam','Indonesia','Bangladesh','Sri Lanka','Nepal',
        'South Africa','Nigeria','Kenya','Egypt','Turkey','Brazil','Mexico','Russia',
        'Poland','Sweden','Norway','Denmark','Switzerland','Austria','New Zealand','Israel','Qatar','Kuwait']
      for (const c of countries) {
        if (lt.includes(c.toLowerCase())) { await fetchBuyerLeads(c); break }
      }
    }
  }, [])

  async function sendMessage(text) {
    if (!text.trim() || streaming) return
    const userText = text.trim()
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setInput('')
    setStreaming(true)
    setStreamingText('')
    setBuyerLeads(null)
    setTradeData(null)
    let fullText = ''
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history }),
      })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
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
            if (parsed.chunk) { fullText += parsed.chunk; setStreamingText(fullText) }
          } catch { /* skip */ }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: fullText }])
      setStreamingText('')
      await checkBuyerLeads(userText, fullText)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant', content: fullText || 'Could not connect to server.'
      }])
      setStreamingText('')
    } finally { setStreaming(false) }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const showWelcome = messages.length === 0 && !streaming

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo-mark">N</div>
          <div className="header-text">
            <h1>NiryatAI</h1>
            <span className="tagline">India Export Intelligence</span>
          </div>
        </div>
        <div className="header-right">
          {exchangeRate && <span className="rate-badge">$ = {exchangeRate.toFixed(1)}</span>}
        </div>
      </header>

      <div className="topics-bar">
        {TOPICS.map(t => (
          <button key={t.label} className="topic-btn" onClick={() => sendMessage(t.query)}
            disabled={streaming || tradeLoading}>
            <span className="topic-icon">{t.icon}</span>{t.label}
          </button>
        ))}
        <button className="topic-btn trade-data-btn" onClick={() => setShowTradeModal(true)}
          disabled={streaming || tradeLoading}>
          <span className="topic-icon">📈</span>Trade Data
        </button>
      </div>

      {showTradeModal && (
        <TradeDataModal onClose={() => setShowTradeModal(false)} onSubmit={fetchTradeData} />
      )}

      <main className="chat-area">
        {showWelcome && (
          <div className="welcome">
            <div className="welcome-glow" />
            <div className="welcome-badge">Powered by Claude AI + DGFT Data</div>
            <h2>Welcome to <span className="gradient-text">NiryatAI</span></h2>
            <p>Your AI-powered export mentor. Ask anything about exporting from India.</p>
            <div className="suggestions">
              {SUGGESTED.map(q => (
                <button key={q.text} className="suggestion-btn" onClick={() => sendMessage(q.text)}>
                  <span className="sug-icon">{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && <div className="avatar ai-avatar">N</div>}
            <div className="bubble">
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              ) : msg.content}
            </div>
            {msg.role === 'user' && <div className="avatar user-avatar">U</div>}
          </div>
        ))}

        {streaming && (
          <div className="message assistant">
            <div className="avatar ai-avatar">N</div>
            <div className="bubble">
              {streamingText ? (
                <><div dangerouslySetInnerHTML={{ __html: formatMessage(streamingText) }} /><span className="cursor-blink" /></>
              ) : (
                <span className="cursor-blink" />
              )}
            </div>
          </div>
        )}

        {tradeLoading && (
          <div className="message assistant">
            <div className="avatar ai-avatar">N</div>
            <div className="bubble">
              Fetching live data from DGFT TradeStat<span className="loading-ellipsis" />
            </div>
          </div>
        )}

        {tradeData && (
          <>
            <div className="currency-toggle">
              <button className={currency === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')}>USD ($M)</button>
              <button className={currency === 'INR' ? 'active' : ''} onClick={() => setCurrency('INR')}>INR (Cr)</button>
            </div>
            <TradeDataTable data={tradeData} exchangeRate={exchangeRate} currency={currency} />
          </>
        )}

        {buyerLeads && buyerLeads.leads && buyerLeads.leads.length > 0 && (
          <div className="buyer-leads-section">
            <h3>🌍 Buyer Leads {buyerLeads.premium ? '' : '(Free Preview)'}</h3>
            <div className="buyer-grid">
              {buyerLeads.leads.map((lead, i) => <BuyerCard key={i} lead={lead} />)}
            </div>
            {!buyerLeads.premium && (
              <div className="premium-cta">
                <span>🔓</span> Unlock full contact details with Premium
              </div>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      <footer className="input-area">
        <div className="input-wrapper">
          <textarea className="chat-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about IEC, Incoterms, documents, buyers, costing..."
            rows={1} disabled={streaming} />
          <button className="send-btn" onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
