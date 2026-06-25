import { NavLink } from 'react-router-dom'
import { Home, Compass, Map, Users, User } from 'lucide-react'

const tabs = [
  { to: '/',         icon: Home,    label: 'Ana Səhifə' },
  { to: '/explore',  icon: Compass, label: 'Kəşfet' },
  { to: '/map',      icon: Map,     label: 'Xəritə' },
  { to: '/groups',   icon: Users,   label: 'Qruplar' },
  { to: '/profile',  icon: User,    label: 'Profil' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
      style={{
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #222',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 12px',
              borderRadius: 14,
              transition: 'all 0.2s',
              color: isActive ? '#ffffff' : '#444444',
              textDecoration: 'none',
              background: 'transparent',
              minWidth: 52,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: 0.3 }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
