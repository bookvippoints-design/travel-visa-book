import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, FileText, Calendar, Eye } from 'lucide-react'

export default function CompanyDocuments() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: co }, { data: docsData }] = await Promise.all([
        supabase.from('companies').select('name, commercial_name').eq('id', id).single(),
        supabase.from('travel_documents').select('*').eq('company_id', id).order('created_at', { ascending: false })
      ])
      setCompany(co)
      setDocs(docsData || [])
      setLoading(false)
    }
    load()
  }, [id])

  const statusColor = { draft: '#94a3b8', finalized: '#10b981', archived: '#6366f1' }
  const statusLabel = { draft: 'Borrador', finalized: 'Finalizado', archived: 'Archivado' }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(`/admin/companies/${id}`)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Documentos — {company?.commercial_name || company?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{docs.length} documentos en total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Esta empresa no tiene documentos aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: '#EFF6FF'}}>
                    <FileText className="w-4 h-4" style={{color: '#1A3F7A'}} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{doc.passenger_name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400">{doc.destination_title || 'Sin destino'} · {doc.expedition_code || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.start_date && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(doc.start_date).toLocaleDateString('es-EC')}
                      {doc.total_nights ? ` · ${doc.total_nights} noches` : ''}
                    </p>
                  )}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                    background: doc.status === 'finalized' ? '#F0FDF4' : '#F8FAFC',
                    color: statusColor[doc.status]
                  }}>
                    {statusLabel[doc.status]}
                  </span>
                  <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString('es-EC')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
