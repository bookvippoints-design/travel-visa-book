import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Save, Upload } from 'lucide-react'

export default function Brand() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ commercial_name: '', phone: '', whatsapp: '', email: '', website: '', address: '', primary_color: '#1A3F7A', secondary_color: '#B8860B' })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [sigFile, setSigFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        commercial_name: profile.commercial_name || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        email: profile.email || '',
        website: profile.website || '',
        address: profile.address || '',
        primary_color: profile.primary_color || '#1A3F7A',
        secondary_color: profile.secondary_color || '#B8860B',
      })
      setLogoPreview(profile.logo_url || '')
    }
  }, [profile])

  async function uploadFile(file, path) {
    const { data, error } = await supabase.storage.from('travel-visa-book').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('travel-visa-book').getPublicUrl(path)
    return publicUrl
  }

  async function handleSave() {
    setLoading(true); setMsg('')
    try {
      const updates = { ...form }
      if (logoFile) {
        updates.logo_url = await uploadFile(logoFile, `${profile.id}/logo/${logoFile.name}`)
      }
      if (sigFile) {
        updates.signature_url = await uploadFile(sigFile, `${profile.id}/signature/${sigFile.name}`)
      }
      const { error } = await supabase.from('companies').update(updates).eq('id', profile.id)
      if (error) throw error
      setMsg('✅ Marca actualizada correctamente.')
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setLoading(false)
  }

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const field = (label, key, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Configuración de Marca</h1>

      <div className="space-y-6">
        {/* Logo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Logo de la empresa</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {logoPreview
                ? <img src={logoPreview} className="w-full h-full object-contain" />
                : <Upload className="w-6 h-6 text-gray-300" />
              }
            </div>
            <div>
              <label className="cursor-pointer px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Subir logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-2">PNG o JPG. Recomendado: 300x100px</p>
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900">Datos de la empresa</h2>
          {field('Nombre comercial', 'commercial_name')}
          <div className="grid grid-cols-2 gap-4">
            {field('Teléfono', 'phone', 'tel')}
            {field('WhatsApp', 'whatsapp', 'tel')}
          </div>
          {field('Correo electrónico', 'email', 'email')}
          {field('Sitio web', 'website', 'url')}
          {field('Dirección', 'address')}
        </div>

        {/* Firma */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Firma digital</h2>
          <label className="cursor-pointer px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Subir firma
            <input type="file" accept="image/*" onChange={e => setSigFile(e.target.files[0])} className="hidden" />
          </label>
          {sigFile && <p className="text-xs text-green-600 mt-2">✅ {sigFile.name} seleccionada</p>}
        </div>

        {/* Colores */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Colores de marca</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color principal</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <span className="text-sm text-gray-600">{form.primary_color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color secundario</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <span className="text-sm text-gray-600">{form.secondary_color}</span>
              </div>
            </div>
          </div>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {msg}
          </div>
        )}

        <button onClick={handleSave} disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg w-full justify-center"
          style={{background: loading ? '#94a3b8' : '#1A3F7A'}}>
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
