import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { AuthShell } from './Login.jsx'

export default function Signup() {
  const { signUp } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try { await signUp(email, password); nav('/learners') }
    catch (e) { setErr(e.message || 'Signup failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start supporting learners in minutes">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="btn-primary w-full" disabled={loading}>{loading?'Creating…':'Sign up'}</button>
      </form>
      <div className="mt-4 text-sm text-center text-slate-500">
        Already have an account? <Link to="/login" className="text-brand-700 font-medium">Login</Link>
      </div>
    </AuthShell>
  )
}
