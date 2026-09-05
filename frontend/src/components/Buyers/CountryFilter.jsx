const COUNTRIES = ['All', 'UAE', 'USA', 'UK', 'Germany', 'Saudi Arabia', 'Japan']

export default function CountryFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COUNTRIES.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`px-3.5 py-1.5 rounded-[16px] text-sm border transition-colors ${
            selected === c
              ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
              : 'bg-[#181B24] text-[#94A3B8] border-white/[.08] hover:border-[#F59E0B]/30'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
