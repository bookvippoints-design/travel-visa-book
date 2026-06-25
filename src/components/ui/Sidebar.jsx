import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FileText, Plus, Settings, CreditCard,
  LogOut, Plane, Users, BarChart2, ShieldCheck, Building2
} from 'lucide-react'

const companyLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents/new', icon: Plus, label: 'Nueva Carta Tour' },
  { to: '/documents', icon: FileText, label: 'Mis Cartas Tour' },
  { to: '/brand', icon: Settings, label: 'Mi Marca' },
  { to: '/plan', icon: CreditCard, label: 'Mi Plan' },
]

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/companies', icon: Building2, label: 'Empresas' },
  { to: '/admin/plans', icon: CreditCard, label: 'Planes' },
  { to: '/admin/activity', icon: BarChart2, label: 'Actividad' },
]

export default function Sidebar() {
  const { profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const links = role === 'super_admin' ? adminLinks : companyLinks

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.15s',
    color: isActive ? '#fff' : '#94a3b8',
    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
  })

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
      style={{background: '#0f2a54', borderRight: '1px solid rgba(255,255,255,0.08)'}}>

      {/* Brand */}
      <div className="p-5 border-b" style={{borderColor: 'rgba(255,255,255,0.08)'}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: '#B8860B'}}>
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Travel Visa</p>
            <p className="text-blue-300 text-xs">Book</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {role === 'super_admin' && (
          <div className="px-2 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{color: '#475569'}}>
              Super Admin
            </span>
          </div>
        )}
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin' || to === '/dashboard'} style={navStyle}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Profile + Logout */}
      <div className="p-3 border-t" style={{borderColor: 'rgba(255,255,255,0.08)'}}>
        <div className="px-2 py-2 mb-2">
          <p className="text-white text-xs font-semibold truncate">
            {profile?.commercial_name || profile?.name || 'Usuario'}
          </p>
          <p className="text-blue-400 text-xs truncate">{profile?.email}</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all"
          style={{color: '#94a3b8'}}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
