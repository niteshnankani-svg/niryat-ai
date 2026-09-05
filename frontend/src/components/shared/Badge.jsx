const VARIANTS = {
  strong:    'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  moderate:  'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  saturated: 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/30',
  hard:      'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
  neutral:   'bg-white/5 text-[#94A3B8] border-white/10',
}

export function signalVariant(signal = '') {
  const s = signal.toLowerCase()
  if (s.includes('saturated')) return 'saturated'
  if (s.includes('strong')) return 'strong'
  if (s.includes('hard')) return 'hard'
  if (s.includes('moderate')) return 'moderate'
  return 'neutral'
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[16px] border text-xs font-medium whitespace-nowrap ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
