import { useState } from 'react'
import { Heart, MessageCircle, Share2, Gauge, Trash2, Bookmark, MoreHorizontal } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { optimizeUrl } from '../../lib/cloudinary'

export default function PostCard({ post }) {
  const { toggleLike, deletePost } = useApp()
  const { user } = useAuth()

  const profile  = post.profiles
  const car      = profile?.cars?.[0] || profile?.cars
  const isLiked  = post.story_likes?.some(l => l.user_id === user?.id)
  const likeCount = post.story_likes?.length || 0
  const isOwn    = post.user_id === user?.id

  const [saved, setSaved]       = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  async function handleDelete() {
    if (!confirm('Bu paylaşımı silmək istəyirsiniz?')) return
    await deletePost(post.id)
  }

  const accentColor = car?.color || '#f97316'

  return (
    <div className="animate-fade-up" style={{
      background: '#0f0f0f',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 12,
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 10px' }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 900, color: 'white',
          border: '2px solid rgba(255,255,255,0.08)',
        }}>
          {profile?.username?.[0]?.toUpperCase() || '?'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>
              {profile?.full_name || profile?.username}
            </span>
            {car && (
              <span style={{
                fontSize: 10, color: accentColor, background: `${accentColor}18`,
                border: `1px solid ${accentColor}30`, borderRadius: 20, padding: '2px 8px', fontWeight: 600
              }}>
                {car.brand} {car.model}
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, color: '#555' }}>
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>

        <button onClick={() => setShowMenu(!showMenu)} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* ── Image ── */}
      {post.image_url ? (
        <div style={{ margin: '0 12px', borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
          <img
            src={optimizeUrl(post.image_url, { width: 700 })}
            alt={post.caption}
            style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
          {/* Car HP badge */}
          {car?.horsepower && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              color: accentColor, fontSize: 11, fontWeight: 700,
              padding: '4px 10px', borderRadius: 20, fontFamily: 'monospace',
            }}>
              <Gauge size={11} /> {car.horsepower} HP
            </div>
          )}
        </div>
      ) : (
        <div style={{
          margin: '0 12px', borderRadius: 18, height: 160,
          background: `linear-gradient(135deg, ${accentColor}15, rgba(0,0,0,0.3))`,
          border: `1px solid ${accentColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8,
        }}>
          <span style={{ fontSize: 48 }}>🚗</span>
          {car?.horsepower && (
            <span style={{ color: accentColor, fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
              {car.horsepower} HP
            </span>
          )}
        </div>
      )}

      {/* ── Caption ── */}
      {post.caption && (
        <div style={{ padding: '10px 16px 6px' }}>
          <p style={{ fontSize: 13, color: '#ddd', lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700, color: '#f97316', marginRight: 6 }}>@{profile?.username}</span>
            {post.caption}
          </p>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px 14px' }}>
        <button
          onClick={() => toggleLike(post.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: isLiked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
            color: isLiked ? '#ef4444' : '#666',
            fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <Heart size={17} fill={isLiked ? 'currentColor' : 'none'} />
          {likeCount > 0 && likeCount}
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', color: '#666',
          fontSize: 13, fontWeight: 600,
        }}>
          <MessageCircle size={17} />
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', color: '#666',
        }}
          onClick={() => navigator.share?.({ text: post.caption || 'CarConnect' })}
        >
          <Share2 size={17} />
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <button onClick={() => setSaved(!saved)} style={{
          padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: saved ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
          color: saved ? '#f97316' : '#666',
        }}>
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {isOwn && (
          <button onClick={handleDelete} style={{
            padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', color: '#555',
          }}>
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* delete menu */}
      {showMenu && isOwn && (
        <div style={{
          position: 'absolute', right: 24, background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
          overflow: 'hidden', zIndex: 10,
        }}>
          <button onClick={() => { handleDelete(); setShowMenu(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13 }}>
            <Trash2 size={14} /> Sil
          </button>
        </div>
      )}
    </div>
  )
}
