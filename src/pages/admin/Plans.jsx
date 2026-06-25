import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Save, Trash2, Edit2 } from 'lucide-react'

const EMPTY = { name: '', monthly_limit: 20, price: 0, features: [], status: 'active' }

export default function Plans() {
  const [plans, setPlans] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [featureInput, setFeatureInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase.from('plans').select('*').order('monthly_limit')
    setPlans(data || [])
  }

  useEffect(() => { load() }, [])

  function startEdit(plan) {
    setEditing(plan.id)
    setForm({
      name: plan.name,
      monthly_limit: plan.monthly_limit,
      price: plan.price,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || []),
      status: plan.status
    })
  }

  function startNew() {
    setEditing('new')
    setForm(EMPTY)
    setFeatureInput('')
  }

  function addFeature() {
    if (!featureInput.trim()) return
    setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }))
    setFeatureInput('')
  }

  function removeFeature(i) {
    setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))
  }

  async function save() {
    setLoading(true)
    const payload = { ...form, features: JSON.stringify(form.features) }
    if (editing === 'new') {
      await supabase.from('plans').insert([payload])
    } else {
      await supabase.from('plans').update(payload).eq('id', editing)
    }
    setMsg('✅ Plan guardado.')
    setEditing(null)
    load()
    setLoading(false)
  }

  async function deletePlan(id) {
    if (!confirm('¿Eliminar este plan? Las empresas con este plan perderán la referencia.')) return
    await supabase.from('plans').delete().eq('id', id)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Planes comerciales</h1>
        <button onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Nuevo Plan
        </button>
      </div>

      {msg && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">{msg}</div>}

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editing === 'new' ? 'Nuevo plan' : 'Editar plan'}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del plan</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="Ej: Profesional"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Límite mensual (-1 = ∞)</label>
                <input type="number" value={form.monthly_limit}
                  onChange={e => setForm(f => ({...f, monthly_limit: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Precio (USD/mes)</label>
                <input type="number" step="0.01" value={form.price}
                  onChange={e => setForm(f => ({...f, price: parseFloat(e.target.value)}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Características incluidas</label>
              <div className="flex gap-2 mb-2">
                <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Ej: Logo de empresa (Enter para agregar)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                <button onClick={addFeature}
                  className="px-3 py-2 rounded-lg text-white text-sm" style={{background: '#1A3F7A'}}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{background: '#F8FAFC'}}>
                    <span className="text-sm text-gray-700">✓ {f}</span>
                    <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{background: '#1A3F7A'}}>
                <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar plan'}
              </button>
              <button onClick={() => setEditing(null)}
                className="px-5 py-2.5 rounded-xl text-gray-600 text-sm border border-gray-200 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans list */}
      <div className="space-y-4">
        {plans.map(plan => {
          const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || [])
          return (
            <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: plan.status === 'active' ? '#F0FDF4' : '#F1F5F9',
                      color: plan.status === 'active' ? '#10b981' : '#94a3b8'
                    }}>
                      {plan.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{color: '#1A3F7A'}}>
                    ${plan.price}<span className="text-sm font-normal text-gray-400">/mes</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {plan.monthly_limit === -1 ? 'Documentos ilimitados' : `${plan.monthly_limit} documentos/mes`}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {features.map((f, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-1.5">
                        <span style={{color: '#10b981'}}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(plan)}
                    className="p-2 rounded-lg hover:bg-blue-50 transition-colors" style={{color: '#1A3F7A'}}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deletePlan(plan.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
