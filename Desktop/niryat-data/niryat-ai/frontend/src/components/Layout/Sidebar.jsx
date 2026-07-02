import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useProducts } from '../../hooks/useProducts'

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/trade', icon: '📈', label: 'Trade Data', badgeKey: 'products' },
  { to: '/buyers', icon: '🌍', label: 'Find Buyers', badgeKey: 'countries' },
  { to: '/guide', icon: '🚀', label: 'Getting Started' },
  { to: '/documents', icon: '📄', label: 'Documents' },
  { to: '/payment', icon: '💳', label: 'Payment & LC' },
  { to: '/costing', icon: '🧮', label: 'Costing' },
  { to: '/schemes', icon: '🏛️', label: 'Govt Schemes' },
  { to: '/credits', icon: '💰', label: 'Credits' },
]

const BUYER_COUNTRIES = 41

export default function Sidebar({ open, onClose }) {
  const { products } = useProducts()
  const [fxRate, setFxRate] = useState(null)

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then((r) => r.json())
      .then((d) => setFxRate(d.rates?.INR || 85))
      .catch(() => setFxRate(85))
  }, [])

  const badgeValue = (key) => {
    if (key === 'products') return products.length || null
    if (key === 'countries') return BUYER_COUNTRIES
    return null
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`w-60 shrink-0 h-screen fixed lg:sticky top-0 z-40 bg-[#13151C] border-r border-white/[.06] flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center font-bold text-white text-sm">N</div>
          <span className="font-bold text-[#F1F5F9]">NiryatAI</span>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors ${
                  isActive
                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                    : 'text-[#94A3B8] hover:bg-white/[.04] hover:text-[#F1F5F9] border border-transparent'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badgeKey && badgeValue(item.badgeKey) && (
                <span className="text-[10px] font-mono bg-white/[.06] text-[#94A3B8] px-1.5 py-0.5 rounded-full">
                  {badgeValue(item.badgeKey)}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/[.06]">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            {fxRate ? `₹${fxRate.toFixed(2)} / USD` : 'Loading rate...'}
          </div>
        </div>
      </aside>
    </>
  )
}
