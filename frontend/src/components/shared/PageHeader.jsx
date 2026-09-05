import Icon from '../../lib/icons'
import { Reveal } from '../motion/Motion'

/**
 * Standard page header: tinted icon tile + title, subtitle, optional right-aligned action.
 * Wrapped in Reveal so every page enters with the same motion rhythm.
 */
export default function PageHeader({ icon, title, subtitle, action, tint = 'amber' }) {
  const tints = {
    amber: 'bg-[#F59E0B]/12 text-[#F59E0B]',
    green: 'bg-[#10B981]/12 text-[#10B981]',
    purple: 'bg-[#A78BFA]/12 text-[#A78BFA]',
    blue: 'bg-[#60A5FA]/12 text-[#60A5FA]',
  }
  return (
    <Reveal className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${tints[tint]}`}>
            <Icon name={icon} className="w-5 h-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#F1F5F9] tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[#94A3B8] mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  )
}
