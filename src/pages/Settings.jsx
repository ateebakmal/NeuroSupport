import { hasSupabase } from '../lib/supabaseClient.js'

export default function Settings() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card">
        <h2 className="font-semibold mb-3">Backend</h2>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${hasSupabase ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {hasSupabase ? 'Supabase connected' : 'Local mode (mock)'}
          </span>
          {!hasSupabase && (
            <span className="text-sm text-slate-500">Add your Supabase keys to <code>.env</code> to switch.</span>
          )}
        </div>
      </div>

      <Section title="Theme">
        <Toggle label="Dark mode" hint="Coming soon" disabled />
      </Section>

      <Section title="Accessibility">
        <Toggle label="Reduced motion" />
        <Toggle label="Larger text" />
      </Section>

      <Section title="Webcam permissions">
        <p className="text-sm text-slate-600">Webcam access is requested per session. You can revoke it any time from your browser settings.</p>
      </Section>

      <Section title="Notifications">
        <Toggle label="Session reminders" />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  )
}

function Toggle({ label, hint, disabled }) {
  return (
    <label className={`flex items-center justify-between p-3 rounded-xl bg-brand-50 border border-brand-100 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <div className="font-medium">{label}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <input type="checkbox" disabled={disabled} className="w-5 h-5 accent-brand-600" />
    </label>
  )
}
