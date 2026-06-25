import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TrialExpired from '../../pages/auth/TrialExpired'

export function ProtectedRoute({ children, requiredRole }) {
  const { user, role, trialExpired, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: '#0f2a54'}}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-sm">Cargando...</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  // Trial expired — show expired screen instead of panel
  if (trialExpired && role === 'company') return <TrialExpired />

  // Admin trying to access company routes
  if (requiredRole === 'company' && role === 'super_admin') {
    return <Navigate to="/admin" replace />
  }

  // Company trying to access admin routes
  if (requiredRole === 'super_admin' && role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
