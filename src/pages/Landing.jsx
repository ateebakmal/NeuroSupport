import { Link } from 'react-router-dom'

const features = [
  { title: 'Adaptive Coaching', desc: 'Real-time guidance that adjusts to the learner.', icon: '🧭' },
  { title: 'Emotion Detection', desc: 'Webcam-based reads of comfort, stress, and confusion.', icon: '🫀' },
  { title: 'Personalized Practice', desc: 'Sensory-aware sessions tuned per learner.', icon: '🎯' },
  { title: 'Scenario-Based Learning', desc: 'Real-life social situations, safe to practice.', icon: '🗣️' },
  { title: 'Progress Tracking', desc: 'Trends across comfort, stress, and growth.', icon: '📈' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold">N</div>
          <span className="font-bold text-lg">NeuroSupport</span>
        </Link>
        <nav className="flex items-center gap-2">
          <a href="#features" className="btn-ghost hidden sm:inline-flex">Features</a>
          <a href="#about" className="btn-ghost hidden sm:inline-flex">About</a>
          <Link to="/login" className="btn-ghost">Login</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="chip mb-4">For caregivers & therapists</span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Safe AI-Powered Practice for <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">Social & Communication</span> Skills
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            NeuroSupport helps autistic learners practice real-life situations through
            adaptive guided sessions — calm, supportive, and tuned to each learner.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-primary">Get Started</Link>
            <a href="#features" className="btn-secondary">Watch Demo</a>
          </div>
        </div>

        <div className="relative">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-slate-500">Scenario</div>
                <div className="font-semibold">Order at Café</div>
              </div>
              <span className="chip">Step 2 / 6</span>
            </div>
            <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 mb-4">
              <div className="text-sm text-slate-500 mb-1">Coach</div>
              <p className="text-slate-800">Take your time. Try saying: <em>"Hello, I would like to order."</em></p>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="chip">Calm</span>
              <span className="chip bg-amber-100 text-amber-700">Confused 81%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white border border-brand-100 py-2">Slowing pacing</div>
              <div className="rounded-lg bg-white border border-brand-100 py-2">More guidance</div>
              <div className="rounded-lg bg-white border border-brand-100 py-2">Simplify</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">What's inside</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="about" className="border-t border-brand-100 bg-white/40">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-wrap justify-between gap-4">
          <div>© NeuroSupport — University Project</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-700">Contact</a>
            <a href="#" className="hover:text-brand-700">GitHub</a>
            <a href="#" className="hover:text-brand-700">Demo</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
