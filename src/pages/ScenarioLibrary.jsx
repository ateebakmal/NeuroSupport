import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS } from '../data/scenarios.js'

export default function ScenarioLibrary() {
  const [q, setQ] = useState('')
  const [diff, setDiff] = useState('All')

  const filtered = SCENARIOS.filter((s) =>
    (diff === 'All' || s.difficulty === diff) &&
    (s.title.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Scenario Library</h1>
        <p className="text-slate-500">Pick a scenario to configure and practice.</p>
      </div>

      <div className="card flex flex-wrap gap-3 items-center">
        <input className="input flex-1 min-w-[200px]" placeholder="Search scenarios..." value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="input max-w-[180px]" value={diff} onChange={(e)=>setDiff(e.target.value)}>
          <option>All</option><option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => (
          <div key={s.id} className="card flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="chip">{s.category}</span>
              <span className="text-xs text-slate-500">{s.duration} min</span>
            </div>
            <h3 className="font-semibold text-lg">{s.title}</h3>
            <p className="text-sm text-slate-600 mt-1 flex-1">{s.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs font-medium text-brand-700">{s.difficulty}</span>
              <Link to={`/scenarios/${s.id}/configure`} className="btn-primary text-sm py-2 px-4">Start</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
