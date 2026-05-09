import { useEffect, useState } from 'react'
import { useLearner } from '../context/LearnerContext.jsx'
import { api } from '../lib/api.js'

export default function LearnerProfile() {
  const { learner, setLearner } = useLearner()
  const [form, setForm] = useState(learner)
  const [sessions, setSessions] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => { api.listSessions(learner.id).then(setSessions) }, [learner.id])

  const save = async (e) => {
    e.preventDefault()
    const updated = await api.updateLearner(learner.id, form)
    setLearner(updated || form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setN = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Learner Profile</h1>

      <form onSubmit={save} className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="font-semibold">Basic info</h2>
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={set('name')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Age</label><input className="input" type="number" value={form.age} onChange={setN('age')} /></div>
            <div><label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={set('difficulty')}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">Sensory preferences</h2>
          <div>
            <label className="label">Noise sensitivity ({form.noise_sensitivity}/5)</label>
            <input type="range" min={1} max={5} value={form.noise_sensitivity} onChange={setN('noise_sensitivity')} className="w-full accent-brand-600" />
          </div>
          <div>
            <label className="label">Crowd sensitivity ({form.crowd_sensitivity}/5)</label>
            <input type="range" min={1} max={5} value={form.crowd_sensitivity} onChange={setN('crowd_sensitivity')} className="w-full accent-brand-600" />
          </div>
          <div>
            <label className="label">Pacing</label>
            <select className="input" value={form.pacing} onChange={set('pacing')}>
              <option>Slow</option><option>Normal</option>
            </select>
          </div>
        </div>

        <div className="card md:col-span-2">
          <h2 className="font-semibold mb-2">Goals</h2>
          <textarea className="input" rows={3} value={form.goals || ''} onChange={set('goals')} />
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button className="btn-primary">Save changes</button>
          {saved && <span className="text-emerald-600 text-sm">Saved ✓</span>}
        </div>
      </form>

      <div className="card">
        <h2 className="font-semibold mb-3">Session history</h2>
        {sessions.length === 0 ? (
          <div className="text-sm text-slate-500">No sessions yet.</div>
        ) : (
          <ul className="divide-y divide-brand-100">
            {sessions.map((s) => (
              <li key={s.id} className="py-2 flex justify-between text-sm">
                <span className="font-medium">{s.scenario_title}</span>
                <span className="text-slate-500">{new Date(s.completed_at).toLocaleString()} · {s.dominant_state}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
