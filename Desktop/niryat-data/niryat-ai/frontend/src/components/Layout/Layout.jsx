import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import LoginModal from '../shared/LoginModal'
import ChatBubble from '../Chat/ChatBubble'

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0F1117]">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <LoginModal />
      <ChatBubble />
    </div>
  )
}
