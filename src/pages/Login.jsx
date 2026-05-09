import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try { await signIn(email, password); nav('/learners') }
    catch (e) { setErr(e.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your practice">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="btn-primary w-full" disabled={loading}>{loading?'Signing in…':'Login'}</button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-500">
        New here? <Link to="/signup" className="text-brand-700 font-medium">Create an account</Link>
      </div>
    </AuthShell>
  )
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold">N</div>
          <span className="font-bold text-xl">NeuroSupport</span>
        </Link>
        <div className="card">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-slate-500 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
