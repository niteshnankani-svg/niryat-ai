export default function BuyerCard({ lead, locked }) {
  return (
    <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] font-semibold flex items-center justify-center shrink-0">
          {lead.company?.[0] || '?'}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[#F1F5F9] truncate">{lead.company}</div>
          <div className="text-xs text-[#64748B]">{lead.city}</div>
        </div>
      </div>
      <div className="text-sm text-[#94A3B8]">{lead.product}</div>
      <div className={`flex flex-col gap-1.5 text-sm ${locked ? 'blur-locked' : ''}`}>
        <div className="flex justify-between"><span className="text-[#64748B]">Contact</span><span className="text-[#F1F5F9]">{lead.contact_person}</span></div>
        <div className="flex justify-between"><span className="text-[#64748B]">Email</span><span className="text-[#F1F5F9] truncate ml-2">{lead.email}</span></div>
        <div className="flex justify-between"><span className="text-[#64748B]">Phone</span><span className="text-[#F1F5F9]">{lead.phone}</span></div>
      </div>
    </div>
  )
}
