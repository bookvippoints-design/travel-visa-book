const DEFAULT_TEXT = `El presente documento ha sido elaborado por la agencia con fines informativos y de planificación turística, como respaldo del itinerario propuesto para el pasajero. La información contenida en este documento corresponde a los datos proporcionados por el cliente y/o a las reservas, servicios y actividades planificadas al momento de su emisión. Las actividades, horarios, alojamientos, transportes y servicios pueden estar sujetos a modificaciones por razones operativas, disponibilidad, cambios de proveedor, clima, fuerza mayor o disposiciones migratorias.

Este documento no constituye garantía de aprobación de visa ni garantía de ingreso a ningún país. La decisión final corresponde exclusivamente a las autoridades consulares y migratorias competentes.`

export default function M18Declaration({ data = {}, company, onChange }) {
  function u(key, val) { onChange({ ...data, [key]: val }) }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Declaración Final</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del responsable</label>
          <input value={data.responsibleName || ''} onChange={e => u('responsibleName', e.target.value)}
            placeholder={company?.commercial_name || 'Nombre del asesor o director'}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Texto de la declaración</label>
          <textarea value={data.customText || DEFAULT_TEXT} onChange={e => u('customText', e.target.value)} rows={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
          <button onClick={() => u('customText', DEFAULT_TEXT)}
            className="text-xs mt-1 font-medium" style={{color: '#1A3F7A'}}>
            ↺ Restaurar texto predeterminado
          </button>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">Vista previa del pie de página</p>
          <p className="text-xs text-gray-500">{company?.commercial_name || 'Nombre de la empresa'}</p>
          <p className="text-xs text-gray-400">{company?.address || 'Dirección'} · {company?.phone || 'Teléfono'} · {company?.email || 'Email'}</p>
          {company?.logo_url && <img src={company.logo_url} className="h-8 mt-2 object-contain" />}
        </div>
      </div>
    </div>
  )
}
