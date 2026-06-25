import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'

export default function CompanyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name: '', commercial_name: '', email: '', phone: '',
    whatsapp: '', website: '', address: '', plan_id: '', monthly_limit: 20, status: 'active'
  })
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    supabase.from('plans').select('*').then(({ data }) => setPlans(data || []))
    if (!isNew) {
      supabase.from('companies').select('*').eq('id', id).single()
        .then(({ data }) => { if (data) setForm({ ...data, plan_id: data.plan_id || '' }) })
    }
  }, [id])

  function handlePlanChange(planId) {
    const plan = plans.find(p => p.id === planId)
    setForm(f => ({ ...f, plan_id: planId, monthly_limit: plan?.monthly_limit ?? 20 }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    if (isNew) {
      // Create auth user first via admin API (requires service_role — we'll do it via Supabase UI)
      // For now, insert company with placeholder
      const { error } = await supabase.from('companies').insert([form])
      if (error) { setMsg('Error: ' + error.message); setLoading(false); return }
      setMsg('✅ Empresa creada. Ve a Supabase Auth > Users para crear el usuario y vincular el auth_user_id.')
    } else {
      const { error } = await supabase.from('companies').update(form).eq('id', id)
      if (error) { setMsg('Error: ' + error.message); setLoading(false); return }
      setMsg('✅ Empresa actualizada correctamente.')
    }
    setLoading(false)
  }

  const field = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2"
        {...extra} />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/admin/companies')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{isNew ? 'Nueva Empresa' : 'Editar Empresa'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900">Datos de la empresa</h2>
          <div className="grid grid-cols-2 gap-4">
            {field('Nombre legal', 'name', 'text', { required: true })}
            {field('Nombre comercial', 'commercial_name')}
          </div>
          {field('Correo electrónico', 'email', 'email', { required: true })}
          <div className="grid grid-cols-2 gap-4">
            {field('Teléfono', 'phone', 'tel')}
            {field('WhatsApp', 'whatsapp', 'tel')}
          </div>
          {field('Sitio web', 'website', 'url')}
          {field('Dirección', 'address')}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900">Plan y acceso</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan comercial</label>
            <select value={form.plan_id} onChange={e => handlePlanChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">Sin plan asignado</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {p.monthly_limit === -1 ? 'Ilimitado' : p.monthly_limit + ' docs/mes'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Límite mensual manual</label>
            <input type="number" value={form.monthly_limit} onChange={e => setForm(f => ({ ...f, monthly_limit: parseInt(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            <p className="text-xs text-gray-400 mt-1">Usa -1 para ilimitado</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="active">Activa</option>
              <option value="suspended">Suspendida</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {msg}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg w-full justify-center"
          style={{background: loading ? '#94a3b8' : '#1A3F7A'}}>
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : isNew ? 'Crear empresa' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
