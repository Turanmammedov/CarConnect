const COLORS = ['bg-orange-500','bg-red-500','bg-pink-500','bg-purple-500','bg-blue-500','bg-teal-500','bg-green-500']

export default function Avatar({ user, size = 'md', ring = false }) {
  const sizeMap = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  }
  const colorIdx = user ? (user.username?.charCodeAt(0) || 0) % COLORS.length : 0
  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?'

  const inner = (
    <div className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${user?.avatar_url ? '' : COLORS[colorIdx]}`}>
      {user?.avatar_url
        ? <img src={user.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
        : initials}
    </div>
  )
  if (!ring) return inner
  return <div className="story-ring p-0.5 flex-shrink-0">{inner}</div>
}
