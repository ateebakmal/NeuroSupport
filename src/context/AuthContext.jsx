import { createContext, useContext, useEffect, useState } from 'react'
import { hasSupabase, supabase } from '../lib/supabaseClient.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const LS_USER = 'ns_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasSupabase) {
      // getSession reads from localStorage — fast, no network round-trip
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } else {
      const u = JSON.parse(localStorage.getItem(LS_USER) || 'null')
      setUser(u)
      setLoading(false)
    }
  }, [])

  const signIn = async (email, password) => {
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // Set user immediately so navigation guards don't race with onAuthStateChange
      setUser(data.user)
      return data.user
    }
    const u = { id: 'demo-' + email, email }
    localStorage.setItem(LS_USER, JSON.stringify(u))
    setUser(u)
    return u
  }

  const signUp = async (email, password) => {
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      // With email confirmation disabled in Supabase Auth settings,
      // data.session is populated immediately — set user right away.
      setUser(data.user)
      return data.user
    }
    return signIn(email, password)
  }

  const signOut = async () => {
    if (hasSupabase) await supabase.auth.signOut()
    localStorage.removeItem(LS_USER)
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}
