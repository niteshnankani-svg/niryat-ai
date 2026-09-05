function formatMessage(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/---/g, '<hr/>')
    .replace(/\n/g, '<br/>')
}

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-2.5 animate-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-xs font-bold text-white shrink-0">
          N
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-[14px] px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#F59E0B] text-white rounded-tr-sm'
            : 'bg-[#181B24] text-[#CBD5E1] border border-white/[.06] rounded-tl-sm'
        }`}
      >
        {isUser ? content : <div dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />}
      </div>
    </div>
  )
}
