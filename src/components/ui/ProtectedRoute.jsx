import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: '#0f2a54'}}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-sm">Cargando...</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  // If super_admin tries to access company routes, send to admin panel
  if (!requiredRole && role === 'super_admin') {
    return <Navigate to="/admin" replace />
  }

  // If company tries to access admin routes
  if (requiredRole === 'super_admin' && role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
