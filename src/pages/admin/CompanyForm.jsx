import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, Upload, Eye, EyeOff, Trash2, Power, RefreshCw, Gift, Crown } from 'lucide-react'

export default function CompanyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(!isNew)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [showPass, setShowPass] = useState(false)
  const [authUserId, setAuthUserId] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [docCount, setDocCount] = useState(0)
  const [accessType, setAccessType] = useState('annual')
  const [logoPreview, setLogoPreview] = useState('')
  const [logoFile, setLogoFile] = useState(null)

  // Form fields
  const [form, setForm] = useState({
    name: '', commercial_name: '', email: '',
    phone: '', whatsapp: '', website: '', address: '',
    status: 'active', monthly_limit: -1,
    is_trial: false, trial_ends_at: null,
    plan_starts_at: null, plan_ends_at: null,
    primary_color: '#1A3F7A', secondary_color: '#B8860B',
  })

  // New user credentials
  const [newEmail, setNewEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')

  useEffect(() => {
    if (!isNew) {
      Promise.all([
        supabase.from('companies').select('*').eq('id', id).single(),
        supabase.from('document_counters').select('total_documents')
          .eq('company_id', id)
          .eq('month', new Date().getMonth() + 1)
          .eq('year', new Date().getFullYear())
      ]).then(([{ data: co }, { data: cnt }]) => {
        if (co) {
          setForm({
            name: co.name || '',
            commercial_name: co.commercial_name || '',
            email: co.email || '',
            phone: co.phone || '',
            whatsapp: co.whatsapp || '',
            website: co.website || '',
            address: co.address || '',
            status: co.status || 'active',
            monthly_limit: co.monthly_limit ?? -1,
            is_trial: co.is_trial || false,
            trial_ends_at: co.trial_ends_at || null,
            plan_starts_at: co.plan_starts_at || null,
            plan_ends_at: co.plan_ends_at || null,
            primary_color: co.primary_color || '#1A3F7A',
            secondary_color: co.secondary_color || '#B8860B',
          })
          setAccessType(co.is_trial ? 'trial' : 'annual')
          setLogoPreview(co.logo_url || '')
          setAuthUserId(co.auth_user_id)
          setDocCount(cnt?.total_documents || 0)
        }
        setPageLoading(false)
      })
    }
  }, [id])

  function u(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleAccessTypeChange(type) {
    setAccessType(type)
    if (type === 'trial') {
      const ends = new Date()
      ends.setDate(ends.getDate() + 7)
      setForm(f => ({ ...f, is_trial: true, trial_ends_at: ends.toISOString(), plan_starts_at: null, plan_ends_at: null }))
    } else {
      const starts = new Date()
      const ends = new Date()
      ends.setFullYear(ends.getFullYear() + 1)
      setForm(f => ({ ...f, is_trial: false, trial_ends_at: null, plan_starts_at: starts.toISOString(), plan_ends_at: ends.toISOString() }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })
    try {
      if (isNew) {
        // 1. Create auth user
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ email: newEmail, password: newUserPassword, email_confirm: true })
        })
        const userData = await res.json()
        const payload = { ...form, email: newEmail }
        if (userData.id) payload.auth_user_id = userData.id

        const { error } = await supabase.from('companies').insert([payload])
        if (error) throw new Error(error.message)
        setMsg({
          text: `✅ Empresa creada como ${accessType === 'trial' ? 'DEMO 7 días' : 'PLAN ANUAL 1 año'}. El usuario puede ingresar con ${newEmail}.`,
          type: 'success'
        })
        setTimeout(() => navigate('/admin/companies'), 2000)
      } else {
        const updates = { ...form }
        if (logoFile) {
          await supabase.storage.from('travel-visa-book').upload(`${id}/logo/${logoFile.name}`, logoFile, { upsert: true })
          const { data: { publicUrl } } = supabase.storage.from('travel-visa-book').getPublicUrl(`${id}/logo/${logoFile.name}`)
          updates.logo_url = publicUrl
        }
        const { error } = await supabase.from('companies').update(updates).eq('id', id)
        if (error) throw new Error(error.message)
        setMsg({ text: '✅ Empresa actualizada.', type: 'success' })
      }
    } catch (err) {
      setMsg({ text: 'Error: ' + err.message, type: 'error' })
    }
    setLoading(false)
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      setMsg({ text: 'Mínimo 6 caracteres.', type: 'error' }); return
    }
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${authUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ password: newPassword })
      })
      const data = await res.json()
      if (data.id) { setMsg({ text: '✅ Contraseña actualizada.', type: 'success' }); setNewPassword('') }
      else throw new Error(data.message || 'Error al cambiar contraseña.')
    } catch (err) { setMsg({ text: 'Error: ' + err.message, type: 'error' }) }
    setLoading(false)
  }

  async function handleToggleStatus() {
    const s = form.status === 'active' ? 'suspended' : 'active'
    await supabase.from('companies').update({ status: s }).eq('id', id)
    u('status', s)
    setMsg({ text: `✅ Empresa ${s === 'active' ? 'activada' : 'suspendida'}.`, type: 'success' })
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta empresa? No se puede deshacer.')) return
    await supabase.from('companies').delete().eq('id', id)
    navigate('/admin/companies')
  }

  async function renewAnnualPlan() {
    const starts = new Date()
    const ends = new Date()
    ends.setFullYear(ends.getFullYear() + 1)
    await supabase.from('companies').update({
      status: 'active', is_trial: false, trial_ends_at: null,
      plan_starts_at: starts.toISOString(), plan_ends_at: ends.toISOString(),
    }).eq('id', id)
    u('plan_ends_at', ends.toISOString())
    u('status', 'active')
    setMsg({ text: '✅ Plan renovado por 1 año.', type: 'success' })
  }

  const msgStyle = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  }

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/companies')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nueva Empresa' : form.commercial_name || form.name}
          </h1>
        </div>
        {!isNew && (
          <div className="flex items-center gap-2">
            <button onClick={handleToggleStatus}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border"
              style={{ color: form.status === 'active' ? '#ef4444' : '#10b981', borderColor: form.status === 'active' ? '#ef4444' : '#10b981' }}>
              <Power className="w-4 h-4" />
              {form.status === 'active' ? 'Suspender' : 'Activar'}
            </button>
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-500">
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Status badges when editing */}
      {!isNew && (
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-sm px-3 py-1 rounded-full font-medium" style={{
            background: form.status === 'active' ? '#F0FDF4' : '#FEF2F2',
            color: form.status === 'active' ? '#10b981' : '#ef4444'
          }}>
            {form.status === 'active' ? '● Activa' : '● Suspendida'}
          </span>
          {form.is_trial && form.trial_ends_at && (
            <span className="text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1" style={{background: '#FEF3C7', color: '#92400E'}}>
              <Gift className="w-3.5 h-3.5" /> Demo vence: {new Date(form.trial_ends_at).toLocaleDateString('es-EC')}
            </span>
          )}
          {!form.is_trial && form.plan_ends_at && (
            <span className="text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1" style={{background: '#EFF6FF', color: '#1A3F7A'}}>
              <Crown className="w-3.5 h-3.5" /> Plan vence: {new Date(form.plan_ends_at).toLocaleDateString('es-EC')}
            </span>
          )}
          <span className="text-xs text-gray-400">Docs este mes: {docCount}</span>
          <button onClick={renewAnnualPlan}
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium"
            style={{background: '#EFF6FF', color: '#1A3F7A'}}>
            <Crown className="w-3 h-3" /> Renovar 1 año
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* CREAR: solo lo esencial */}
        {isNew && (
          <>
            {/* Tipo de acceso */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Tipo de acceso</h2>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => handleAccessTypeChange('annual')}
                  className="p-4 rounded-xl border-2 text-left transition-all"
                  style={{ borderColor: accessType === 'annual' ? '#1A3F7A' : '#E2E8F0', background: accessType === 'annual' ? '#EFF6FF' : '#fff' }}>
                  <Crown className="w-6 h-6 mb-2" style={{color: '#1A3F7A'}} />
                  <p className="font-semibold text-gray-900 text-sm">Plan Anual</p>
                  <p className="text-xs text-gray-500 mt-1">$600 + IVA · 12 meses · se desactiva solo</p>
                </button>
                <button type="button" onClick={() => handleAccessTypeChange('trial')}
                  className="p-4 rounded-xl border-2 text-left transition-all"
                  style={{ borderColor: accessType === 'trial' ? '#B8860B' : '#E2E8F0', background: accessType === 'trial' ? '#FFFBEB' : '#fff' }}>
                  <Gift className="w-6 h-6 mb-2" style={{color: '#B8860B'}} />
                  <p className="font-semibold text-gray-900 text-sm">Demo 7 días</p>
                  <p className="text-xs text-gray-500 mt-1">Gratis · se desactiva solo al 7° día</p>
                </button>
              </div>
              <div className="mt-3 p-3 rounded-lg text-xs" style={{background: '#F8FAFC'}}>
                {accessType === 'annual'
                  ? <p className="text-gray-600">✅ Activo desde hoy hasta <strong>{new Date(new Date().setFullYear(new Date().getFullYear()+1)).toLocaleDateString('es-EC')}</strong></p>
                  : <p className="text-gray-600">⏱ Demo hasta <strong>{new Date(new Date().setDate(new Date().getDate()+7)).toLocaleDateString('es-EC')}</strong></p>
                }
              </div>
            </div>

            {/* Datos básicos */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-gray-900">Datos de la empresa</h2>
              <p className="text-xs text-gray-400">Solo lo esencial — la empresa completa el resto desde su perfil.</p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre comercial *</label>
                <input required value={form.commercial_name} onChange={e => u('commercial_name', e.target.value)}
                  placeholder="Ej: General Visas"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre legal</label>
                <input value={form.name} onChange={e => u('name', e.target.value)}
                  placeholder="Ej: General Visas S.A.S."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
              </div>
            </div>

            {/* Credenciales */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-gray-900">Credenciales de acceso</h2>
              <p className="text-xs text-gray-400">Con esto la empresa podrá iniciar sesión.</p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="empresa@correo.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required minLength={6}
                    value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* EDITAR: todos los datos */}
        {!isNew && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Datos de la empresa</h2>
              <div className="grid grid-cols-2 gap-4">
                {[['Nombre legal', 'name'], ['Nombre comercial', 'commercial_name']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input value={form[key] || ''} onChange={e => u(key, e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
              {[['Correo', 'email', 'email'], ['Teléfono', 'phone', 'tel'], ['WhatsApp', 'whatsapp', 'tel'], ['Sitio web', 'website', 'url'], ['Dirección', 'address', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={e => u(key, e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
              ))}
            </div>

            {/* Logo */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Logo</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                  {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain" /> : <Upload className="w-6 h-6 text-gray-300" />}
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Subir logo
                  <input type="file" accept="image/*" onChange={e => { setLogoFile(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])) }} className="hidden" />
                </label>
              </div>
            </div>

            {/* Estado */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Estado</h2>
              <select value={form.status} onChange={e => u('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
                <option value="active">Activa</option>
                <option value="suspended">Suspendida</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>

            {/* Cambiar contraseña */}
            {authUserId && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Cambiar contraseña</h2>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type={showPass ? 'text' : 'password'} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="button" onClick={handleChangePassword} disabled={loading}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                    style={{background: '#1A3F7A'}}>
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {msg.text && (
          <div className={`p-4 rounded-xl text-sm border ${msgStyle[msg.type] || 'bg-gray-50 border-gray-200'}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg w-full justify-center"
          style={{background: loading ? '#94a3b8' : '#1A3F7A'}}>
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : isNew
            ? `Crear empresa (${accessType === 'trial' ? 'Demo 7 días' : 'Plan Anual'})`
            : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
