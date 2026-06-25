import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(authUser) {
    if (!authUser) { setProfile(null); setRole(null); return }

    // Check super admin first
    const { data: admin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single()

    if (admin) {
      setProfile(admin)
      setRole('super_admin')
      sessionStorage.setItem('tvb_role', 'super_admin')
      return
    }

    // Check company
    const { data: company } = await supabase
      .from('companies')
      .select('*, plans(name, monthly_limit, features)')
      .eq('auth_user_id', authUser.id)
      .single()

    if (company) {
      setProfile(company)
      setRole('company')
      sessionStorage.setItem('tvb_role', 'company')
      await supabase.from('companies')
        .update({ last_login: new Date().toISOString() })
        .eq('id', company.id)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    sessionStorage.removeItem('tvb_role')
    setUser(null); setProfile(null); setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
