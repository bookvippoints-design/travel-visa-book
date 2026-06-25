import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { PDFButton } from '../../pdf/PDFButton'
import { Plus, Search, Edit, Copy, Archive, FileText } from 'lucide-react'

export default function Documents() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!profile?.id) return
    const { data } = await supabase.from('travel_documents').select('*')
      .eq('company_id', profile.id).order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [profile])

  async function duplicate(doc) {
    const { error } = await supabase.from('travel_documents').insert([{
      company_id: profile.id,
      passenger_name: doc.passenger_name + ' (copia)',
      destination_title: doc.destination_title,
      countries: doc.countries,
      start_date: doc.start_date,
      end_date: doc.end_date,
      document_data: doc.document_data,
      status: 'draft',
      expedition_code: 'EXP-' + Date.now()
    }])
    if (!error) load()
  }

  async function archiveDoc(doc) {
    await supabase.from('travel_documents').update({ status: 'archived' }).eq('id', doc.id)
    load()
  }

  const statusColor = { draft: '#94a3b8', finalized: '#10b981', archived: '#6366f1' }
  const statusLabel = { draft: 'Borrador', finalized: 'Finalizado', archived: 'Archivado' }
  const statusBg = { draft: '#F8FAFC', finalized: '#F0FDF4', archived: '#EEF2FF' }

  const filtered = docs.filter(d => {
    const matchSearch = ((d.passenger_name || '') + (d.destination_title || '')).toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mis Cartas Tour</h1>
        <button onClick={() => navigate('/documents/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Carta Tour</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
          <option value="all">Todos</option>
          <option value="draft">Borradores</option>
          <option value="finalized">Finalizados</option>
          <option value="archived">Archivados</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No hay documentos</p>
            <button onClick={() => navigate('/documents/new')}
              className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{background: '#1A3F7A'}}>
              Crear ahora
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(doc => (
              <div key={doc.id} className="p-4">
                {/* Top row: name + status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{background: '#EFF6FF'}}>
                      <FileText className="w-3.5 h-3.5" style={{color: '#1A3F7A'}} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {doc.passenger_name || 'Sin nombre'}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{
                    background: statusBg[doc.status],
                    color: statusColor[doc.status]
                  }}>
                    {statusLabel[doc.status]}
                  </span>
                </div>

                {/* Destination */}
                <p className="text-xs text-gray-400 truncate mb-3 pl-9">
                  {doc.destination_title || 'Sin destino'}
                  {doc.expedition_code ? ` · ${doc.expedition_code}` : ''}
                </p>

                {/* Actions row */}
                <div className="flex items-center gap-2 pl-9">
                  <button onClick={() => navigate(`/documents/${doc.id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border flex-1 justify-center"
                    style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button onClick={() => duplicate(doc)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    title="Duplicar">
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  {doc.status !== 'archived' && (
                    <button onClick={() => archiveDoc(doc)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                      title="Archivar">
                      <Archive className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                  <PDFButton
                    data={doc.document_data || {}}
                    company={profile}
                    label="PDF"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
