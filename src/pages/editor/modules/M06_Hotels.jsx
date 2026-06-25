import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const EMPTY = { name: '', type: 'hotel', stars: '', city: '', country: '', address: '', checkin: '', checkout: '', roomType: '', regime: 'solo alojamiento', reservationCode: '', status: 'confirmado', notes: '' }

export default function M06Hotels({ data = [], onChange }) {
  const [open, setOpen] = useState({})
  function add() { onChange([...data, { ...EMPTY }]) }
  function remove(i) { onChange(data.filter((_, idx) => idx !== i)) }
  function update(i, key, val) { const next = [...data]; next[i] = { ...next[i], [key]: val }; onChange(next) }

  const nights = (h) => {
    if (!h.checkin || !h.checkout) return null
    return Math.round((new Date(h.checkout) - new Date(h.checkin)) / 86400000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Alojamiento</h2>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border" style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Agregar hotel
        </button>
      </div>
      {data.length === 0 && <div className="text-center py-12 text-gray-400">No hay alojamientos registrados. <button onClick={add} className="font-medium" style={{color:'#1A3F7A'}}>+ Agregar</button></div>}
      {data.map((h, i) => (
        <div key={i} className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setOpen(o => ({...o, [i]: !o[i]}))}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{background: '#B8860B'}}>
                {h.stars ? '★'.repeat(Math.min(parseInt(h.stars),5)) : '🏨'}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{h.name || 'Hotel sin nombre'}</p>
                <p className="text-xs text-gray-400">{h.city}{h.country ? `, ${h.country}` : ''} · {h.checkin || '?'} → {h.checkout || '?'}{nights(h) ? ` (${nights(h)} noches)` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); remove(i) }} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
              {open[i] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          {open[i] && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                {[['Nombre del hotel *', 'name'], ['Ciudad *', 'city'], ['País', 'country'], ['Dirección', 'address'], ['Código de reserva', 'reservationCode']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input value={h[key] || ''} onChange={e => update(i, key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoría (estrellas)</label>
                  <select value={h.stars || ''} onChange={e => update(i, 'stars', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    <option value="">—</option>
                    {['1','2','3','4','5'].map(s => <option key={s} value={s}>{s} estrella{s !== '1' ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
                  <input type="date" value={h.checkin || ''} onChange={e => update(i, 'checkin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
                  <input type="date" value={h.checkout || ''} onChange={e => update(i, 'checkout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Régimen</label>
                  <select value={h.regime || ''} onChange={e => update(i, 'regime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {['solo alojamiento','desayuno incluido','media pensión','todo incluido','otro'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                  <select value={h.status || 'confirmado'} onChange={e => update(i, 'status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {['confirmado','pendiente','referencial'].map(s => <option key={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                <textarea value={h.notes || ''} onChange={e => update(i, 'notes', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
