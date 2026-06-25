import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, Upload, Eye, EyeOff, Trash2, Power, RefreshCw, Gift, Crown, Clock } from 'lucide-react'

const ACCESS_TYPES = [
  { id: 'trial',   label: 'Demo',          icon: Gift,  color: '#B8860B', bg: '#FFFBEB', days: 7,   desc: '7 días de prueba gratuita' },
  { id: 'monthly', label: '1 mes',         icon: Clock, color: '#6366f1', bg: '#EEF2FF', days: 30,  desc: '30 días de acceso' },
  { id: 'quarter', label: '3 meses',       icon: Clock, color: '#0891b2', bg: '#ECFEFF', days: 90,  desc: '90 días de acceso' },
  { id: 'semi',    label: '6 meses',       icon: Clock, color: '#059669', bg: '#ECFDF5', days: 180, desc: '6 meses de acceso' },
  { id: 'annual',  label: 'Plan Anual',    icon: Crown, color: '#1A3F7A', bg: '#EFF6FF', days: 365, desc: '12 meses · $600 + IVA' },
  { id: 'custom',  label: 'Personalizado', icon: Clock, color: '#94a3b8', bg: '#F8FAFC', days: null,desc: 'Define fechas exactas' },
]

function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

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
  const [plans, setPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [logoFile, setLogoFile] = useState(null)

  const [form, setForm] = useState({
    name: '', commercial_name: '', email: '',
    phone: '', whatsapp: '', website: '', address: '',
    status: 'active', monthly_limit: -1,
    is_trial: false, trial_ends_at: null,
    plan_starts_at: null, plan_ends_at: null,
    primary_color: '#1A3F7A', secondary_color: '#B8860B',
  })

  const [newEmail, setNewEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')

  useEffect(() => {
    supabase.from('plans').select('*').order('price').then(({ data }) => {
      setPlans(data || [])
      const active = data?.find(p => p.status === 'active')
      if (active) setSelectedPlanId(active.id)
    })

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
            name: co.name || '', commercial_name: co.commercial_name || '',
            email: co.email || '', phone: co.phone || '',
            whatsapp: co.whatsapp || '', website: co.website || '',
            address: co.address || '', status: co.status || 'active',
            monthly_limit: co.monthly_limit ?? -1,
            is_trial: co.is_trial || false,
            trial_ends_at: co.trial_ends_at || null,
            plan_starts_at: co.plan_starts_at || null,
            plan_ends_at: co.plan_ends_at || null,
            primary_color: co.primary_color || '#1A3F7A',
            secondary_color: co.secondary_color || '#B8860B',
          })
          setSelectedPlanId(co.plan_id || '')
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
    const cfg = ACCESS_TYPES.find(a => a.id === type)
    const isTrial = type === 'trial'
    const starts = new Date()

    if (type === 'custom') {
      setForm(f => ({ ...f, is_trial: false }))
      return
    }

    const ends = daysFromNow(cfg.days)
    setForm(f => ({
      ...f,
      is_trial: isTrial,
      trial_ends_at: isTrial ? ends.toISOString() : null,
      plan_starts_at: !isTrial ? starts.toISOString() : null,
      plan_ends_at: !isTrial ? ends.toISOString() : null,
    }))
  }

  function handleCustomDates() {
    if (!customStart || !customEnd) return
    setForm(f => ({
      ...f, is_trial: false,
      plan_starts_at: new Date(customStart).toISOString(),
      plan_ends_at: new Date(customEnd).toISOString(),
    }))
  }

  // Compute expiry date for display
  function getExpiryDate() {
    if (accessType === 'trial') return form.trial_ends_at
    if (accessType === 'custom') return form.plan_ends_at
    const cfg = ACCESS_TYPES.find(a => a.id === accessType)
    if (!cfg?.days) return null
    return daysFromNow(cfg.days).toISOString()
  }

  // Get plan limit for selected plan
  function getPlanLimit() {
    const plan = plans.find(p => p.id === selectedPlanId)
    return plan?.monthly_limit ?? -1
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })
    try {
      const planLimit = getPlanLimit()
      const payload = { ...form, plan_id: selectedPlanId, monthly_limit: planLimit }

      // Set correct dates based on access type
      if (accessType !== 'custom') {
        const cfg = ACCESS_TYPES.find(a => a.id === accessType)
        const isTrial = accessType === 'trial'
        const ends = daysFromNow(cfg.days)
        payload.is_trial = isTrial
        payload.trial_ends_at = isTrial ? ends.toISOString() : null
        payload.plan_starts_at = !isTrial ? new Date().toISOString() : null
        payload.plan_ends_at = !isTrial ? ends.toISOString() : null
      }

      if (isNew) {
        payload.email = newEmail
        // Try to create auth user
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
        if (userData.id) payload.auth_user_id = userData.id

        const { error } = await supabase.from('companies').insert([payload])
        if (error) throw new Error(error.message)

        const cfg = ACCESS_TYPES.find(a => a.id === accessType)
        const ends = getExpiryDate()
        setMsg({
          text: `✅ Empresa creada — ${cfg?.label || accessType}${ends ? ` · vence ${new Date(ends).toLocaleDateString('es-EC')}` : ''}. Login: ${newEmail}`,
          type: 'success'
        })
        setTimeout(() => navigate('/admin/companies'), 2500)
      } else {
        const updates = { ...payload }
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
    if (!newPassword || newPassword.length < 6) { setMsg({ text: 'Mínimo 6 caracteres.', type: 'error' }); return }
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${authUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({ password: newPassword })
      })
      const data = await res.json()
      if (data.id) { setMsg({ text: '✅ Contraseña actualizada.', type: 'success' }); setNewPassword('') }
      else throw new Error(data.message || 'Error.')
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

  async function renewPlan(type) {
    const cfg = ACCESS_TYPES.find(a => a.id === type)
    const starts = new Date()
    const ends = daysFromNow(cfg.days)
    await supabase.from('companies').update({
      status: 'active', is_trial: false, trial_ends_at: null,
      plan_starts_at: starts.toISOString(), plan_ends_at: ends.toISOString(),
    }).eq('id', id)
    u('plan_ends_at', ends.toISOString())
    u('status', 'active')
    setMsg({ text: `✅ Acceso renovado por ${cfg.label} hasta ${ends.toLocaleDateString('es-EC')}.`, type: 'success' })
  }

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const expiryDate = getExpiryDate()
  const selectedCfg = ACCESS_TYPES.find(a => a.id === accessType)

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

      {/* Status when editing */}
      {!isNew && (
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-sm px-3 py-1 rounded-full font-medium" style={{
            background: form.status === 'active' ? '#F0FDF4' : '#FEF2F2',
            color: form.status === 'active' ? '#10b981' : '#ef4444'
          }}>
            {form.status === 'active' ? '● Activa' : '● Suspendida'}
          </span>
          {(form.trial_ends_at || form.plan_ends_at) && (
            <span className="text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1" style={{background: '#EFF6FF', color: '#1A3F7A'}}>
              <Clock className="w-3.5 h-3.5" />
              Vence: {new Date(form.trial_ends_at || form.plan_ends_at).toLocaleDateString('es-EC')}
            </span>
          )}
          <span className="text-xs text-gray-400">Docs este mes: {docCount}</span>

          {/* Quick renew buttons */}
          <div className="flex gap-2 flex-wrap">
            {['trial','monthly','quarter','semi','annual'].map(type => {
              const cfg = ACCESS_TYPES.find(a => a.id === type)
              return (
                <button key={type} onClick={() => renewPlan(type)}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-all hover:shadow-sm"
                  style={{color: cfg.color, borderColor: cfg.color, background: cfg.bg}}>
                  + {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Access type + plan selection — only when creating */}
        {isNew && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-1">Período de acceso</h2>
              <p className="text-xs text-gray-400 mb-4">Define cuánto tiempo tendrá acceso la empresa.</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {ACCESS_TYPES.map(({ id: aId, label, icon: Icon, color, bg, desc }) => (
                  <button key={aId} type="button" onClick={() => handleAccessTypeChange(aId)}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: accessType === aId ? color : '#E2E8F0',
                      background: accessType === aId ? bg : '#fff'
                    }}>
                    <Icon className="w-5 h-5 mb-1.5" style={{color}} />
                    <p className="font-semibold text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom dates */}
              {accessType === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
                    <input type="date" value={customStart} onChange={e => { setCustomStart(e.target.value); handleCustomDates() }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
                    <input type="date" value={customEnd} onChange={e => { setCustomEnd(e.target.value); handleCustomDates() }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Expiry preview */}
              {expiryDate && (
                <div className="p-3 rounded-lg text-xs flex items-center gap-2" style={{background: selectedCfg?.bg || '#F8FAFC'}}>
                  <Clock className="w-4 h-4 flex-shrink-0" style={{color: selectedCfg?.color}} />
                  <span className="text-gray-700">
                    Acceso desde <strong>hoy</strong> hasta <strong>{new Date(expiryDate).toLocaleDateString('es-EC', {day:'2-digit', month:'long', year:'numeric'})}</strong>
                    {selectedCfg?.days ? ` (${selectedCfg.days} días)` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Plan selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-1">Plan asignado</h2>
              <p className="text-xs text-gray-400 mb-3">Define el límite de documentos mensuales.</p>
              <div className="space-y-2">
                {plans.map(plan => {
                  const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || [])
                  return (
                    <label key={plan.id}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: selectedPlanId === plan.id ? '#1A3F7A' : '#E2E8F0',
                        background: selectedPlanId === plan.id ? '#EFF6FF' : '#fff'
                      }}>
                      <input type="radio" name="plan" value={plan.id}
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="accent-blue-700" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{plan.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{
                            background: plan.status === 'active' ? '#F0FDF4' : '#F1F5F9',
                            color: plan.status === 'active' ? '#10b981' : '#94a3b8'
                          }}>{plan.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {plan.monthly_limit === -1 ? 'Documentos ilimitados' : `${plan.monthly_limit} docs/mes`}
                          {plan.price > 0 ? ` · $${plan.price} + IVA` : ' · Gratuito'}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900">
            {isNew ? 'Datos de la empresa' : 'Datos de la empresa'}
          </h2>
          {isNew && <p className="text-xs text-gray-400">Solo lo esencial — la empresa completa el resto desde su perfil.</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre comercial *</label>
              <input required value={form.commercial_name} onChange={e => u('commercial_name', e.target.value)}
                placeholder="General Visas"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre legal</label>
              <input value={form.name} onChange={e => u('name', e.target.value)}
                placeholder="General Visas S.A.S."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
            </div>
          </div>
          {!isNew && (
            <>
              {[['Correo','email','email'],['Teléfono','phone','tel'],['WhatsApp','whatsapp','tel'],['Sitio web','website','url'],['Dirección','address','text']].map(([label,key,type]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key]||''} onChange={e=>u(key,e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
              ))}
              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain" /> : <Upload className="w-5 h-5 text-gray-300" />}
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Subir logo
                    <input type="file" accept="image/*" onChange={e=>{setLogoFile(e.target.files[0]);setLogoPreview(URL.createObjectURL(e.target.files[0]))}} className="hidden" />
                  </label>
                </div>
              </div>
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select value={form.status} onChange={e=>u('status',e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
                  <option value="active">Activa</option>
                  <option value="suspended">Suspendida</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Credentials when creating */}
        {isNew && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900">Credenciales de acceso</h2>
            <p className="text-xs text-gray-400">Con esto la empresa iniciará sesión.</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" required value={newEmail} onChange={e=>setNewEmail(e.target.value)}
                placeholder="empresa@correo.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required minLength={6}
                  value={newUserPassword} onChange={e=>setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change password when editing */}
        {!isNew && authUserId && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Cambiar contraseña</h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              <button type="button" onClick={handleChangePassword} disabled={loading}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{background:'#1A3F7A'}}>
                Cambiar
              </button>
            </div>
          </div>
        )}

        {msg.text && (
          <div className={`p-4 rounded-xl text-sm border ${msg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg w-full justify-center"
          style={{background: loading ? '#94a3b8' : '#1A3F7A'}}>
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : isNew ? `Crear empresa · ${selectedCfg?.label || ''}` : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
