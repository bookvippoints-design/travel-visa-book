import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Search, Edit, Power, Trash2 } from 'lucide-react'

export default function Companies() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.from('companies').select('*, plans(name)').order('created_at', { ascending: false })
    setCompanies(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(co) {
    const newStatus = co.status === 'active' ? 'suspended' : 'active'
    await supabase.from('companies').update({ status: newStatus }).eq('id', co.id)
    load()
  }

  const filtered = companies.filter(c =>
    (c.name + c.email + (c.commercial_name || '')).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button onClick={() => navigate('/admin/companies/new')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Nueva Empresa
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar empresa..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Último acceso</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(co => (
                <tr key={co.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{co.commercial_name || co.name}</p>
                      <p className="text-xs text-gray-400">{co.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{background: '#EFF6FF', color: '#1A3F7A'}}>
                      {co.plans?.name || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                      background: co.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                      color: co.status === 'active' ? '#10b981' : '#ef4444'
                    }}>
                      {co.status === 'active' ? 'Activa' : 'Suspendida'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {co.last_login ? new Date(co.last_login).toLocaleDateString('es-EC') : 'Nunca'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/companies/${co.id}`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" style={{color: '#1A3F7A'}} title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(co)}
                        className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors" style={{color: '#B8860B'}} title="Activar/Suspender">
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
