import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{background: '#F8F9FB'}}>
      <Sidebar />
      <main className="flex-1 ml-56 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
