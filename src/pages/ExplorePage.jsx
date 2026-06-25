import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, UserPlus, UserCheck, Car, Users, Flame, Star, TrendingUp, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { optimizeUrl } from '../lib/cloudinary'
import { formatDistanceToNow } from 'date-fns'

// ── User profile drawer ────────────────────────────────────────────────────────
function UserDrawer({ userId, onClose }) {
  const { user } = useAuth()
  const { followUser, unfollowUser, getFollowStatus, getFollowCounts, getUserProfile, getUserPosts } = useApp()
  const [profile, setProfile]       = useState(null)
  const [userPosts, setUserPosts]   = useState([])
  const [isFollowing, setFollowing] = useState(false)
  const [counts, setCounts]         = useState({ followers: 0, following: 0 })
  const [loading, setLoading]       = useState(true)
  const [toggling, setToggling]     = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [p, posts, following, fc] = await Promise.all([
        getUserProfile(userId),
        getUserPosts(userId),
        getFollowStatus(userId),
        getFollowCounts(userId),
      ])
      setProfile(p)
      setUserPosts(posts)
      setFollowing(following)
      setCounts(fc)
      setLoading(false)
    }
    load()
  }, [userId])

  async function handleFollow() {
    setToggling(true)
    if (isFollowing) {
      await unfollowUser(userId)
      setFollowing(false)
      setCounts(c => ({ ...c, followers: c.followers - 1 }))
    } else {
      await followUser(userId)
      setFollowing(true)
      setCounts(c => ({ ...c, followers: c.followers + 1 }))
    }
    setToggling(false)
  }

  const car = profile?.cars?.[0]
  const isOwn = user?.id === userId

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div
        className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
        style={{ background: '#0f0f0f', maxHeight: '88dvh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center pb-10">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Cover / hero */}
            <div className="relative h-32" style={{ background: car?.color ? `${car.color}18` : 'rgba(249,115,22,0.08)' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #0f0f0f)' }} />
              {/* avatar */}
              <div className="absolute -bottom-10 left-5">
                <div className="w-20 h-20 rounded-2xl border-4 flex items-center justify-center text-2xl font-black"
                  style={{ borderColor: '#0f0f0f', background: `linear-gradient(135deg, ${car?.color || '#f97316'}, ${car?.color || '#ef4444'}88)` }}>
                  {profile?.full_name?.[0] || profile?.username?.[0] || '?'}
                </div>
              </div>
            </div>

            <div className="px-5 pt-12 pb-5">
              {/* name + follow */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold leading-tight">{profile?.full_name || profile?.username}</h2>
                  <p className="text-sm" style={{ color: '#f97316' }}>@{profile?.username}</p>
                  {profile?.bio && <p className="text-sm mt-1" style={{ color: '#888' }}>{profile.bio}</p>}
                </div>
                {!isOwn && (
                  <button
                    onClick={handleFollow}
                    disabled={toggling}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={isFollowing
                      ? { background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }
                      : { background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white' }
                    }
                  >
                    {isFollowing ? <><UserCheck size={15}/> İzlənir</> : <><UserPlus size={15}/> İzlə</>}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  [userPosts.length, 'Paylaşım'],
                  [counts.followers, 'İzləyici'],
                  [counts.following, 'İzlənən'],
                ].map(([val, label]) => (
                  <div key={label} className="text-center py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xl font-black" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</p>
                    <p className="text-xs" style={{ color: '#666' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Car */}
              {car && (
                <div className="mb-5 p-4 rounded-2xl" style={{ background: `${car.color || '#f97316'}0d`, border: `1px solid ${car.color || '#f97316'}22` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${car.color || '#f97316'}22` }}>
                      <Car size={18} style={{ color: car.color || '#f97316' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{car.brand} {car.model}</p>
                      <p className="text-xs" style={{ color: '#888' }}>{car.year}{car.horsepower ? ` · ${car.horsepower} HP` : ''}</p>
                    </div>
                    {car.color && <div className="ml-auto w-5 h-5 rounded-full border-2 border-white/10" style={{ background: car.color }} />}
                  </div>
                </div>
              )}

              {/* Posts grid */}
              {userPosts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#666' }}>Paylaşımlar</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {userPosts.slice(0, 9).map(post => (
                      <div key={post.id} className="aspect-square rounded-xl overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {post.image_url
                          ? <img src={optimizeUrl(post.image_url, { width: 200 })} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── User result card ───────────────────────────────────────────────────────────
function UserCard({ u, currentUserId, onOpen }) {
  const { followUser, unfollowUser } = useApp()
  const car = u.cars?.[0]
  const [following, setFollowing] = useState(u._isFollowing || false)

  async function handleFollow(e) {
    e.stopPropagation()
    if (following) { await unfollowUser(u.id); setFollowing(false) }
    else { await followUser(u.id); setFollowing(true) }
  }

  return (
    <div
      onClick={() => onOpen(u.id)}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${car?.color || '#f97316'}, ${car?.color || '#ef4444'}88)` }}>
        {u.full_name?.[0] || u.username?.[0] || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">{u.full_name || u.username}</span>
        </div>
        <span className="text-xs" style={{ color: '#666' }}>@{u.username}</span>
        {car && (
          <div className="flex items-center gap-1 mt-0.5">
            <Car size={10} style={{ color: car.color || '#f97316' }} />
            <span className="text-xs" style={{ color: '#888' }}>{car.brand} {car.model}</span>
          </div>
        )}
      </div>

      {u.id !== currentUserId && (
        <button
          onClick={handleFollow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
          style={following
            ? { background: 'rgba(255,255,255,0.06)', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }
            : { background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }
          }
        >
          {following ? <UserCheck size={12}/> : <UserPlus size={12}/>}
          {following ? 'İzlənir' : 'İzlə'}
        </button>
      )}
    </div>
  )
}

// ── Hot posts grid ─────────────────────────────────────────────────────────────
function PostGrid({ posts, onUserOpen }) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4">
      {posts.map((post, i) => (
        <div
          key={post.id}
          onClick={() => onUserOpen(post.user_id || post.profiles?.id)}
          className="rounded-2xl overflow-hidden cursor-pointer relative"
          style={{
            gridRow: i === 0 ? 'span 2' : 'span 1',
            aspectRatio: i === 0 ? '3/4' : '4/3',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          {post.image_url
            ? <img src={optimizeUrl(post.image_url, { width: 400 })} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>
          }
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            <p className="text-xs font-semibold truncate">@{post.profiles?.username || post.username}</p>
            {post.caption && <p className="text-[10px] truncate" style={{ color: '#aaa' }}>{post.caption}</p>}
          </div>
          {/* Like count badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            ❤️ {post.story_likes?.length || 0}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main ExplorePage ───────────────────────────────────────────────────────────
export default function ExplorePage() {
  const { posts, searchUsers, followUser, unfollowUser } = useApp()
  const { user } = useAuth()

  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [searching, setSearching]   = useState(false)
  const [activeTab, setActiveTab]   = useState('trending') // trending | people | cars
  const [drawerUser, setDrawerUser] = useState(null)
  const [suggestedUsers, setSuggestedUsers] = useState([])

  const inputRef = useRef()
  const debounce = useRef()

  // Trending: most liked posts
  const trendingPosts = [...posts]
    .sort((a, b) => (b.story_likes?.length || 0) - (a.story_likes?.length || 0))
    .slice(0, 9)

  // Recent posts
  const recentPosts = [...posts].slice(0, 8)

  // Load suggested users on mount
  useEffect(() => {
    async function loadSuggested() {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, cars(brand, model, year, color)')
        .neq('id', user?.id || '')
        .limit(8)
      if (data) {
        // Check follow status for each
        const withStatus = await Promise.all(data.map(async (u) => {
          const { data: f } = await supabase.from('follows')
            .select('follower_id').eq('follower_id', user?.id).eq('following_id', u.id).maybeSingle()
          return { ...u, _isFollowing: !!f }
        }))
        setSuggestedUsers(withStatus)
      }
    }
    if (user) loadSuggested()
  }, [user])

  // Debounced search
  const handleSearch = useCallback((val) => {
    setQuery(val)
    clearTimeout(debounce.current)
    if (!val.trim()) { setResults([]); setSearching(false); return }
    setSearching(true)
    debounce.current = setTimeout(async () => {
      const res = await searchUsers(val)
      setResults(res)
      setSearching(false)
    }, 350)
  }, [searchUsers])

  const isSearching = query.trim().length > 0
  const TABS = [
    { id: 'trending', icon: Flame,       label: 'Trend' },
    { id: 'people',   icon: Users,       label: 'İnsanlar' },
    { id: 'recent',   icon: TrendingUp,  label: 'Son' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#09090b', paddingBottom: 'calc(90px + env(safe-area-inset-bottom,0px))' }}>

      {/* ── Top search bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(16px)', padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '10px 14px' }}>
          <Search size={16} style={{ color: '#555', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="İstifadəçi, avtomobil axtar..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 14 }}
          />
          {query && (
            <button onClick={() => handleSearch('')} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Search results ── */}
      {isSearching ? (
        <div style={{ paddingTop: 8 }}>
          {searching ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
              <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
              <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>"{query}" üçün nəticə tapılmadı</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 11, color: '#555', padding: '8px 16px 4px', textTransform: 'uppercase', letterSpacing: 2 }}>
                {results.length} nəticə
              </p>
              {results.map(u => (
                <UserCard key={u.id} u={u} currentUserId={user?.id} onOpen={setDrawerUser} />
              ))}
            </>
          )}
        </div>
      ) : (
        <>
          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.2s',
                  background: activeTab === t.id ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === t.id ? 'white' : '#888',
                }}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {/* ── Suggested users strip ── */}
          {activeTab !== 'people' && suggestedUsers.length > 0 && (
            <div style={{ padding: '16px 0 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 10px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#ddd' }}>✨ Tövsiyə olunanlar</p>
                <button onClick={() => setActiveTab('people')} style={{ fontSize: 12, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Hamısı <ChevronRight size={12} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12, padding: '0 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {suggestedUsers.slice(0, 6).map(u => {
                  const car = u.cars?.[0]
                  return (
                    <div key={u.id} onClick={() => setDrawerUser(u.id)}
                      style={{ flexShrink: 0, width: 90, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 20, margin: '0 auto 6px',
                        background: `linear-gradient(135deg, ${car?.color || '#f97316'}, ${car?.color || '#ef4444'}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 900, border: '2px solid rgba(255,255,255,0.08)',
                      }}>
                        {u.full_name?.[0] || u.username?.[0] || '?'}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#ddd', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        @{u.username}
                      </p>
                      {car && <p style={{ fontSize: 10, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Tab content ── */}
          <div style={{ paddingTop: 12 }}>
            {/* TRENDING */}
            {activeTab === 'trending' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 12px' }}>
                  <Flame size={16} style={{ color: '#f97316' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ddd' }}>Trend Paylaşımlar</span>
                </div>
                <PostGrid posts={trendingPosts} onUserOpen={setDrawerUser} />
              </>
            )}

            {/* PEOPLE */}
            {activeTab === 'people' && (
              <div>
                <p style={{ fontSize: 11, color: '#555', padding: '0 16px 8px', textTransform: 'uppercase', letterSpacing: 2 }}>
                  İstifadəçilər
                </p>
                {suggestedUsers.map(u => (
                  <UserCard key={u.id} u={u} currentUserId={user?.id} onOpen={setDrawerUser} />
                ))}
              </div>
            )}

            {/* RECENT */}
            {activeTab === 'recent' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 12px' }}>
                  <TrendingUp size={16} style={{ color: '#f97316' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ddd' }}>Son Paylaşımlar</span>
                </div>
                <PostGrid posts={recentPosts} onUserOpen={setDrawerUser} />
              </>
            )}
          </div>
        </>
      )}

      {/* ── User profile drawer ── */}
      {drawerUser && <UserDrawer userId={drawerUser} onClose={() => setDrawerUser(null)} />}
    </div>
  )
}
