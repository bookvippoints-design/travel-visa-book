import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Building2, FileText, Users, Plus } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ companies: 0, docs: 0, active: 0 })
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    async function load() {
      const [{ data: cos }, { data: docs }] = await Promise.all([
        supabase.from('companies').select('*, plans(name)').order('created_at', { ascending: false }),
        supabase.from('travel_documents').select('id', { count: 'exact' })
      ])
      setCompanies(cos || [])
      setStats({
        companies: cos?.length || 0,
        active: cos?.filter(c => c.status === 'active').length || 0,
        docs: docs?.length || 0
      })
    }
    load()
  }, [])

  const statusColor = { active: '#10b981', suspended: '#ef4444', inactive: '#94a3b8' }
  const statusLabel = { active: 'Activa', suspended: 'Suspendida', inactive: 'Inactiva' }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Super Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Travel Visa Book · Vista general</p>
        </div>
        <button onClick={() => navigate('/admin/companies/new')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Nueva Empresa
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Empresas registradas', value: stats.companies, icon: Building2, color: '#1A3F7A', bg: '#EFF6FF' },
          { label: 'Empresas activas', value: stats.active, icon: Users, color: '#10b981', bg: '#F0FDF4' },
          { label: 'Documentos totales', value: stats.docs, icon: FileText, color: '#B8860B', bg: '#FFFBEB' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Icon className="w-8 h-8 p-1.5 rounded-lg mb-3" style={{background: bg, color}} />
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Empresas</h2>
          <button onClick={() => navigate('/admin/companies')} className="text-sm font-medium" style={{color: '#1A3F7A'}}>
            Gestionar →
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {companies.slice(0, 8).map(co => (
            <div key={co.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {co.logo_url
                  ? <img src={co.logo_url} className="w-9 h-9 rounded-lg object-contain border border-gray-100" />
                  : <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{background: '#1A3F7A'}}>
                      {(co.commercial_name || co.name || '?')[0].toUpperCase()}
                    </div>
                }
                <div>
                  <p className="text-sm font-semibold text-gray-900">{co.commercial_name || co.name}</p>
                  <p className="text-xs text-gray-400">{co.email} · Plan {co.plans?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                  background: co.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                  color: statusColor[co.status]
                }}>
                  {statusLabel[co.status]}
                </span>
                <button onClick={() => navigate(`/admin/companies/${co.id}`)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                  style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
