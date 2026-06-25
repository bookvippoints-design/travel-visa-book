import { Plus, Trash2 } from 'lucide-react'

const EMPTY = { name: '', nationality: '', birthDate: '', passportNumber: '', passportExpiry: '', passportIssuer: '', phone: '', email: '', address: '', occupation: '', employer: '', emergencyContact: '', emergencyPhone: '', notes: '' }

export default function M01Passenger({ data = [EMPTY], onChange }) {
  function update(i, key, val) {
    const next = [...data]; next[i] = { ...next[i], [key]: val }; onChange(next)
  }
  function add() { onChange([...data, { ...EMPTY }]) }
  function remove(i) { onChange(data.filter((_, idx) => idx !== i)) }

  const field = (label, i, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={data[i][key] || ''} onChange={e => update(i, key, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Datos del pasajero</h2>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
          style={{color: '#1A3F7A', borderColor: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Agregar pasajero
        </button>
      </div>

      {data.map((p, i) => (
        <div key={i} className="mb-6 p-5 rounded-xl border border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Pasajero {i + 1}</h3>
            {i > 0 && <button onClick={() => remove(i)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Nombre completo *', i, 'name', 'text', 'Juan Pérez García')}
            {field('Nacionalidad *', i, 'nationality', 'text', 'Ecuatoriana')}
            {field('Fecha de nacimiento', i, 'birthDate', 'date')}
            {field('Número de pasaporte *', i, 'passportNumber', 'text', 'A1234567')}
            {field('Vence el (pasaporte)', i, 'passportExpiry', 'date')}
            {field('País emisor', i, 'passportIssuer', 'text', 'Ecuador')}
            {field('Teléfono', i, 'phone', 'tel')}
            {field('Correo electrónico', i, 'email', 'email')}
            {field('Ocupación', i, 'occupation', 'text', 'Ingeniero / Docente...')}
            {field('Empresa donde trabaja', i, 'employer')}
          </div>
          <div className="mt-4">
            {field('Dirección de residencia', i, 'address', 'text', 'Av. Amazonas N23-45, Quito, Ecuador')}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {field('Contacto de emergencia', i, 'emergencyContact')}
            {field('Teléfono de emergencia', i, 'emergencyPhone', 'tel')}
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
            <textarea value={p.notes || ''} onChange={e => update(i, 'notes', e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
          </div>
        </div>
      ))}
    </div>
  )
}
