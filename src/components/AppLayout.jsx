import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLearner } from '../context/LearnerContext.jsx'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/scenarios', label: 'Scenario Library', icon: '🗂️' },
  { to: '/profile', label: 'Learner Profile', icon: '👤' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function AppLayout() {
  const { signOut } = useAuth()
  const { learner, setLearner } = useLearner()
  const navigate = useNavigate()

  const initials = (learner?.name || '?').slice(0, 1).toUpperCase()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 hidden md:flex flex-col bg-white/70 backdrop-blur border-r border-brand-100 p-5">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold">N</div>
          <span className="font-bold text-lg">NeuroSupport</span>
        </Link>

        <nav className="space-y-1 flex-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-brand-50'
                }`
              }
            >
              <span>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => { setLearner(null); navigate('/learners') }} className="btn-secondary text-sm w-full mb-2">
          Switch Learner
        </button>
        <button onClick={async () => { await signOut(); navigate('/') }} className="btn-ghost text-sm">
          Sign out
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/60 backdrop-blur border-b border-brand-100 flex items-center justify-between px-6">
          <div className="md:hidden font-bold">NeuroSupport</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500">Active learner</div>
              <div className="text-sm font-semibold">{learner?.name}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white font-semibold">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
