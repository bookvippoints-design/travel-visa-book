import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, Upload, Eye, EyeOff, Trash2, Power, RefreshCw } from 'lucide-react'

export default function CompanyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(!isNew)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [logoPreview, setLogoPreview] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [sigFile, setSigFile] = useState(null)
  const [stampFile, setStampFile] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [authUserId, setAuthUserId] = useState(null)
  const [docCount, setDocCount] = useState(0)

  const [form, setForm] = useState({
    name: '', commercial_name: '', email: '', phone: '',
    whatsapp: '', website: '', address: '',
    plan_id: '', monthly_limit: 20, status: 'active',
    primary_color: '#1A3F7A', secondary_color: '#B8860B'
  })

  // New user credentials (only for new companies)
  const [newEmail, setNewEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')

  useEffect(() => {
    supabase.from('plans').select('*').order('monthly_limit').then(({ data }) => setPlans(data || []))
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
            plan_id: co.plan_id || '',
            monthly_limit: co.monthly_limit ?? 20,
            status: co.status || 'active',
            primary_color: co.primary_color || '#1A3F7A',
            secondary_color: co.secondary_color || '#B8860B',
          })
          setLogoPreview(co.logo_url || '')
          setAuthUserId(co.auth_user_id)
          setDocCount(cnt?.total_documents || 0)
        }
        setPageLoading(false)
      })
    }
  }, [id])

  function u(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handlePlanChange(planId) {
    const plan = plans.find(p => p.id === planId)
    setForm(f => ({ ...f, plan_id: planId, monthly_limit: plan?.monthly_limit ?? 20 }))
  }

  async function uploadFile(file, path) {
    await supabase.storage.from('travel-visa-book').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('travel-visa-book').getPublicUrl(path)
    return publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })

    try {
      const updates = { ...form }

      // Upload files if changed
      const companyId = id || 'new'
      if (logoFile) updates.logo_url = await uploadFile(logoFile, `${companyId}/logo/${logoFile.name}`)
      if (sigFile) updates.signature_url = await uploadFile(sigFile, `${companyId}/signature/${sigFile.name}`)
      if (stampFile) updates.stamp_url = await uploadFile(stampFile, `${companyId}/stamp/${stampFile.name}`)

      if (isNew) {
        // Create auth user via Supabase admin API
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            email: newEmail || form.email,
            password: newUserPassword,
            email_confirm: true
          })
        })
        const userData = await res.json()

        if (userData.id) {
          updates.auth_user_id = userData.id
          updates.email = newEmail || form.email
          const { error } = await supabase.from('companies').insert([updates])
          if (error) throw new Error(error.message)
          setMsg({ text: '✅ Empresa y usuario creados correctamente.', type: 'success' })
          setTimeout(() => navigate('/admin/companies'), 1500)
        } else {
          // Fallback: create company without auth user, admin links manually
          const { error } = await supabase.from('companies').insert([{ ...updates, email: newEmail || form.email }])
          if (error) throw new Error(error.message)
          setMsg({ text: `✅ Empresa creada. Ve a Supabase Auth > Users y crea el usuario ${newEmail || form.email} con contraseña ${newUserPassword}, luego vincula el auth_user_id manualmente.`, type: 'warning' })
        }
      } else {
        const { error } = await supabase.from('companies').update(updates).eq('id', id)
        if (error) throw new Error(error.message)
        setMsg({ text: '✅ Empresa actualizada correctamente.', type: 'success' })
      }
    } catch (err) {
      setMsg({ text: 'Error: ' + err.message, type: 'error' })
    }
    setLoading(false)
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      setMsg({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' }); return
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
      if (data.id) {
        setMsg({ text: '✅ Contraseña actualizada correctamente.', type: 'success' })
        setNewPassword('')
      } else {
        throw new Error(data.message || 'No se pudo actualizar. Verifica permisos en Supabase.')
      }
    } catch (err) {
      setMsg({ text: 'Error: ' + err.message, type: 'error' })
    }
    setLoading(false)
  }

  async function handleToggleStatus() {
    const newStatus = form.status === 'active' ? 'suspended' : 'active'
    await supabase.from('companies').update({ status: newStatus }).eq('id', id)
    u('status', newStatus)
    setMsg({ text: `✅ Empresa ${newStatus === 'active' ? 'activada' : 'suspendida'}.`, type: 'success' })
  }

  async function handleDelete() {
    if (!confirm('¿Estás seguro? Esta acción eliminará la empresa y TODOS sus documentos. No se puede deshacer.')) return
    setLoading(true)
    await supabase.from('companies').delete().eq('id', id)
    navigate('/admin/companies')
  }

  async function resetMonthlyCounter() {
    await supabase.from('document_counters').upsert({
      company_id: id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      total_documents: 0
    }, { onConflict: 'company_id,month,year' })
    setDocCount(0)
    setMsg({ text: '✅ Contador mensual reiniciado.', type: 'success' })
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => u(key, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
    </div>
  )

  const msgStyle = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200'
  }

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/companies')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nueva Empresa' : `Editar: ${form.commercial_name || form.name}`}
          </h1>
        </div>
        {!isNew && (
          <div className="flex items-center gap-2">
            <button onClick={handleToggleStatus}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{ color: form.status === 'active' ? '#ef4444' : '#10b981', borderColor: form.status === 'active' ? '#ef4444' : '#10b981' }}>
              <Power className="w-4 h-4" />
              {form.status === 'active' ? 'Suspender' : 'Activar'}
            </button>
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all">
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Status badge */}
      {!isNew && (
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm px-3 py-1 rounded-full font-medium" style={{
            background: form.status === 'active' ? '#F0FDF4' : '#FEF2F2',
            color: form.status === 'active' ? '#10b981' : '#ef4444'
          }}>
            {form.status === 'active' ? '● Activa' : '● Suspendida'}
          </span>
          <span className="text-sm text-gray-500">
            Documentos este mes: <strong>{docCount}</strong> / {form.monthly_limit === -1 ? '∞' : form.monthly_limit}
          </span>
          <button onClick={resetMonthlyCounter}
            className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-3 h-3" /> Reiniciar contador
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Datos empresa */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Datos de la empresa</h2>
          <div className="grid grid-cols-2 gap-4">
            {field('Nombre legal *', 'name', 'text', 'Visas Ecuador Cía. Ltda.')}
            {field('Nombre comercial', 'commercial_name', 'text', 'Visas Ecuador')}
          </div>
          {field('Correo electrónico *', 'email', 'email', 'empresa@correo.com')}
          <div className="grid grid-cols-2 gap-4">
            {field('Teléfono', 'phone', 'tel', '+593 2 xxx xxxx')}
            {field('WhatsApp', 'whatsapp', 'tel', '+593 9x xxx xxxx')}
          </div>
          {field('Sitio web', 'website', 'url', 'https://www.empresa.com')}
          {field('Dirección', 'address', 'text', 'Av. Amazonas N23-45, Quito')}
        </div>

        {/* Logo, firma y sello */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Identidad visual</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Logo', preview: logoPreview, onChange: e => { setLogoFile(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])) } },
              { label: 'Firma digital', preview: null, onChange: e => setSigFile(e.target.files[0]), file: sigFile },
              { label: 'Sello digital', preview: null, onChange: e => setStampFile(e.target.files[0]), file: stampFile },
            ].map(({ label, preview, onChange, file }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
                <label className="cursor-pointer block">
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-all overflow-hidden">
                    {preview
                      ? <img src={preview} className="h-full w-full object-contain p-2" />
                      : file
                        ? <p className="text-xs text-green-600 text-center px-2">✅ {file.name}</p>
                        : <><Upload className="w-5 h-5 text-gray-300 mb-1" /><p className="text-xs text-gray-400">Subir {label.toLowerCase()}</p></>
                    }
                  </div>
                  <input type="file" accept="image/*" onChange={onChange} className="hidden" />
                </label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color principal</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primary_color} onChange={e => u('primary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <span className="text-sm text-gray-600 font-mono">{form.primary_color}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color secundario</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.secondary_color} onChange={e => u('secondary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <span className="text-sm text-gray-600 font-mono">{form.secondary_color}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan y acceso */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Plan y acceso</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Plan comercial</label>
              <select value={form.plan_id} onChange={e => handlePlanChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
                <option value="">Sin plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.monthly_limit === -1 ? 'Ilimitado' : p.monthly_limit + ' docs/mes'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Límite mensual manual</label>
              <input type="number" value={form.monthly_limit} onChange={e => u('monthly_limit', parseInt(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              <p className="text-xs text-gray-400 mt-0.5">Usa -1 para ilimitado</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado de la empresa</label>
            <select value={form.status} onChange={e => u('status', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="active">Activa</option>
              <option value="suspended">Suspendida</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>
        </div>

        {/* Credenciales */}
        {isNew ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Credenciales de acceso</h2>
            <p className="text-xs text-gray-500">El usuario podrá iniciar sesión con estas credenciales.</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email de acceso *</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                placeholder="empresa@correo.com" required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)} required minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : authUserId && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Cambiar contraseña</h2>
            <p className="text-xs text-gray-500">Deja vacío si no deseas cambiar la contraseña actual.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input type={showPass ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
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

        {msg.text && (
          <div className={`p-4 rounded-xl text-sm border ${msgStyle[msg.type]}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg w-full justify-center transition-all"
          style={{background: loading ? '#94a3b8' : '#1A3F7A'}}>
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : isNew ? 'Crear empresa' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
