import { useState } from 'react'
import { Plus, X, Heart, Eye } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { optimizeUrl } from '../../lib/cloudinary'

// ── Story viewer modal ─────────────────────────────────────────────────────────
function StoryViewer({ post, onClose }) {
  const { toggleLike } = useApp()
  const { user } = useAuth()

  const profile  = post.profiles
  const car      = profile?.cars?.[0] || profile?.cars
  const isLiked  = post.story_likes?.some(l => l.user_id === user?.id)
  const likeCount = post.story_likes?.length || 0
  const accentColor = car?.color || '#f97316'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: 420,
          height: '85dvh', borderRadius: 28,
          background: `linear-gradient(160deg, ${accentColor}22 0%, #0a0a0a 50%)`,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* progress bar */}
        <div style={{ position: 'absolute', top: 10, left: 12, right: 12, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2, zIndex: 10 }}>
          <div style={{ height: '100%', width: '60%', background: 'white', borderRadius: 2 }} />
        </div>

        {/* header */}
        <div style={{ position: 'absolute', top: 22, left: 14, right: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}66)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900, color: 'white',
            }}>
              {profile?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1 }}>{profile?.username}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* image */}
        {post.image_url ? (
          <img src={optimizeUrl(post.image_url, { width: 600 })} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
            <span style={{ fontSize: 72 }}>🚗</span>
            {car && <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>{car.brand} {car.model}</p>}
            {post.caption && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{post.caption}</p>}
          </div>
        )}

        {/* overlay for image posts */}
        {post.image_url && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)' }} />}

        {/* caption + actions */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px', zIndex: 10 }}>
          {post.image_url && post.caption && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14, lineHeight: 1.5 }}>{post.caption}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              <Eye size={13} /> {post.views || 0}
            </div>
            <button onClick={() => toggleLike(post.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: isLiked ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.12)',
              color: isLiked ? '#ef4444' : 'white', transition: 'all 0.2s',
            }}>
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /> {likeCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── StoriesBar ─────────────────────────────────────────────────────────────────
export default function StoriesBar({ onAdd }) {
  const { posts } = useApp()
  const { profile } = useAuth()
  const [viewing, setViewing] = useState(null)

  // Only show stories (post_type = 'story') in bar, others in feed
  const stories = posts.filter(p => p.post_type === 'story')

  return (
    <>
      <div style={{ display: 'flex', gap: 14, padding: '10px 16px 6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {/* Add button */}
        <div onClick={onAdd} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 58, height: 58, borderRadius: 18,
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px dashed rgba(249,115,22,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} color="white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <span style={{ fontSize: 10, color: '#666', width: 58, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Əlavə et</span>
        </div>

        {/* Story items */}
        {stories.map(post => {
          const p = post.profiles
          const car = p?.cars?.[0] || p?.cars
          const accent = car?.color || '#f97316'
          return (
            <div key={post.id} onClick={() => setViewing(post)}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <div style={{ padding: 2.5, borderRadius: 20, background: `linear-gradient(135deg, ${accent}, ${accent}66)` }}>
                <div style={{ width: 54, height: 54, borderRadius: 17, overflow: 'hidden', border: '2px solid #09090b', background: '#141414' }}>
                  {post.image_url
                    ? <img src={optimizeUrl(post.image_url, { width: 120 })} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}22`, fontSize: 22 }}>🚗</div>
                  }
                </div>
              </div>
              <span style={{ fontSize: 10, color: '#888', width: 58, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p?.username}
              </span>
            </div>
          )
        })}
      </div>

      {viewing && <StoryViewer post={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}
