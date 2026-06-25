import { useAuth } from '../../context/AuthContext'
import { CheckCircle, Zap } from 'lucide-react'

export default function Plan() {
  const { profile } = useAuth()
  const plan = profile?.plans
  const limit = profile?.monthly_limit ?? 20
  const isUnlimited = limit === -1
  const features = plan?.features ? (typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features) : []

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Plan</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6" style={{background: 'linear-gradient(135deg, #1A3F7A, #0f2a54)'}}>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Plan {plan?.name || 'Básico'}</h2>
          </div>
          <p className="text-blue-200 text-sm">
            {isUnlimited ? 'Documentos ilimitados' : `Hasta ${limit} cartas tour por mes`}
          </p>
        </div>
        <div className="p-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Características incluidas:</p>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{color: '#10b981'}} />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Para cambiar de plan, contacta con el administrador de la plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
