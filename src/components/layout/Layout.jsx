import { NavLink } from 'react-router-dom'
import { Home, Users, Map, User } from 'lucide-react'

const NAV = [
  { to: '/',       icon: Home,  label: 'Akış' },
  { to: '/groups', icon: Users, label: 'Gruplar' },
  { to: '/map',    icon: Map,   label: 'Harita' },
  { to: '/profile',icon: User,  label: 'Profil' },
]

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-zinc-800">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-6 transition-colors ${
                  isActive ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
