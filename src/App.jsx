import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ui/ProtectedRoute'
import Layout from './components/ui/Layout'

import Login from './pages/auth/Login'
import Dashboard from './pages/company/Dashboard'
import Documents from './pages/company/Documents'
import Editor from './pages/editor/Editor'
import Brand from './pages/company/Brand'
import Plan from './pages/company/Plan'

import AdminDashboard from './pages/admin/AdminDashboard'
import Companies from './pages/admin/Companies'
import CompanyForm from './pages/admin/CompanyForm'
import CompanyDocuments from './pages/admin/CompanyDocuments'
import Plans from './pages/admin/Plans'
import Activity from './pages/admin/Activity'

function CompanyApp({ children }) {
  return <ProtectedRoute requiredRole="company"><Layout>{children}</Layout></ProtectedRoute>
}

function AdminApp({ children }) {
  return <ProtectedRoute requiredRole="super_admin"><Layout>{children}</Layout></ProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Company */}
          <Route path="/dashboard" element={<CompanyApp><Dashboard /></CompanyApp>} />
          <Route path="/documents" element={<CompanyApp><Documents /></CompanyApp>} />
          <Route path="/documents/new" element={<CompanyApp><Editor /></CompanyApp>} />
          <Route path="/documents/:id/edit" element={<CompanyApp><Editor /></CompanyApp>} />
          <Route path="/brand" element={<CompanyApp><Brand /></CompanyApp>} />
          <Route path="/plan" element={<CompanyApp><Plan /></CompanyApp>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminApp><AdminDashboard /></AdminApp>} />
          <Route path="/admin/companies" element={<AdminApp><Companies /></AdminApp>} />
          <Route path="/admin/companies/new" element={<AdminApp><CompanyForm /></AdminApp>} />
          <Route path="/admin/companies/:id" element={<AdminApp><CompanyForm /></AdminApp>} />
          <Route path="/admin/companies/:id/documents" element={<AdminApp><CompanyDocuments /></AdminApp>} />
          <Route path="/admin/plans" element={<AdminApp><Plans /></AdminApp>} />
          <Route path="/admin/activity" element={<AdminApp><Activity /></AdminApp>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
