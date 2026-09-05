export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search...', className = '' }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') onSubmit?.(value)
  }
  return (
    <div className={`flex items-center gap-2 bg-[#181B24] border border-white/[.06] rounded-[10px] px-3.5 py-2.5 focus-within:border-[rgba(245,158,11,0.3)] transition-colors ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#64748B] shrink-0">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-transparent outline-none text-sm text-[#F1F5F9] placeholder:text-[#64748B] w-full"
      />
    </div>
  )
}
