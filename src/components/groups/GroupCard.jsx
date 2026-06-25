import { Users, MapPin, Calendar, Check } from 'lucide-react'
import { format } from 'date-fns'

export default function GroupCard({ group, isMember, onJoin, onLeave }) {
  function handleToggle(e) {
    e.stopPropagation()
    if (isMember) onLeave?.()
    else onJoin?.()
  }

  const meetupDate = group.next_meetup_date || group.next_meetup?.date
  const meetupLocation = group.next_meetup_location || group.next_meetup?.location
  const color = group.avatar_color || '#ffffff'

  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      borderRadius: 16,
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          {group.name?.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{group.name}</h3>
          <p style={{ fontSize: 12, color: '#555', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {group.description}
          </p>
        </div>
        <button
          onClick={handleToggle}
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600,
            padding: '6px 12px', borderRadius: 20,
            border: isMember ? '1px solid #333' : '1px solid #fff',
            background: isMember ? '#1a1a1a' : '#fff',
            color: isMember ? '#555' : '#000',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isMember ? <><Check size={11} />Üzv</> : 'Qoşul'}
        </button>
      </div>

      {group.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {group.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, background: '#1a1a1a', color: '#555',
              border: '1px solid #222', borderRadius: 20, padding: '2px 8px',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8, borderTop: '1px solid #878787', fontSize: 11, color: '#444' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={11} />{group.member_count || 0} üzv
        </span>
        {meetupDate && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} />{format(new Date(meetupDate), 'dd MMM')}
          </span>
        )}
        {meetupLocation && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
            <MapPin size={11} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meetupLocation.split(',')[0]}</span>
          </span>
        )}
      </div>
    </div>
  )
}
