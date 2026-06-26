import { useState, useRef } from 'react'
import { Edit3, Car, Settings, LogOut, Plus, Check, X, Camera, Loader2, ImagePlus } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import Avatar from '../components/ui/Avatar'
import CarBadge from '../components/ui/CarBadge'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { uploadImage, avatarUrl } from '../lib/cloudinary'

// --- Car Editor Modal ---
function CarEditor({ car, onSave, onClose }) {
  const defaultForm = {
    brand: '', model: '', year: new Date().getFullYear(), color: '#f97316',
    horsepower: '', mods: [], photo_url: ''
  }
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    ...(car || {}),
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    color: car?.color || '#f97316',
    horsepower: car?.horsepower || '',
    mods: car?.mods || [],
    photo_url: car?.photo_url || '',
  }))
  const [newMod, setNewMod] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(car?.photo_url || null)
  const photoRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addMod = () => {
    if (newMod.trim()) { set('mods', [...(form.mods || []), newMod.trim()]); setNewMod('') }
  }
  const removeMod = (i) => set('mods', form.mods.filter((_, idx) => idx !== i))

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)
    try {
      const url = await uploadImage(file, 'cars')
      set('photo_url', url)
    } catch (err) {
      console.error('Foto yüklənmədi:', err)
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80" onClick={onClose}>
      <div className="w-full max-w-lg glass rounded-t-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Car size={18} className="text-orange-400" />
            {car ? 'Avtomobili düzəlt' : 'Avtomobil əlavə et'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5"><X size={18} /></button>
        </div>

        {/* ── Araba Fotoğrafı ── */}
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">Avtomobil şəkli</label>
          <div
            onClick={() => !photoUploading && photoRef.current?.click()}
            className="relative w-full rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-orange-500/40 transition-colors"
            style={{ height: 160, background: 'rgba(255,255,255,0.03)' }}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="car" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.55)' }}>
                  {photoUploading
                    ? <Loader2 size={28} className="animate-spin text-white" />
                    : <div className="flex flex-col items-center gap-1.5 text-white">
                        <Camera size={24} />
                        <span className="text-xs font-medium">Dəyiş</span>
                      </div>
                  }
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                {photoUploading
                  ? <><Loader2 size={28} className="animate-spin text-orange-400" /><span className="text-xs text-orange-400">Yüklənir...</span></>
                  : <><Camera size={28} /><span className="text-sm">Avtomobil şəkli əlavə et</span><span className="text-xs opacity-60">Cloudinary-ə yüklənəcək</span></>
                }
              </div>
            )}
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} hidden />
          {photoPreview && !photoUploading && (
            <button
              onClick={() => { setPhotoPreview(null); set('photo_url', '') }}
              className="mt-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X size={10} /> Şəkli sil
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[['brand','Marka *','Toyota, BMW...'],['model','Model *','Supra, M3...']].map(([k,label,ph]) => (
            <div key={k}>
              <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
              <input type="text" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
            </div>
          ))}
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">İl</label>
            <input type="number" value={form.year} onChange={e => set('year', Number(e.target.value))}
              min="1950" max={new Date().getFullYear() + 1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">At gücü (HP)</label>
            <input type="number" value={form.horsepower} onChange={e => set('horsepower', Number(e.target.value))}
              placeholder="300"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Avtomobil rəngi</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
              className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <span className="text-sm text-zinc-400 font-mono">{form.color}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-2 block">Modifikasiyalar</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.mods?.map((mod, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">
                {mod}
                <button onClick={() => removeMod(i)}><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newMod} onChange={e => setNewMod(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMod()}
              placeholder="Turbo kit, Coilovers..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
            <button onClick={addMod} className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={!form.brand.trim() || !form.model.trim() || saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-xl disabled:opacity-30">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Saxla</>}
        </button>
      </div>
    </div>
  )
}

// --- Edit Profile Modal ---
function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ full_name: profile?.full_name || '', bio: profile?.bio || '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80" onClick={onClose}>
      <div className="w-full max-w-lg glass rounded-t-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profili düzəlt</h2>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5"><X size={18} /></button>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Ad</label>
          <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50" />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Bio</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
            placeholder="Özünüz haqqında..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-orange-500/50"
            rows={3} />
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-xl disabled:opacity-30">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Saxla</>}
        </button>
      </div>
    </div>
  )
}

// --- Main Profile Page ---
export default function ProfilePage() {
  const { profile, user, updateProfile, signOut, refreshProfile } = useAuth()
  const { posts, groups } = useApp()
  const [showCarEditor, setShowCarEditor] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarFileRef = useRef()

  const car = profile?.cars?.[0] || profile?.cars

  // User's own posts
  const myPosts = posts.filter(p => p.user_id === user?.id)

  // User's groups
  const [myGroupIds, setMyGroupIds] = useState([])

  // Fetch user's group memberships
  useState(() => {
    if (!user) return
    supabase.from('group_members').select('group_id').eq('user_id', user.id)
      .then(({ data }) => setMyGroupIds(data?.map(r => r.group_id) || []))
  }, [user])

  const myGroups = groups.filter(g => myGroupIds.includes(g.id))

  // Avatar upload
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const url = await uploadImage(file, 'avatars')
      await updateProfile({ avatar_url: url })
    } catch (err) {
      alert('Avatar yüklənmədi: ' + err.message)
    } finally {
      setAvatarUploading(false)
    }
  }

  // Save car to Supabase
  async function saveCar(carData) {
    if (!user) return
    const payload = {
      brand: carData.brand,
      model: carData.model,
      year: carData.year,
      color: carData.color,
      horsepower: carData.horsepower,
      mods: carData.mods,
      photo_url: carData.photo_url || null,
    }
    if (car?.id) {
      await supabase.from('cars').update(payload).eq('id', car.id)
    } else {
      await supabase.from('cars').insert({ ...payload, user_id: user.id })
    }
    await refreshProfile()
  }

  async function handleSignOut() {
    if (!confirm('Çıxmaq istədiyinizdən əminsinizmi?')) return
    await signOut()
  }

  return (
    <div style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
      <TopBar title="Profil" />

      {/* Profile header */}
      <div className="px-4 pt-6 pb-4 text-center">
        {/* Avatar with upload */}
        <div className="flex justify-center mb-3 relative">
          <div className="relative">
            <Avatar user={profile} size="xl" />
            <button
              onClick={() => avatarFileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-zinc-950 hover:bg-orange-400 transition-colors"
            >
              {avatarUploading
                ? <Loader2 size={14} className="text-white animate-spin" />
                : <Camera size={14} className="text-white" />
              }
            </button>
          </div>
          <input ref={avatarFileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        <h1 className="text-xl font-bold">{profile?.full_name || profile?.username}</h1>
        <p className="text-zinc-500 text-sm">@{profile?.username}</p>
        {profile?.bio && (
          <p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto">{profile.bio}</p>
        )}

        <div className="flex justify-center gap-6 mt-4 text-center">
          <div>
            <p className="text-xl font-bold">{myGroups.length}</p>
            <p className="text-xs text-zinc-500">Qrup</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-xl font-bold">{myPosts.length}</p>
            <p className="text-xs text-zinc-500">Paylaşım</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-xl font-bold">0</p>
            <p className="text-xs text-zinc-500">İzləyici</p>
          </div>
        </div>

        <button
          onClick={() => setShowEditProfile(true)}
          className="mt-4 flex items-center gap-1.5 mx-auto text-xs text-orange-400 border border-orange-500/30 rounded-full px-3 py-1.5 hover:bg-orange-500/10 transition-colors"
        >
          <Edit3 size={12} /> Profili düzəlt
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Car section */}
        <div className="glass-light rounded-2xl p-4 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Car size={16} className="text-orange-400" />
              Avtomobilim
            </h2>
            <button onClick={() => setShowCarEditor(true)}
              className="text-xs text-white-400 flex items-center gap-1 hover:text-orange-300 transition-colors">
              <Edit3 size={13} />
              {car ? 'Düzəlt' : 'Əlavə et'}
            </button>
          </div>
          {car ? (
            <CarBadge car={car} />
          ) : (
            <button onClick={() => setShowCarEditor(true)}
              className="w-full border-2 border-dashed border-white/10 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-orange-500/40 transition-colors text-zinc-500 hover:text-zinc-300">
              <Car size={24} />
              <p className="text-sm">Avtomobilini əlavə et</p>
            </button>
          )}
        </div>

        {/* My recent posts */}
        {myPosts.length > 0 && (
          <div className="glass-light rounded-2xl p-4 border border-white/8">
            <h2 className="font-semibold text-sm mb-3">Son paylaşımlarım</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {myPosts.slice(0, 6).map(post => (
                <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                  {post.image_url
                    ? <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl">🚗</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My groups */}
        {myGroups.length > 0 && (
          <div className="glass-light rounded-2xl p-4 border border-white/8">
            <h2 className="font-semibold text-sm mb-3">Mənim qruplarım</h2>
            <div className="space-y-2">
              {myGroups.map(g => (
                <div key={g.id} className="flex items-center gap-2 py-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: (g.avatar_color || '#f97316') + '22', color: g.avatar_color || '#f97316' }}>
                    {g.name.slice(0,2)}
                  </div>
                  <span className="text-sm flex-1">{g.name}</span>
                  <span className="text-xs text-zinc-500">{g.member_count} üzv</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings & logout */}
        <div className="glass-light rounded-2xl border border-white/8 overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-white/5 transition-colors border-b border-white/5 text-zinc-300">
            <Settings size={17} />
            Tənzimləmələr
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-white/5 transition-colors text-red-400"
          >
            <LogOut size={17} />
            Çıxış
          </button>
        </div>

        <p className="text-xs text-zinc-700 text-center pb-2">{user?.email}</p>
      </div>

      {showCarEditor && (
        <CarEditor car={car} onSave={saveCar} onClose={() => setShowCarEditor(false)} />
      )}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onSave={async (data) => { await updateProfile(data) }}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </div>
  )
}
