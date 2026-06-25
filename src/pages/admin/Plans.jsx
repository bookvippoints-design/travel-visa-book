import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Save, Trash2, Edit2, Crown } from 'lucide-react'

const EMPTY = { name: '', monthly_limit: -1, price: 0, features: [], status: 'active' }

export default function Plans() {
  const [plans, setPlans] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [featureInput, setFeatureInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase.from('plans').select('*').order('created_at', { ascending: false })
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
    setFeatureInput('')
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
    if (!confirm('¿Eliminar este plan?')) return
    await supabase.from('plans').delete().eq('id', id)
    load()
  }

  async function toggleStatus(plan) {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active'
    await supabase.from('plans').update({ status: newStatus }).eq('id', plan.id)
    load()
  }

  const activePlans = plans.filter(p => p.status === 'active')
  const inactivePlans = plans.filter(p => p.status === 'inactive')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes comerciales</h1>
          <p className="text-gray-500 text-sm mt-1">{activePlans.length} plan{activePlans.length !== 1 ? 'es' : ''} activo{activePlans.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{background: '#1A3F7A'}}>
          <Plus className="w-4 h-4" /> Nuevo Plan
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">{msg}</div>
      )}

      {/* Editor */}
      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editing === 'new' ? 'Nuevo plan' : 'Editar plan'}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="Plan Anual"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Límite mensual (-1 = ∞)</label>
                <input type="number" value={form.monthly_limit}
                  onChange={e => setForm(f => ({...f, monthly_limit: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Precio anual (USD)</label>
                <input type="number" step="0.01" value={form.price}
                  onChange={e => setForm(f => ({...f, price: parseFloat(e.target.value)}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Características</label>
              <div className="flex gap-2 mb-2">
                <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Ej: Documentos ilimitados (Enter para agregar)"
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

      {/* Active plans */}
      <div className="space-y-4 mb-8">
        {activePlans.map(plan => {
          const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || [])
          return (
            <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-5 h-5" style={{color: '#B8860B'}} />
                    <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background: '#F0FDF4', color: '#10b981'}}>
                      Activo
                    </span>
                  </div>
                  <p className="text-3xl font-bold mb-0.5" style={{color: '#1A3F7A'}}>
                    ${plan.price}<span className="text-sm font-normal text-gray-400"> + IVA / año</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {plan.monthly_limit === -1 ? 'Documentos ilimitados' : `${plan.monthly_limit} documentos/mes`}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {features.map((f, i) => (
                      <p key={i} className="text-sm text-gray-600 flex items-center gap-1.5">
                        <span style={{color: '#10b981'}}>✓</span> {f}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => startEdit(plan)}
                    className="p-2 rounded-lg hover:bg-blue-50 transition-colors" style={{color: '#1A3F7A'}}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleStatus(plan)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400" title="Desactivar">
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inactive plans */}
      {inactivePlans.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Planes inactivos</p>
          <div className="space-y-2">
            {inactivePlans.map(plan => (
              <div key={plan.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-sm font-medium text-gray-700">{plan.name}</p>
                  <p className="text-xs text-gray-400">${plan.price} · {plan.monthly_limit === -1 ? 'Ilimitado' : plan.monthly_limit + ' docs/mes'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(plan)}
                    className="text-xs px-3 py-1.5 rounded-lg border text-gray-500 hover:bg-gray-50">
                    Activar
                  </button>
                  <button onClick={() => deletePlan(plan.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { Power } from 'lucide-react'
