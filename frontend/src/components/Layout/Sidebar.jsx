import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useProducts } from '../../hooks/useProducts'
import Icon from '../../lib/icons'

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/trade', icon: 'trade', label: 'Trade Data', badgeKey: 'products' },
  { to: '/buyers', icon: 'buyers', label: 'Find Buyers', badgeKey: 'countries' },
  { to: '/guide', icon: 'guide', label: 'Getting Started' },
  { to: '/documents', icon: 'documents', label: 'Documents' },
  { to: '/payment', icon: 'payment', label: 'Payment & LC' },
  { to: '/costing', icon: 'costing', label: 'Costing' },
  { to: '/schemes', icon: 'schemes', label: 'Govt Schemes' },
  { to: '/insights', icon: 'sparkles', label: 'Expert Insights', badgeKey: 'insights' },
  { to: '/credits', icon: 'credits', label: 'Credits' },
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
    if (key === 'insights') return 10
    return null
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`w-60 shrink-0 h-screen fixed lg:sticky top-0 z-40 bg-[#13151C] border-r border-white/[.06] flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center font-bold text-white text-sm shadow-[0_4px_16px_-4px_rgba(245,158,11,0.6)]">N</div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[#F1F5F9] tracking-tight">NiryatAI</span>
            <span className="text-[10px] text-[#64748B] mt-0.5">Export Intelligence</span>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto pb-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors ${
                  isActive
                    ? 'text-[#F59E0B]'
                    : 'text-[#94A3B8] hover:bg-white/[.04] hover:text-[#F1F5F9]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-[10px] bg-[#F59E0B]/10 border border-[#F59E0B]/25"
                      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center">
                    <Icon name={item.icon} className={`w-[18px] h-[18px] transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                  </span>
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {item.badgeKey && badgeValue(item.badgeKey) && (
                    <span className="relative z-10 text-[10px] font-mono bg-white/[.06] text-[#94A3B8] px-1.5 py-0.5 rounded-full">
                      {badgeValue(item.badgeKey)}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/[.06]">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
            </span>
            {fxRate ? <span className="font-mono">₹{fxRate.toFixed(2)} / USD</span> : 'Loading rate...'}
          </div>
        </div>
      </aside>
    </>
  )
}
