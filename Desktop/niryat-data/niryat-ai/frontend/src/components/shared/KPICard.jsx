import Icon from '../../lib/icons'

/**
 * KPI stat card. `icon` is a Lucide icon-registry name (see lib/icons).
 * Accent tint options let callers vary the icon-tile color.
 */
const TINTS = {
  amber: 'bg-[#F59E0B]/12 text-[#F59E0B]',
  green: 'bg-[#10B981]/12 text-[#10B981]',
  purple: 'bg-[#A78BFA]/12 text-[#A78BFA]',
  blue: 'bg-[#60A5FA]/12 text-[#60A5FA]',
}

export default function KPICard({ icon, label, value, sub, tint = 'amber' }) {
  return (
    <div className="card card-hover p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${TINTS[tint] || TINTS.amber}`}>
          <Icon name={icon} className="w-5 h-5" />
        </span>
        {sub && <span className="text-xs font-mono text-[#64748B]">{sub}</span>}
      </div>
      <div>
        <div className="text-2xl font-bold text-[#F1F5F9] font-mono truncate tracking-tight" title={typeof value === 'string' ? value : undefined}>{value}</div>
        <div className="text-sm text-[#94A3B8] mt-0.5">{label}</div>
      </div>
    </div>
  )
}
