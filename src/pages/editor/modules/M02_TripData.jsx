const PURPOSES = ['turismo', 'negocios', 'visita familiar', 'luna de miel', 'estudios', 'evento', 'otro']
const TYPES = ['individual', 'pareja', 'familiar', 'grupal', 'corporativo']

export default function M02TripData({ data = {}, onChange }) {
  function u(key, val) { onChange({ ...data, [key]: val }) }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={data[key] || ''} onChange={e => u(key, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2" />
    </div>
  )

  const nights = data.startDate && data.endDate
    ? Math.max(0, Math.round((new Date(data.endDate) - new Date(data.startDate)) / 86400000))
    : null

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Datos generales del viaje</h2>
      <div className="space-y-4">
        {field('Título del viaje *', 'title', 'text', 'Ej: Europa Classical Tour 2025')}
        {field('País principal de destino *', 'mainCountry', 'text', 'España')}
        {field('Países a visitar (separados por coma)', 'countries', 'text', 'España, Francia, Italia')}
        {field('Ciudades a visitar', 'cities', 'text', 'Madrid, Barcelona, París, Roma')}

        <div className="grid grid-cols-2 gap-4">
          {field('Fecha de salida *', 'startDate', 'date')}
          {field('Fecha de regreso *', 'endDate', 'date')}
        </div>

        {nights !== null && (
          <div className="flex gap-4 p-3 rounded-lg" style={{background: '#EFF6FF'}}>
            <div className="text-center px-4">
              <p className="text-2xl font-bold" style={{color: '#1A3F7A'}}>{nights + 1}</p>
              <p className="text-xs text-gray-500">días</p>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-bold" style={{color: '#1A3F7A'}}>{nights}</p>
              <p className="text-xs text-gray-500">noches</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motivo del viaje</label>
            <select value={data.tripPurpose || 'turismo'} onChange={e => u('tripPurpose', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
              {PURPOSES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de viaje</label>
            <select value={data.tripType || 'individual'} onChange={e => u('tripType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
              {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field('Moneda principal', 'currency', 'text', 'USD / EUR')}
          {field('Idioma principal', 'language', 'text', 'Español')}
          {field('Número de expediente', 'expeditionCode', 'text', 'EXP-2025-001')}
          {field('Fecha de emisión del documento', 'emissionDate', 'date')}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones generales</label>
          <textarea value={data.notes || ''} onChange={e => u('notes', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
        </div>
      </div>
    </div>
  )
}
