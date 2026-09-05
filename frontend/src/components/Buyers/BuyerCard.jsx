import Icon from '../../lib/icons'

export default function BuyerCard({ lead, locked }) {
  return (
    <div className="card card-hover h-full p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] font-semibold flex items-center justify-center shrink-0">
          {lead.company?.[0] || '?'}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[#F1F5F9] truncate">{lead.company}</div>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <Icon name="mapPin" className="w-3 h-3" /> {lead.city}
          </div>
        </div>
      </div>
      <div className="text-sm text-[#94A3B8]">{lead.product}</div>
      <div className={`flex flex-col gap-2 text-sm mt-auto ${locked ? 'blur-locked' : ''}`}>
        <div className="flex items-center gap-2">
          <Icon name="user" className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span className="text-[#F1F5F9] truncate">{lead.contact_person}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="mail" className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span className="text-[#F1F5F9] truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="phone" className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span className="text-[#F1F5F9] truncate">{lead.phone}</span>
        </div>
      </div>
    </div>
  )
}
