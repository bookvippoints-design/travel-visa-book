import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { PDFButton } from '../../pdf/PDFButton'
import { Plus, Search, Edit, Copy, Archive, FileText, Calendar } from 'lucide-react'

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

  const filtered = docs.filter(d => {
    const matchSearch = ((d.passenger_name || '') + (d.destination_title || '')).toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Cartas Tour</h1>
        <button onClick={() => navigate('/documents/new')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Nueva Carta Tour
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por pasajero o destino..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
            <option value="all">Todos</option>
            <option value="draft">Borradores</option>
            <option value="finalized">Finalizados</option>
            <option value="archived">Archivados</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay documentos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: '#EFF6FF'}}>
                    <FileText className="w-5 h-5" style={{color: '#1A3F7A'}} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{doc.passenger_name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400">{doc.destination_title || 'Sin destino'} · {doc.expedition_code || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {doc.start_date && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.start_date).toLocaleDateString('es-EC')}
                        {doc.end_date && ` → ${new Date(doc.end_date).toLocaleDateString('es-EC')}`}
                      </p>
                      {doc.total_nights && <p className="text-xs text-gray-400">{doc.total_nights} noches</p>}
                    </div>
                  )}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                    background: doc.status === 'finalized' ? '#F0FDF4' : doc.status === 'draft' ? '#F8FAFC' : '#EEF2FF',
                    color: statusColor[doc.status]
                  }}>
                    {statusLabel[doc.status]}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/documents/${doc.id}/edit`)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" style={{color: '#1A3F7A'}} title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => duplicate(doc)}
                      className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors" style={{color: '#B8860B'}} title="Duplicar">
                      <Copy className="w-4 h-4" />
                    </button>
                    {doc.status !== 'archived' && (
                      <button onClick={() => archiveDoc(doc)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400" title="Archivar">
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <PDFButton
                      data={doc.document_data || {}}
                      company={profile}
                      label="PDF"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
