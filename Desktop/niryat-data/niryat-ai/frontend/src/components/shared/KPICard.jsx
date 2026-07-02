export default function KPICard({ icon, label, value, sub }) {
  return (
    <div className="bg-[#181B24] border border-white/[.06] rounded-[14px] p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-[#64748B]">{sub}</span>}
      </div>
      <div className="text-2xl font-bold text-[#F1F5F9] font-mono truncate" title={typeof value === 'string' ? value : undefined}>{value}</div>
      <div className="text-sm text-[#94A3B8]">{label}</div>
    </div>
  )
}
