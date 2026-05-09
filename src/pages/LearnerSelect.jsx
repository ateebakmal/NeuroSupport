import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLearner } from '../context/LearnerContext.jsx'
import { api } from '../lib/api.js'

const AVATARS = ['🦊', '🐼', '🐨', '🦁', '🐯', '🐰', '🦄', '🐧']

export default function LearnerSelect() {
  const { user, signOut } = useAuth()
  const { setLearner } = useLearner()
  const navigate = useNavigate()
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const load = async () => {
    setLoading(true)
    const list = await api.listLearners(user.id)
    setLearners(list)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const pick = (l) => { setLearner(l); navigate('/dashboard') }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold">N</div>
            <span className="font-bold text-lg">NeuroSupport</span>
          </Link>
          <button onClick={async () => { await signOut(); navigate('/') }} className="btn-ghost text-sm">Sign out</button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold">Who are you supporting today?</h1>
          <p className="text-slate-500 mt-2">Select a learner profile to continue.</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-500">Loading learners…</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {learners.map((l, i) => (
              <button key={l.id} onClick={() => pick(l)} className="card text-left hover:scale-[1.02] transition group">
                <div className="text-5xl mb-3">{AVATARS[i % AVATARS.length]}</div>
                <div className="font-semibold text-lg">{l.name}</div>
                <div className="text-sm text-slate-500">Age {l.age} · {l.difficulty}</div>
                <div className="mt-3 chip">Noise sensitivity {l.noise_sensitivity}/5</div>
              </button>
            ))}

            <button onClick={() => setShowAdd(true)} className="card text-left border-dashed hover:bg-brand-50">
              <div className="text-5xl mb-3">＋</div>
              <div className="font-semibold text-lg">Add Learner</div>
              <div className="text-sm text-slate-500">Create a new profile</div>
            </button>
          </div>
        )}
      </div>

      {showAdd && <AddLearnerModal onClose={() => setShowAdd(false)} onCreated={(l) => { setShowAdd(false); load() }} userId={user.id} />}
    </div>
  )
}

function AddLearnerModal({ onClose, onCreated, userId }) {
  const [form, setForm] = useState({
    name: '', age: 10, difficulty: 'Beginner',
    noise_sensitivity: 3, crowd_sensitivity: 3, pacing: 'Normal', goals: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setN = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { const l = await api.createLearner(userId, form); onCreated(l) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-soft max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Learner</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Age</label>
              <input className="input" type="number" min={3} max={30} value={form.age} onChange={setN('age')} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={set('difficulty')}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Noise sensitivity ({form.noise_sensitivity}/5)</label>
            <input type="range" min={1} max={5} value={form.noise_sensitivity} onChange={setN('noise_sensitivity')} className="w-full" />
          </div>
          <div>
            <label className="label">Crowd sensitivity ({form.crowd_sensitivity}/5)</label>
            <input type="range" min={1} max={5} value={form.crowd_sensitivity} onChange={setN('crowd_sensitivity')} className="w-full" />
          </div>
          <div>
            <label className="label">Pacing preference</label>
            <select className="input" value={form.pacing} onChange={set('pacing')}>
              <option>Slow</option><option>Normal</option>
            </select>
          </div>
          <div>
            <label className="label">Goals</label>
            <textarea className="input" rows={3} placeholder="Improve social interaction confidence" value={form.goals} onChange={set('goals')} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button className="btn-primary" disabled={saving}>{saving?'Saving…':'Save Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
