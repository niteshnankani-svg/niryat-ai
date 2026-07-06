import { PAYMENT_METHODS } from '../data/static'
import PageHeader from '../components/shared/PageHeader'
import { Stagger } from '../components/motion/Motion'
import Icon from '../lib/icons'

const RISK_STYLE = {
  Safest: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  'Very safe': 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  Medium: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  Risky: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
}

function Meta({ icon, label, value }) {
  return (
    <div className="flex flex-col items-end">
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[#64748B]">
        <Icon name={icon} className="w-3 h-3" /> {label}
      </span>
      <span className="text-sm font-mono text-[#CBD5E1]">{value}</span>
    </div>
  )
}

export default function Payment() {
  return (
    <div>
      <PageHeader
        icon="payment"
        title="Payment & Letter of Credit"
        subtitle="Choose payment terms based on how well you trust the buyer."
      />

      <Stagger className="flex flex-col gap-3">
        {PAYMENT_METHODS.map((m) => (
          <Stagger.Item key={m.name}>
            <div className="card card-hover p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#F1F5F9]">{m.name}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-[16px] border ${RISK_STYLE[m.risk]}`}>{m.risk}</span>
                </div>
                <div className="text-sm text-[#94A3B8]">{m.description}</div>
              </div>
              <div className="flex items-center gap-6 shrink-0 pl-0 sm:pl-4 sm:border-l border-white/[.06]">
                <Meta icon="calendar" label="Speed" value={m.speed} />
                <Meta icon="banknote" label="Cost" value={m.cost} />
              </div>
            </div>
          </Stagger.Item>
        ))}
      </Stagger>
    </div>
  )
}
