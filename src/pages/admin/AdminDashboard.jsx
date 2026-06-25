import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Building2, FileText, Users, Plus, TrendingUp, Eye } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ companies: 0, docs: 0, active: 0, thisMonth: 0 })
  const [companies, setCompanies] = useState([])
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const now = new Date()
      const [{ data: cos }, { data: docs }, { data: counters }] = await Promise.all([
        supabase.from('companies').select('*, plans(name)').order('created_at', { ascending: false }),
        supabase.from('travel_documents').select('*, companies(commercial_name, name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('document_counters').select('total_documents')
          .eq('month', now.getMonth() + 1).eq('year', now.getFullYear())
      ])
      setCompanies(cos || [])
      setRecentDocs(docs || [])
      const monthTotal = (counters || []).reduce((sum, c) => sum + (c.total_documents || 0), 0)
      setStats({
        companies: cos?.length || 0,
        active: cos?.filter(c => c.status === 'active').length || 0,
        docs: docs?.length || 0,
        thisMonth: monthTotal
      })
      setLoading(false)
    }
    load()
  }, [])

  const statusColor = { draft: '#94a3b8', finalized: '#10b981', archived: '#6366f1' }
  const statusLabel = { draft: 'Borrador', finalized: 'Finalizado', archived: 'Archivado' }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Super Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Vista general de la plataforma Travel Visa Book</p>
        </div>
        <button onClick={() => navigate('/admin/companies/new')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Nueva Empresa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Empresas registradas', value: stats.companies, icon: Building2, color: '#1A3F7A', bg: '#EFF6FF' },
          { label: 'Empresas activas', value: stats.active, icon: Users, color: '#10b981', bg: '#F0FDF4' },
          { label: 'Docs este mes', value: stats.thisMonth, icon: TrendingUp, color: '#B8860B', bg: '#FFFBEB' },
          { label: 'Docs recientes', value: stats.docs, icon: FileText, color: '#6366f1', bg: '#EEF2FF' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Icon className="w-8 h-8 p-1.5 rounded-lg mb-3" style={{background: bg, color}} />
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Companies */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Empresas</h2>
            <button onClick={() => navigate('/admin/companies')}
              className="text-sm font-medium" style={{color: '#1A3F7A'}}>Ver todas →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {companies.slice(0, 6).map(co => (
              <div key={co.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{background: '#1A3F7A'}}>
                    {(co.commercial_name || co.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{co.commercial_name || co.name}</p>
                    <p className="text-xs text-gray-400">Plan {co.plans?.name || '—'} · {co.monthly_limit === -1 ? 'Ilimitado' : co.monthly_limit + ' docs'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: co.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                    color: co.status === 'active' ? '#10b981' : '#ef4444'
                  }}>
                    {co.status === 'active' ? 'Activa' : 'Suspendida'}
                  </span>
                  <button onClick={() => navigate(`/admin/companies/${co.id}`)}
                    className="p-1 rounded hover:bg-gray-100" style={{color:'#1A3F7A'}}>
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent documents across ALL companies */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Documentos recientes (todas las empresas)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDocs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No hay documentos aún</div>
            ) : recentDocs.map(doc => (
              <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.passenger_name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400">
                      {doc.companies?.commercial_name || doc.companies?.name || '—'} · {doc.destination_title || 'Sin destino'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: doc.status === 'finalized' ? '#F0FDF4' : '#F8FAFC',
                      color: statusColor[doc.status]
                    }}>
                      {statusLabel[doc.status]}
                    </span>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
