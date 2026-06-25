import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ title, showLogo, rightAction, back }) {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px 10px',
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #222',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {back && (
          <button onClick={() => navigate(-1)} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '7px 8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
            <ArrowLeft size={18} />
          </button>
        )}
        {showLogo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: '#535353',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>C</div>
            <span style={{ fontFamily: 'sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
              Car<span style={{ color: '#666' }}>Connect</span>
            </span>
          </div>
        ) : (
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>{title}</h1>
        )}
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  )
}
