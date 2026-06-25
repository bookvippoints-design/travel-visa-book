import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Plus, FileText, AlertTriangle, CheckCircle, TrendingUp, Calendar } from 'lucide-react'

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {profile?.commercial_name || profile?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Plan {profile?.plans?.name || 'Básico'} · {isUnlimited ? 'Documentos ilimitados' : `${counter} de ${limit} documentos este mes`}
          </p>
        </div>
        <button
          onClick={() => navigate('/documents/new')}
          disabled={atLimit}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all shadow-lg"
          style={{background: atLimit ? '#94a3b8' : '#1A3F7A'}}
        >
          <Plus className="w-4 h-4" />
          Nueva Carta Tour
        </button>
      </div>

      {/* Alerts */}
      {atLimit && (
        <div className="mb-6 p-4 rounded-xl border flex items-start gap-3" style={{background: '#fef2f2', borderColor: '#fca5a5'}}>
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Límite mensual alcanzado</p>
            <p className="text-red-600 text-xs mt-0.5">Has usado todos tus documentos del mes. Contacta con nosotros para ampliar tu plan.</p>
          </div>
        </div>
      )}
      {nearLimit && !atLimit && (
        <div className="mb-6 p-4 rounded-xl border flex items-start gap-3" style={{background: '#fffbeb', borderColor: '#fcd34d'}}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-semibold text-sm">Cerca del límite mensual</p>
            <p className="text-amber-600 text-xs mt-0.5">Has usado el {pct}% de tus documentos. Te quedan {limit - counter} documentos este mes.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 p-1.5 rounded-lg" style={{background: '#EFF6FF', color: '#1A3F7A'}} />
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{background: '#EFF6FF', color: '#1A3F7A'}}>Este mes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{counter}</p>
          <p className="text-gray-500 text-sm mt-1">Documentos generados</p>
          {!isUnlimited && (
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width: `${Math.min(pct,100)}%`, background: pct >= 80 ? '#ef4444' : '#1A3F7A'}} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-8 h-8 p-1.5 rounded-lg" style={{background: '#F0FDF4', color: '#10b981'}} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{docs.filter(d => d.status === 'finalized').length}</p>
          <p className="text-gray-500 text-sm mt-1">Finalizados recientes</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 p-1.5 rounded-lg" style={{background: '#FDF4FF', color: '#a855f7'}} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{isUnlimited ? '∞' : limit - counter}</p>
          <p className="text-gray-500 text-sm mt-1">Disponibles este mes</p>
        </div>
      </div>

      {/* Recent docs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Documentos recientes</h2>
          <button onClick={() => navigate('/documents')} className="text-sm font-medium" style={{color: '#1A3F7A'}}>
            Ver todos →
          </button>
        </div>
        {docs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aún no tienes documentos</p>
            <p className="text-gray-400 text-sm mt-1">Crea tu primera Carta Tour</p>
            <button onClick={() => navigate('/documents/new')}
              className="mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{background: '#1A3F7A'}}>
              Crear ahora
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: '#EFF6FF'}}>
                    <Plane className="w-4 h-4" style={{color: '#1A3F7A'}} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{doc.passenger_name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400">{doc.destination_title || 'Sin destino'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.start_date ? new Date(doc.start_date).toLocaleDateString('es-EC') : '—'}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                    background: doc.status === 'finalized' ? '#F0FDF4' : doc.status === 'draft' ? '#F8FAFC' : '#EEF2FF',
                    color: statusColor[doc.status]
                  }}>
                    {statusLabel[doc.status]}
                  </span>
                  <button onClick={() => navigate(`/documents/${doc.id}/edit`)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
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

function Plane({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
}
