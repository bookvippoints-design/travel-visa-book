import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Plane } from 'lucide-react'

const EMPTY = { type: 'ida', airline: '', flightNumber: '', reservationCode: '', origin: '', originAirport: '', destination: '', destinationAirport: '', departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '', class: 'económica', luggage: '', status: 'confirmado', notes: '' }

export default function M07Flights({ data = [], onChange }) {
  const [open, setOpen] = useState({})
  function add() { onChange([...data, { ...EMPTY }]) }
  function remove(i) { onChange(data.filter((_, idx) => idx !== i)) }
  function update(i, key, val) { const next = [...data]; next[i] = { ...next[i], [key]: val }; onChange(next) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Transporte Aéreo</h2>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border" style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Agregar vuelo
        </button>
      </div>
      {data.length === 0 && <div className="text-center py-12 text-gray-400">No hay vuelos registrados. <button onClick={add} className="font-medium" style={{color:'#1A3F7A'}}>+ Agregar</button></div>}
      {data.map((f, i) => (
        <div key={i} className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setOpen(o => ({...o, [i]: !o[i]}))}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: '#EFF6FF'}}>
                <Plane className="w-4 h-4" style={{color: '#1A3F7A'}} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {f.origin || '?'} → {f.destination || '?'}
                  {f.flightNumber && <span className="ml-2 text-xs text-gray-400">{f.flightNumber}</span>}
                </p>
                <p className="text-xs text-gray-400">{f.airline || 'Aerolínea'} · {f.departureDate || '?'} {f.departureTime || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{background: '#EFF6FF', color: '#1A3F7A'}}>{f.type}</span>
              <button onClick={e => { e.stopPropagation(); remove(i) }} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
              {open[i] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          {open[i] && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de vuelo</label>
                  <select value={f.type} onChange={e => update(i, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {['ida','regreso','conexión','vuelo interno'].map(t => <option key={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                {[['Aerolínea', 'airline'], ['Número de vuelo', 'flightNumber'], ['Código de reserva', 'reservationCode'], ['Ciudad de origen', 'origin'], ['Aeropuerto origen', 'originAirport'], ['Ciudad de destino', 'destination'], ['Aeropuerto destino', 'destinationAirport']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input value={f[key] || ''} onChange={e => update(i, key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha salida</label>
                  <input type="date" value={f.departureDate || ''} onChange={e => update(i, 'departureDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hora salida</label>
                  <input type="time" value={f.departureTime || ''} onChange={e => update(i, 'departureTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha llegada</label>
                  <input type="date" value={f.arrivalDate || ''} onChange={e => update(i, 'arrivalDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hora llegada</label>
                  <input type="time" value={f.arrivalTime || ''} onChange={e => update(i, 'arrivalTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Clase</label>
                  <select value={f.class || 'económica'} onChange={e => update(i, 'class', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {['económica','premium economy','business','first'].map(c => <option key={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                {[['Equipaje', 'luggage']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input value={f[key] || ''} onChange={e => update(i, key, e.target.value)} placeholder="23kg incluido"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
