import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Activity, Search } from 'lucide-react'

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [companies, setCompanies] = useState([])
  const [filterCompany, setFilterCompany] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: logsData }, { data: cos }] = await Promise.all([
        supabase.from('activity_logs').select('*, companies(commercial_name, name)')
          .order('created_at', { ascending: false }).limit(100),
        supabase.from('companies').select('id, name, commercial_name').order('name')
      ])
      setLogs(logsData || [])
      setCompanies(cos || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = logs.filter(l => {
    const matchCompany = filterCompany === 'all' || l.company_id === filterCompany
    const matchSearch = l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.companies?.commercial_name?.toLowerCase().includes(search.toLowerCase())
    return matchCompany && matchSearch
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-6 h-6" style={{color: '#1A3F7A'}} />
        <h1 className="text-2xl font-bold text-gray-900">Actividad del sistema</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar acción..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
            <option value="all">Todas las empresas</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.commercial_name || c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay actividad registrada</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{background: '#1A3F7A'}} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                      {new Date(log.created_at).toLocaleString('es-EC')}
                    </p>
                  </div>
                  {log.companies && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {log.companies.commercial_name || log.companies.name}
                    </p>
                  )}
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
