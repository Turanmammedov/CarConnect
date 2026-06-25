import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

// ── custom icons ──────────────────────────────────────────────────────────────
function divIcon(html) {
  return L.divIcon({ html, className: '', iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20] })
}

const MY_ICON = divIcon(`
  <div style="width:40px;height:40px;border-radius:50%;background:rgba(59,130,246,0.9);
    display:flex;align-items:center;justify-content:center;
    border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.4)">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`)

function userIcon(initials, color = '#ffffff') {
  return divIcon(`
    <div style="width:40px;height:40px;border-radius:50%;background:${color};
      display:flex;align-items:center;justify-content:center;
      border:2px solid rgba(255,255,255,0.6);box-shadow:0 2px 8px rgba(0,0,0,0.5);
      font-weight:bold;font-size:13px;color:white;font-family:sans-serif">
      ${initials}
    </div>`)
}

const MEETUP_ICON = divIcon(`
  <div style="width:40px;height:40px;border-radius:50%;background:#ef4444;
    display:flex;align-items:center;justify-content:center;
    border:2px solid rgba(255,255,255,0.5);box-shadow:0 2px 8px rgba(0,0,0,0.5);font-size:18px">
    📍
  </div>`)

// ── auto-center on my position ────────────────────────────────────────────────
function FlyToMe({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 15, { duration: 1.2 })
  }, [position, map])
  return null
}

// ── default center: Baku ──────────────────────────────────────────────────────
const DEFAULT_CENTER = [40.4093, 49.8671]

export default function MapView({ filter, groups = [], nearbyUsers = [], myPosition, currentUserId }) {
  const showUsers   = !filter || filter === 'users'
  const showMeetups = !filter || filter === 'meetups'

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 16, overflow: 'hidden' }}>
      <MapContainer
        center={myPosition ? [myPosition.lat, myPosition.lng] : DEFAULT_CENTER}
        zoom={myPosition ? 15 : 13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CartoDB'
        />

        {/* Fly to my position when it changes */}
        {myPosition && <FlyToMe position={myPosition} />}

        {/* My own location — blue pin */}
        {myPosition && (
          <>
            <Marker position={[myPosition.lat, myPosition.lng]} icon={MY_ICON}>
              <Popup>
                <div style={{ background: '#1c1917', borderRadius: 12, padding: 12, color: 'white', minWidth: 140 }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>📍 Mənim yerim</p>
                  <p style={{ fontSize: 11, color: '#aaa' }}>Konum paylaşılıyor</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[myPosition.lat, myPosition.lng]}
              radius={150}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1.5, dashArray: '4' }}
            />
          </>
        )}

        {/* Other users sharing location — orange pins */}
        {showUsers && nearbyUsers
          .filter(u => u.id !== currentUserId && u.location_lat && u.location_lng)
          .map(u => (
            <Marker
              key={u.id}
              position={[u.location_lat, u.location_lng]}
              icon={userIcon(u.username?.slice(0, 2).toUpperCase() || '?')}
            >
              <Popup>
                <div style={{ background: '#1c1917', borderRadius: 12, padding: 12, color: 'white', minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f97316',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 'bold', color: 'white' }}>
                      {u.username?.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>@{u.username}</p>
                      {u.full_name && <p style={{ fontSize: 11, color: '#aaa' }}>{u.full_name}</p>}
                    </div>
                  </div>
                  {u.cars?.[0] && (
                    <p style={{ fontSize: 12, color: '#f97316' }}>
                      🚗 {u.cars[0].brand} {u.cars[0].model} {u.cars[0].year}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))
        }

        {/* Group meetup markers */}
        {showMeetups && groups
          .filter(g => g.next_meetup_lat && g.next_meetup_lng)
          .map(group => (
            <Marker
              key={`meetup-${group.id}`}
              position={[group.next_meetup_lat, group.next_meetup_lng]}
              icon={MEETUP_ICON}
            >
              <Popup>
                <div style={{ background: '#1c1917', borderRadius: 12, padding: 12, color: 'white', minWidth: 160 }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{group.name}</p>
                  <p style={{ fontSize: 11, color: '#ef4444' }}>📅 Toplanma</p>
                  {group.next_meetup_location && (
                    <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{group.next_meetup_location}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>
    </div>
  )
}
