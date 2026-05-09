import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLearner } from '../context/LearnerContext.jsx'
import { api } from '../lib/api.js'
import { SCENARIOS } from '../data/scenarios.js'

export default function Dashboard() {
  const { learner } = useLearner()
  const [sessions, setSessions] = useState([])

  useEffect(() => { api.listSessions(learner.id).then(setSessions) }, [learner.id])

  const last = sessions[0]
  const recommended = SCENARIOS[1]

  const stats = [
    { label: 'Sessions Completed', value: sessions.length },
    { label: 'Last Emotion Trend', value: last?.dominant_state || 'Calm' },
    { label: 'Current Difficulty', value: learner.difficulty },
    { label: 'Last Scenario', value: last?.scenario_title || '—' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <section className="card bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm opacity-80">Welcome back</div>
            <h1 className="text-3xl font-extrabold">{learner.name}</h1>
            <p className="opacity-90 mt-1">Ready for today's practice session?</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/scenarios/${recommended.id}/configure`} className="bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50">Continue Practice</Link>
            <Link to="/scenarios" className="bg-white/15 text-white px-5 py-2.5 rounded-xl hover:bg-white/25">Browse Scenarios</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
            <div className="text-2xl font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-brand-700 font-semibold">Recommended next</div>
              <h2 className="text-xl font-bold">{recommended.title}</h2>
            </div>
            <span className="chip">{recommended.difficulty}</span>
          </div>
          <p className="text-slate-600 mb-4">
            {learner.name} performed well in guided communication tasks — this scenario builds on that.
          </p>
          <Link to={`/scenarios/${recommended.id}/configure`} className="btn-primary">Start Session</Link>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Progress overview</h3>
          <MiniChart sessions={sessions} />
          <div className="mt-3 text-sm text-slate-500">Comfort trend across sessions</div>
        </div>
      </section>

      <section className="card">
        <h3 className="font-semibold mb-3">Recent sessions</h3>
        {sessions.length === 0 ? (
          <div className="text-sm text-slate-500">No sessions yet. Start with a scenario from the library.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr><th className="py-2">Scenario</th><th>Date</th><th>Dominant state</th><th>Hints</th></tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map((s) => (
                  <tr key={s.id} className="border-t border-brand-100">
                    <td className="py-2 font-medium">{s.scenario_title}</td>
                    <td>{new Date(s.completed_at).toLocaleDateString()}</td>
                    <td><span className="chip">{s.dominant_state}</span></td>
                    <td>{s.hints_given}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function MiniChart({ sessions }) {
  const data = sessions.length
    ? sessions.slice(0, 8).reverse().map((s) => Math.max(20, 100 - (s.stress_moments || 0) * 15))
    : [50, 60, 55, 72, 80, 78, 84, 90]
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-brand-300 to-brand-600" style={{ height: `${(v/max)*100}%` }} />
      ))}
    </div>
  )
}
