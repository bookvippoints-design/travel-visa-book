import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu, X } from 'lucide-react'

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{background: '#F8F9FB'}}>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`fixed left-0 top-0 h-screen z-40 transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 min-w-0">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-20">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#B8860B'}}>
              <span style={{color:'#fff', fontSize:12}}>✈</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Travel Visa Book</span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
