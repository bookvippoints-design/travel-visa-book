import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Plane, Lock, Mail, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, role } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }
    // role will be set by AuthContext, redirect after brief delay
    setTimeout(() => {
      const savedRole = sessionStorage.getItem('tvb_role')
      navigate(savedRole === 'super_admin' ? '/admin' : '/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1A3F7A 0%, #0f2a54 100%)'}}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{background: 'rgba(255,255,255,0.15)'}}>
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Travel Visa Book</h1>
          <p className="text-blue-200 mt-1">Documentos de viaje profesionales</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Iniciar sesión</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#1A3F7A'}}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
              style={{background: loading ? '#94a3b8' : '#1A3F7A'}}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Travel Visa Book © 2025 · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
