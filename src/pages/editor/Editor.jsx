import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, CheckCircle, User, Globe, CalendarDays, Hotel, Plane, FileSignature } from 'lucide-react'
import M01Passenger from './modules/M01_Passenger'
import M02TripData from './modules/M02_TripData'
import M05Itinerary from './modules/M05_Itinerary'
import M06Hotels from './modules/M06_Hotels'
import M07Flights from './modules/M07_Flights'
import M18Declaration from './modules/M18_Declaration'

const TABS = [
  { id: 'passenger', label: 'Pasajero', icon: User },
  { id: 'trip', label: 'Viaje', icon: Globe },
  { id: 'itinerary', label: 'Itinerario', icon: CalendarDays },
  { id: 'hotels', label: 'Alojamiento', icon: Hotel },
  { id: 'flights', label: 'Vuelos', icon: Plane },
  { id: 'declaration', label: 'Declaración', icon: FileSignature },
]

const EMPTY_DOC = {
  passengers: [{ name: '', nationality: '', birthDate: '', passportNumber: '', passportExpiry: '', passportIssuer: '', phone: '', email: '', address: '', occupation: '' }],
  trip: { title: '', mainCountry: '', countries: '', cities: '', startDate: '', endDate: '', tripPurpose: 'turismo', tripType: 'individual', currency: 'USD', language: 'Español', notes: '', expeditionCode: '' },
  itinerary: [],
  hotels: [],
  flights: [],
  declaration: { responsibleName: '', customText: '' }
}

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isNew = !id
  const [docId, setDocId] = useState(id)
  const [activeTab, setActiveTab] = useState('passenger')
  const [data, setData] = useState(EMPTY_DOC)
  const [status, setStatus] = useState('draft')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (!isNew && id) {
      supabase.from('travel_documents').select('*').eq('id', id).single()
        .then(({ data: doc }) => {
          if (doc) {
            setData({ ...EMPTY_DOC, ...doc.document_data })
            setStatus(doc.status)
          }
          setLoading(false)
        })
    }
  }, [id])

  function updateSection(section, value) {
    setData(d => ({ ...d, [section]: value }))
    setSaved(false)
  }

  async function save(newStatus) {
    setSaving(true)
    const passenger = data.passengers?.[0]
    const payload = {
      company_id: profile.id,
      passenger_name: passenger?.name || '',
      passport_number: passenger?.passportNumber || '',
      destination_title: data.trip?.title || '',
      countries: data.trip?.countries ? data.trip.countries.split(',').map(c => c.trim()) : [],
      start_date: data.trip?.startDate || null,
      end_date: data.trip?.endDate || null,
      expedition_code: data.trip?.expeditionCode || 'EXP-' + Date.now(),
      status: newStatus || status,
      document_data: data
    }

    if (isNew && !docId) {
      const { data: inserted, error } = await supabase.from('travel_documents').insert([payload]).select().single()
      if (!error) {
        setDocId(inserted.id)
        navigate(`/documents/${inserted.id}/edit`, { replace: true })
        if (newStatus === 'finalized') {
          await supabase.rpc('increment_document_counter', { p_company_id: profile.id })
        }
      }
    } else {
      await supabase.from('travel_documents').update(payload).eq('id', docId || id)
      if (newStatus === 'finalized' && status !== 'finalized') {
        await supabase.rpc('increment_document_counter', { p_company_id: profile.id })
      }
    }
    setStatus(newStatus || status)
    setSaved(true)
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isNew ? 'Nueva Carta Tour' : data.passengers?.[0]?.name || 'Editar documento'}
            </h1>
            <p className="text-xs text-gray-400">
              {status === 'draft' ? '📝 Borrador' : status === 'finalized' ? '✅ Finalizado' : '📦 Archivado'}
              {saved && ' · Guardado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => save('draft')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all"
            style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
          <button onClick={() => save('finalized')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-md transition-all"
            style={{background: '#10b981'}}>
            <CheckCircle className="w-4 h-4" />
            Finalizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button key={tabId} onClick={() => setActiveTab(tabId)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center"
            style={{
              background: activeTab === tabId ? '#1A3F7A' : 'transparent',
              color: activeTab === tabId ? '#fff' : '#64748b'
            }}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'passenger' && <M01Passenger data={data.passengers} onChange={v => updateSection('passengers', v)} />}
        {activeTab === 'trip' && <M02TripData data={data.trip} onChange={v => updateSection('trip', v)} />}
        {activeTab === 'itinerary' && <M05Itinerary data={data.itinerary} onChange={v => updateSection('itinerary', v)} />}
        {activeTab === 'hotels' && <M06Hotels data={data.hotels} onChange={v => updateSection('hotels', v)} />}
        {activeTab === 'flights' && <M07Flights data={data.flights} onChange={v => updateSection('flights', v)} />}
        {activeTab === 'declaration' && <M18Declaration data={data.declaration} company={profile} onChange={v => updateSection('declaration', v)} />}
      </div>
    </div>
  )
}
