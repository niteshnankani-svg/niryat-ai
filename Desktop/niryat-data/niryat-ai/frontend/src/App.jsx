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
  { icon: '📈', label: 'Trade Data', special: 'trade' },
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

/* ─── Components ─── */

function BuyerCard({ lead, locked }) {
  const isLocked = locked && lead.email?.includes('🔒')
  return (
    <div className={`buyer-card ${isLocked ? 'locked' : ''}`}>
      {isLocked && <div className="lock-badge">🔒</div>}
      <div className="bc-header">
        <div className="bc-avatar">{lead.company[0]}</div>
        <div className="bc-info">
          <div className="bc-name">{lead.company}</div>
          <div className="bc-city">{lead.city}</div>
        </div>
      </div>
      <div className="bc-product">{lead.product}</div>
      <div className="bc-contacts">
        <div className={`bc-row ${isLocked ? 'blur' : ''}`}>
          <span className="bc-label">Contact</span>
          <span className="bc-value">{lead.contact_person}</span>
        </div>
        <div className={`bc-row ${isLocked ? 'blur' : ''}`}>
          <span className="bc-label">Email</span>
          <span className="bc-value">{lead.email}</span>
        </div>
        <div className={`bc-row ${isLocked ? 'blur' : ''}`}>
          <span className="bc-label">Phone</span>
          <span className="bc-value">{lead.phone}</span>
        </div>
      </div>
    </div>
  )
}

function TradeDataTable({ data, exchangeRate, currency }) {
  if (!data || data.length === 0) return null
  const valueKeys = Object.keys(data[0]).filter(k => k.match(/^\d{4}/) || k === '%Share' || k === '%Growth')
  return (
    <div className="trade-section animate-in">
      <div className="trade-bar">
        <div className="trade-bar-left">
          <span className="trade-dot" />
          <span className="trade-title">DGFT Trade Statistics</span>
        </div>
        <div className="trade-bar-right">
          {exchangeRate && <span className="fx-pill">1 USD = ₹{exchangeRate.toFixed(1)}</span>}
          <span className="count-pill">{data.length} results</span>
        </div>
      </div>
      <div className="trade-scroll">
        <table className="trade-table">
          <thead>
            <tr>
              <th className="th-num">#</th>
              <th className="th-code">HS Code</th>
              <th>Commodity</th>
              {valueKeys.map(k => {
                if (k === '%Share' || k === '%Growth') return <th key={k} className="th-right">{k}</th>
                return <th key={k} className="th-right">{currency === 'INR' ? `${k} (₹Cr)` : `${k} ($M)`}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 30).map((row, i) => (
              <tr key={i}>
                <td className="td-num">{row['S.No.'] || i + 1}</td>
                <td className="td-code">{row['HSCode']}</td>
                <td className="td-comm">{row['Commodity']}</td>
                {valueKeys.map(k => {
                  let val = row[k] || ''
                  if (currency === 'INR' && k.match(/^\d{4}/) && exchangeRate && val) {
                    const num = parseFloat(val.replace(/,/g, ''))
                    if (!isNaN(num)) val = (num * exchangeRate / 10).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  const isGrowth = k === '%Growth'
                  const cls = isGrowth && val ? (parseFloat(val) >= 0 ? 'green' : 'red') : ''
                  return <td key={k} className={`td-right ${cls}`}>{val}{isGrowth && val ? '%' : ''}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 30 && <div className="trade-footer">Showing 30 of {data.length}</div>}
    </div>
  )
}

function MarketIntelCard({ intel }) {
  if (!intel || intel.world_imports_usd_m == null) return null
  const fmt = (n) => n == null ? '—' : n >= 1000 ? `$${(n / 1000).toFixed(1)}B` : `$${Math.round(n)}M`
  const yoy = intel.dgft_yoy_growth_pct
  const yoyColor = yoy == null ? '' : yoy >= 0 ? 'intel-green' : 'intel-red'
  return (
    <div className="intel-card animate-in">
      <div className="intel-header">
        <span className="intel-dot" />
        <span className="intel-title">World Market · {intel.commodity || `HS ${intel.hs_code}`}</span>
        <span className="intel-badge">Comtrade 2023</span>
      </div>
      <div className="intel-grid">
        <div className="intel-stat">
          <div className="intel-val">{fmt(intel.world_imports_usd_m)}</div>
          <div className="intel-lbl">World imports</div>
        </div>
        <div className="intel-stat">
          <div className="intel-val">{fmt(intel.india_exports_usd_m)}</div>
          <div className="intel-lbl">India exports</div>
        </div>
        <div className="intel-stat">
          <div className="intel-val">{intel.india_share_pct != null ? `${intel.india_share_pct}%` : '—'}</div>
          <div className="intel-lbl">India's share</div>
        </div>
        <div className="intel-stat">
          <div className={`intel-val ${yoyColor}`}>{yoy != null ? `${yoy > 0 ? '+' : ''}${yoy}%` : '—'}</div>
          <div className="intel-lbl">YoY growth</div>
        </div>
      </div>
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
    <div className="overlay" onClick={onClose}>
      <div className="modal animate-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div className="modal-header">
          <div className="modal-icon-wrap"><span>📈</span></div>
          <h3>Trade Data Lookup</h3>
          <p>Live statistics from DGFT TradeStat</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>HS Code</label>
            <input type="text" value={hsCode} onChange={e => setHsCode(e.target.value)}
              placeholder="0902, 6203, 1006..." maxLength={8} autoFocus />
          </div>
          <div className="field-row">
            <div className="field f1">
              <label>Year</label>
              <select value={year} onChange={e => setYear(e.target.value)}>
                <option value="2025">2025-26</option>
                <option value="2024">2024-25</option>
                <option value="2023">2023-24</option>
                <option value="2022">2022-23</option>
              </select>
            </div>
            <div className="field f1">
              <label>Type</label>
              <div className="seg">
                <button type="button" className={tradeType === 'export' ? 'active' : ''} onClick={() => setTradeType('export')}>Export</button>
                <button type="button" className={tradeType === 'import' ? 'active' : ''} onClick={() => setTradeType('import')}>Import</button>
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>
    </div>
  )
}

function UnlockModal({ onClose, onSubmit }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [product, setProduct] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    onSubmit({ email: email.trim(), name: name.trim(), product: product.trim() })
    onClose()
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal animate-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div className="modal-header">
          <div className="modal-icon-wrap green"><span>🔓</span></div>
          <h3>Unlock Buyer Contacts</h3>
          <p>Free access to verified emails & phone numbers</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus />
          </div>
          <div className="field-row">
            <div className="field f1">
              <label>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="field f1">
              <label>Product</label>
              <input type="text" value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Rice, Spices" />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-green">Unlock All Contacts</button>
          <p className="fine">No payment required. No spam.</p>
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
    .replace(/---/g, '<hr/>')
    .replace(/\n/g, '<br/>')
}

/* ─── App ─── */

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [buyerLeads, setBuyerLeads] = useState(null)
  const [tradeData, setTradeData] = useState(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeIntel, setTradeIntel] = useState(null)
  const [exchangeRate, setExchangeRate] = useState(null)
  const [currency, setCurrency] = useState('USD')
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('niryatai_email') || '')
  const [lastBuyerCountry, setLastBuyerCountry] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetch(EXCHANGE_API).then(r => r.json()).then(d => setExchangeRate(d.rates?.INR || 85)).catch(() => setExchangeRate(85))
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingText, tradeData])

  async function handleUnlock({ email, name, product }) {
    try {
      await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, product }) })
      localStorage.setItem('niryatai_email', email)
      setUserEmail(email)
      if (lastBuyerCountry) {
        const res = await fetch(`${API_URL}/buyerleads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: lastBuyerCountry, product: '', user_email: email }) })
        const data = await res.json()
        if (data.leads?.length > 0) setBuyerLeads(data)
      }
    } catch (e) { console.error('Registration error:', e) }
  }

  async function fetchBuyerLeads(country) {
    setLastBuyerCountry(country)
    try {
      const res = await fetch(`${API_URL}/buyerleads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country, product: '', user_email: userEmail }) })
      const data = await res.json()
      if (data.leads?.length > 0) setBuyerLeads(data)
    } catch (e) { console.error('Buyer leads error:', e) }
  }

  async function fetchTradeData({ hs_code, year, trade_type }) {
    setTradeLoading(true); setTradeData(null)
    setMessages(prev => [...prev, { role: 'user', content: `Show ${trade_type} data for HS ${hs_code} (${year})` }])
    try {
      const res = await fetch(`${API_URL}/tradedata`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hs_code, year, trade_type }) })
      const result = await res.json()
      if (result.intel) setTradeIntel(result.intel)
      if (result.data?.length > 0) {
        setTradeData(result.data)
        setMessages(prev => [...prev, { role: 'assistant', content: `Found ${result.data.length} commodit${result.data.length === 1 ? 'y' : 'ies'} for HS ${hs_code}. Toggle USD/INR below.` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `No data found for HS ${hs_code} in ${year}. Try a 2-digit code or different year.` }])
      }
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'DGFT server unavailable. Try again shortly.' }]) }
    finally { setTradeLoading(false) }
  }

  const checkBuyerLeads = useCallback(async (userText, aiText) => {
    const m = aiText.match(BUYER_PATTERN)
    if (m) { await fetchBuyerLeads(m[1].trim()); return }
    const lt = userText.toLowerCase()
    if (lt.includes('buyer') && (lt.includes(' in ') || lt.includes(' from '))) {
      const countries = ['UAE','USA','UK','Germany','Saudi Arabia','China','Japan','Singapore','Australia','Canada','Netherlands','France','Italy','Spain','Belgium','South Korea','Malaysia','Thailand','Vietnam','Indonesia','Bangladesh','Sri Lanka','Nepal','South Africa','Nigeria','Kenya','Egypt','Turkey','Brazil','Mexico','Russia','Poland','Sweden','Norway','Denmark','Switzerland','Austria','New Zealand','Israel','Qatar','Kuwait']
      for (const c of countries) { if (lt.includes(c.toLowerCase())) { await fetchBuyerLeads(c); break } }
    }
  }, [userEmail])

  async function sendMessage(text) {
    if (!text.trim() || streaming) return
    const userText = text.trim()
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setInput(''); setStreaming(true); setStreamingText(''); setBuyerLeads(null); setTradeData(null); setTradeIntel(null)
    let fullText = ''
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API_URL}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userText, history }) })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n'); buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try { const p = JSON.parse(payload); if (p.chunk) { fullText += p.chunk; setStreamingText(fullText) } } catch {}
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]); setStreamingText('')
      await checkBuyerLeads(userText, fullText)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: fullText || 'Connection failed.' }]); setStreamingText('')
    } finally { setStreaming(false) }
  }

  function handleKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }
  function handleTopicClick(t) { t.special === 'trade' ? setShowTradeModal(true) : sendMessage(t.query) }

  const showWelcome = messages.length === 0 && !streaming

  return (
    <div className="app">
      {/* Header */}
      <header className="hdr">
        <div className="hdr-left">
          <div className="mark">N</div>
          <div><div className="hdr-title">NiryatAI</div><div className="hdr-sub">Export Intelligence</div></div>
        </div>
        {exchangeRate && <div className="fx">₹{exchangeRate.toFixed(1)}<span>/USD</span></div>}
      </header>

      {/* Topics */}
      <nav className="nav">
        {TOPICS.map(t => (
          <button key={t.label} className={`pill ${t.special ? 'pill-accent' : ''}`}
            onClick={() => handleTopicClick(t)} disabled={streaming || tradeLoading}>
            <span className="pill-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {/* Modals */}
      {showTradeModal && <TradeDataModal onClose={() => setShowTradeModal(false)} onSubmit={fetchTradeData} />}
      {showUnlockModal && <UnlockModal onClose={() => setShowUnlockModal(false)} onSubmit={handleUnlock} />}

      {/* Chat */}
      <main className="chat">
        {showWelcome && (
          <div className="welcome animate-in">
            <div className="w-glow" />
            <div className="w-chip">Powered by Claude AI + 20K document chunks</div>
            <h2 className="w-title">Your export journey<br/>starts here.</h2>
            <p className="w-desc">Ask anything about IEC, Incoterms, documents, buyers, costing, government schemes.</p>
            <div className="w-grid">
              {SUGGESTED.map(q => (
                <button key={q.text} className="w-card" onClick={() => sendMessage(q.text)}>
                  <span className="w-card-icon">{q.icon}</span>
                  <span className="w-card-text">{q.text}</span>
                  <span className="w-card-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role} animate-in`}>
            {msg.role === 'assistant' && <div className="av av-ai">N</div>}
            <div className="bbl">
              {msg.role === 'assistant'
                ? <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                : msg.content}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="msg assistant animate-in">
            <div className="av av-ai">N</div>
            <div className="bbl">
              {streamingText
                ? <><div dangerouslySetInnerHTML={{ __html: formatMessage(streamingText) }} /><span className="caret" /></>
                : <span className="caret" />}
            </div>
          </div>
        )}

        {tradeLoading && (
          <div className="msg assistant animate-in">
            <div className="av av-ai">N</div>
            <div className="bbl">Fetching from DGFT<span className="dots" /></div>
          </div>
        )}

        {(tradeIntel || tradeData) && (
          <div className="animate-in">
            <MarketIntelCard intel={tradeIntel} />
            {tradeData && <>
              <div className="cur-toggle">
                <button className={currency === 'USD' ? 'on' : ''} onClick={() => setCurrency('USD')}>USD</button>
                <button className={currency === 'INR' ? 'on' : ''} onClick={() => setCurrency('INR')}>INR</button>
              </div>
              <TradeDataTable data={tradeData} exchangeRate={exchangeRate} currency={currency} />
            </>}
          </div>
        )}

        {buyerLeads?.leads?.length > 0 && (
          <div className="leads-section animate-in">
            <div className="leads-bar">
              <span className="leads-title">Buyer Leads · {buyerLeads.leads.length} found</span>
              {(buyerLeads.premium || buyerLeads.registered) && <span className="unlocked-pill">✓ Unlocked</span>}
            </div>
            <div className="leads-grid">
              {buyerLeads.leads.map((l, i) => <BuyerCard key={i} lead={l} locked={!buyerLeads.premium && !buyerLeads.registered} />)}
            </div>
            {!buyerLeads.premium && !buyerLeads.registered && (
              <button className="unlock-btn" onClick={() => setShowUnlockModal(true)}>
                Unlock all contacts — free
              </button>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Input */}
      <footer className="footer">
        <div className="input-row">
          <textarea className="inp" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="Ask about exports..." rows={1} disabled={streaming} />
          <button className="send" onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
