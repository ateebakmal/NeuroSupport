import { Link, useParams } from 'react-router-dom'
import { findScenario } from '../data/scenarios.js'

export default function SessionSummary() {
  const { id } = useParams()
  const scenario = findScenario(id)
  const summary = JSON.parse(sessionStorage.getItem('ns_last_summary') || '{}')

  const cards = [
    { label: 'Scenario Completed', value: scenario?.title || '—' },
    { label: 'Dominant State', value: summary.dominant || 'Calm' },
    { label: 'Stress Moments', value: summary.stress ?? 0 },
    { label: 'Coaching Hints Given', value: summary.hints ?? 0 },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card text-center bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
        <div className="text-5xl mb-2">🎉</div>
        <h1 className="text-3xl font-extrabold">Session Complete</h1>
        <p className="opacity-90 mt-1">Great work today!</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="text-xs uppercase tracking-wide text-slate-500">{c.label}</div>
            <div className="text-xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Recommendations</h2>
        <p className="text-slate-700">Try the same scenario with slightly reduced noise level, or move on to <strong>Ask Shop Worker for Assistance</strong>.</p>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Reflection</h2>
        <p className="text-slate-700">The learner responded well to slower pacing and high guidance. Keep coaching brief and warm.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/dashboard" className="btn-primary">Return to Dashboard</Link>
        <Link to={`/scenarios/${id}/configure`} className="btn-secondary">Retry Scenario</Link>
        <Link to="/scenarios" className="btn-ghost">Browse Scenarios</Link>
      </div>
    </div>
  )
}
