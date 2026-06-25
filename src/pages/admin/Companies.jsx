import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Search, Edit, Power, Trash2, Filter } from 'lucide-react'

export default function Companies() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [counters, setCounters] = useState({})

  async function load() {
    const now = new Date()
    const [{ data: cos }, { data: cnts }] = await Promise.all([
      supabase.from('companies').select('*, plans(name)').order('created_at', { ascending: false }),
      supabase.from('document_counters').select('company_id, total_documents')
        .eq('month', now.getMonth() + 1).eq('year', now.getFullYear())
    ])
    setCompanies(cos || [])
    const map = {}
    ;(cnts || []).forEach(c => { map[c.company_id] = c.total_documents })
    setCounters(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(co, e) {
    e.stopPropagation()
    const newStatus = co.status === 'active' ? 'suspended' : 'active'
    await supabase.from('companies').update({ status: newStatus }).eq('id', co.id)
    load()
  }

  async function deleteCompany(co, e) {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${co.commercial_name || co.name}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('companies').delete().eq('id', co.id)
    load()
  }

  const filtered = companies.filter(c => {
    const matchSearch = (c.name + c.email + (c.commercial_name || '')).toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-500 text-sm mt-1">{companies.length} empresa{companies.length !== 1 ? 's' : ''} registrada{companies.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/admin/companies/new')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Nueva Empresa
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {['all', 'active', 'suspended'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filterStatus === s ? '#1A3F7A' : '#F1F5F9',
                  color: filterStatus === s ? '#fff' : '#64748b'
                }}>
                {s === 'all' ? 'Todas' : s === 'active' ? 'Activas' : 'Suspendidas'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <p className="font-medium">No hay empresas</p>
            <button onClick={() => navigate('/admin/companies/new')}
              className="mt-3 text-sm font-medium" style={{color: '#1A3F7A'}}>
              + Crear primera empresa
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{background: '#F8FAFC'}} className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Docs este mes</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Último acceso</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(co => {
                const count = counters[co.id] || 0
                const pct = co.monthly_limit === -1 ? 0 : Math.round((count / co.monthly_limit) * 100)
                return (
                  <tr key={co.id}
                    onClick={() => navigate(`/admin/companies/${co.id}`)}
                    className="hover:bg-blue-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{background: '#1A3F7A'}}>
                          {(co.commercial_name || co.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{co.commercial_name || co.name}</p>
                          <p className="text-xs text-gray-400">{co.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{background: '#EFF6FF', color: '#1A3F7A'}}>
                        {co.plans?.name || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {count} / {co.monthly_limit === -1 ? '∞' : co.monthly_limit}
                        </p>
                        {co.monthly_limit !== -1 && (
                          <div className="mt-1 h-1 w-20 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#1A3F7A'
                            }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                        background: co.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                        color: co.status === 'active' ? '#10b981' : '#ef4444'
                      }}>
                        {co.status === 'active' ? '● Activa' : '● Suspendida'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {co.last_login ? new Date(co.last_login).toLocaleDateString('es-EC') : 'Nunca'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/admin/companies/${co.id}`)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors" style={{color: '#1A3F7A'}} title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => toggleStatus(co, e)}
                          className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors" title={co.status === 'active' ? 'Suspender' : 'Activar'}
                          style={{color: co.status === 'active' ? '#f59e0b' : '#10b981'}}>
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => deleteCompany(co, e)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
