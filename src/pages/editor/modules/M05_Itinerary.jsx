import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const EMPTY_DAY = { day: 1, date: '', city: '', country: '', title: '', description: '', hotel: '', meals: '', status: 'confirmed', activities: [] }
const EMPTY_ACT = { time: '', name: '', place: '', description: '', duration: '', confirmed: false }

export default function M05Itinerary({ data = [], onChange }) {
  const [open, setOpen] = useState({})

  function addDay() {
    onChange([...data, { ...EMPTY_DAY, day: data.length + 1 }])
  }
  function removeDay(i) { onChange(data.filter((_, idx) => idx !== i)) }
  function updateDay(i, key, val) {
    const next = [...data]; next[i] = { ...next[i], [key]: val }; onChange(next)
  }
  function addActivity(i) {
    const next = [...data]
    next[i].activities = [...(next[i].activities || []), { ...EMPTY_ACT }]
    onChange(next)
  }
  function updateActivity(dayIdx, actIdx, key, val) {
    const next = [...data]
    next[dayIdx].activities[actIdx] = { ...next[dayIdx].activities[actIdx], [key]: val }
    onChange(next)
  }
  function removeActivity(dayIdx, actIdx) {
    const next = [...data]
    next[dayIdx].activities = next[dayIdx].activities.filter((_, i) => i !== actIdx)
    onChange(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Itinerario día por día</h2>
        <button onClick={addDay} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border"
          style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Agregar día
        </button>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No hay días en el itinerario.</p>
          <button onClick={addDay} className="mt-3 text-sm font-medium" style={{color: '#1A3F7A'}}>+ Agregar primer día</button>
        </div>
      )}

      {data.map((day, i) => (
        <div key={i} className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            style={{background: open[i] ? '#EFF6FF' : undefined}}
            onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{background: '#1A3F7A'}}>{day.day}</span>
              <div>
                <p className="font-medium text-gray-900 text-sm">{day.title || `Día ${day.day}`}</p>
                <p className="text-xs text-gray-400">{day.date} · {day.city}{day.country ? `, ${day.country}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); removeDay(i) }} className="p-1 hover:bg-red-50 rounded text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
              {open[i] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          {open[i] && (
            <div className="p-4 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['Fecha', 'date', 'date'], ['Ciudad', 'city', 'text'], ['País', 'country', 'text'], ['Título del día', 'title', 'text']].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input type={type} value={day[key] || ''} onChange={e => updateDay(i, key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción del día</label>
                <textarea value={day.description || ''} onChange={e => updateDay(i, 'description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hotel donde pernocta</label>
                  <input value={day.hotel || ''} onChange={e => updateDay(i, 'hotel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Comidas</label>
                  <input value={day.meals || ''} onChange={e => updateDay(i, 'meals', e.target.value)}
                    placeholder="Desayuno incluido" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>

              {/* Activities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Actividades</p>
                  <button onClick={() => addActivity(i)} className="text-xs font-medium flex items-center gap-1" style={{color: '#1A3F7A'}}>
                    <Plus className="w-3 h-3" /> Agregar
                  </button>
                </div>
                {(day.activities || []).map((act, j) => (
                  <div key={j} className="p-3 bg-gray-50 rounded-lg mb-2 grid grid-cols-2 gap-3">
                    {[['Hora', 'time', 'time'], ['Actividad', 'name', 'text'], ['Lugar', 'place', 'text'], ['Duración', 'duration', 'text']].map(([label, key, type]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">{label}</label>
                        <input type={type} value={act[key] || ''} onChange={e => updateActivity(i, j, key, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none" />
                      </div>
                    ))}
                    <div className="col-span-2 flex justify-end">
                      <button onClick={() => removeActivity(i, j)} className="text-xs text-red-400 hover:text-red-600">Eliminar actividad</button>
                    </div>
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

import { useState } from 'react'
