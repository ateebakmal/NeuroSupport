import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { findScenario } from '../data/scenarios.js'

export default function ScenarioConfig() {
  const { id } = useParams()
  const nav = useNavigate()
  const scenario = findScenario(id)
  const [cfg, setCfg] = useState({
    noise: 2, people: 2, complexity: 'Standard', pacing: 'Normal', hints: 'Moderate Guidance', webcam: true,
  })

  if (!scenario) return <div>Scenario not found.</div>
  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }))

  const start = () => {
    sessionStorage.setItem('ns_session_cfg', JSON.stringify(cfg))
    nav(`/scenarios/${id}/session`)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl">
      <div className="card">
        <span className="chip mb-2">{scenario.category}</span>
        <h1 className="text-2xl font-bold">{scenario.title}</h1>
        <p className="text-slate-600 mt-2">{scenario.description}</p>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Learning objectives</div>
          <ul className="space-y-1 text-sm">
            {scenario.objectives.map((o) => <li key={o}>• {o}</li>)}
          </ul>
        </div>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Steps preview</div>
          <ol className="space-y-1 text-sm list-decimal list-inside text-slate-700">
            {scenario.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </div>

        <div className="mt-5 text-sm text-slate-500">Estimated duration: {scenario.duration} min</div>
      </div>

      <div className="card space-y-5">
        <h2 className="text-lg font-bold">Session configuration</h2>

        <Slider label="Noise level" value={cfg.noise} min={1} max={5} onChange={(v)=>set('noise', v)} />
        <Slider label="Virtual people" value={cfg.people} min={0} max={8} onChange={(v)=>set('people', v)} />

        <div>
          <label className="label">Task complexity</label>
          <select className="input" value={cfg.complexity} onChange={(e)=>set('complexity', e.target.value)}>
            <option>Simple</option><option>Standard</option><option>Detailed</option>
          </select>
        </div>

        <Radio label="Pacing mode" value={cfg.pacing} options={['Slow','Normal']} onChange={(v)=>set('pacing', v)} />
        <Radio label="Hint level" value={cfg.hints} options={['High Guidance','Moderate Guidance','Minimal Guidance']} onChange={(v)=>set('hints', v)} />

        <label className="flex items-center justify-between p-3 rounded-xl bg-brand-50 border border-brand-100">
          <span className="font-medium">Enable webcam detection</span>
          <input type="checkbox" checked={cfg.webcam} onChange={(e)=>set('webcam', e.target.checked)} className="w-5 h-5 accent-brand-600" />
        </label>

        <div className="rounded-xl bg-white border border-brand-100 p-4 text-sm space-y-1">
          <div><span className="text-slate-500">Environment complexity:</span> <strong>{cfg.noise + cfg.people > 6 ? 'High' : cfg.noise + cfg.people > 3 ? 'Moderate' : 'Low'}</strong></div>
          <div><span className="text-slate-500">Estimated difficulty:</span> <strong>{cfg.complexity}</strong></div>
          <div><span className="text-slate-500">Adaptive guidance:</span> <strong>{cfg.hints !== 'Minimal Guidance' ? 'Enabled' : 'Light'}</strong></div>
        </div>

        <div className="flex gap-2 justify-end">
          <Link to="/scenarios" className="btn-ghost">Cancel</Link>
          <button onClick={start} className="btn-primary">Start Practice Session</button>
        </div>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="label mb-0">{label}</label>
        <span className="text-sm font-semibold text-brand-700">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e)=>onChange(Number(e.target.value))} className="w-full accent-brand-600" />
    </div>
  )
}

function Radio({ label, value, options, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={()=>onChange(o)} type="button"
            className={`px-3 py-2 rounded-xl text-sm border transition ${value===o ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-brand-200 text-slate-700 hover:bg-brand-50'}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
