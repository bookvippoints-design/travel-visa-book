import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Plus, FileText, AlertTriangle, CheckCircle, TrendingUp, Calendar, Plane } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [counter, setCounter] = useState(0)
  const [loading, setLoading] = useState(true)

  const limit = profile?.monthly_limit ?? 20
  const isUnlimited = limit === -1
  const pct = isUnlimited ? 0 : Math.round((counter / limit) * 100)
  const nearLimit = !isUnlimited && pct >= 80
  const atLimit = !isUnlimited && counter >= limit

  useEffect(() => {
    if (!profile?.id) return
    async function load() {
      const now = new Date()
      const [{ data: docsData }, { data: cnt }] = await Promise.all([
        supabase.from('travel_documents').select('*').eq('company_id', profile.id)
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('document_counters').select('total_documents')
          .eq('company_id', profile.id)
          .eq('month', now.getMonth() + 1)
          .eq('year', now.getFullYear())
          .single()
      ])
      setDocs(docsData || [])
      setCounter(cnt?.total_documents || 0)
      setLoading(false)
    }
    load()
  }, [profile])

  const statusColor = { draft: '#94a3b8', finalized: '#10b981', archived: '#6366f1' }
  const statusLabel = { draft: 'Borrador', finalized: 'Finalizado', archived: 'Archivado' }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Bienvenido, {profile?.commercial_name || profile?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Plan {profile?.plans?.name || 'Básico'} · {isUnlimited ? 'Documentos ilimitados' : `${counter} de ${limit} este mes`}
          </p>
        </div>
        <button
          onClick={() => navigate('/documents/new')}
          disabled={atLimit}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-all shadow-lg w-full sm:w-auto justify-center"
          style={{background: atLimit ? '#94a3b8' : '#1A3F7A'}}>
          <Plus className="w-4 h-4" />
          Nueva Carta Tour
        </button>
      </div>

      {/* Alerts */}
      {atLimit && (
        <div className="mb-4 p-4 rounded-xl border flex items-start gap-3" style={{background: '#fef2f2', borderColor: '#fca5a5'}}>
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Límite mensual alcanzado</p>
            <p className="text-red-600 text-xs mt-0.5">Contacta con nosotros para ampliar tu plan.</p>
          </div>
        </div>
      )}
      {nearLimit && !atLimit && (
        <div className="mb-4 p-4 rounded-xl border flex items-start gap-3" style={{background: '#fffbeb', borderColor: '#fcd34d'}}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-semibold text-sm">Cerca del límite — {pct}% usado</p>
            <p className="text-amber-600 text-xs mt-0.5">Te quedan {limit - counter} documentos este mes.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <TrendingUp className="w-7 h-7 p-1.5 rounded-lg mb-2" style={{background: '#EFF6FF', color: '#1A3F7A'}} />
          <p className="text-2xl font-bold text-gray-900">{counter}</p>
          <p className="text-gray-500 text-xs mt-0.5">Docs este mes</p>
          {!isUnlimited && (
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{width: `${Math.min(pct,100)}%`, background: pct >= 80 ? '#ef4444' : '#1A3F7A'}} />
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <FileText className="w-7 h-7 p-1.5 rounded-lg mb-2" style={{background: '#F0FDF4', color: '#10b981'}} />
          <p className="text-2xl font-bold text-gray-900">{docs.filter(d => d.status === 'finalized').length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Finalizados</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <CheckCircle className="w-7 h-7 p-1.5 rounded-lg mb-2" style={{background: '#FDF4FF', color: '#a855f7'}} />
          <p className="text-2xl font-bold text-gray-900">{isUnlimited ? '∞' : limit - counter}</p>
          <p className="text-gray-500 text-xs mt-0.5">Disponibles</p>
        </div>
      </div>

      {/* Recent docs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Documentos recientes</h2>
          <button onClick={() => navigate('/documents')} className="text-xs font-medium" style={{color: '#1A3F7A'}}>
            Ver todos →
          </button>
        </div>
        {docs.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">Aún no tienes documentos</p>
            <button onClick={() => navigate('/documents/new')}
              className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{background: '#1A3F7A'}}>
              Crear ahora
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: '#EFF6FF'}}>
                    <Plane className="w-4 h-4" style={{color: '#1A3F7A'}} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.passenger_name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400 truncate">{doc.destination_title || 'Sin destino'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium px-2 py-1 rounded-full hidden sm:block" style={{
                    background: doc.status === 'finalized' ? '#F0FDF4' : '#F8FAFC',
                    color: statusColor[doc.status]
                  }}>
                    {statusLabel[doc.status]}
                  </span>
                  <button onClick={() => navigate(`/documents/${doc.id}/edit`)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border"
                    style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
