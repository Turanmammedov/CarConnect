import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Users, Car, Loader2 } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import MapView from "../components/map/MapView";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import "../css/MapPage.css";

const FILTERS = [
  { id: null,       label: "Hamısı" },
  { id: "meetups",  label: "📍 Toplanma" },
  { id: "users",    label: "👤 İstifadəçilər" },
];

export default function MapPage() {
  const { groups }          = useApp();
  const { user, profile }   = useAuth();

  const [filter, setFilter]               = useState(null);
  const [sharingLocation, setSharingLocation] = useState(
    profile?.location_sharing ?? false
  );
  const [locLoading, setLocLoading]       = useState(false);
  const [locError, setLocError]           = useState("");
  const [nearbyUsers, setNearbyUsers]     = useState([]);
  const [myPosition, setMyPosition]       = useState(
    profile?.location_lat
      ? { lat: profile.location_lat, lng: profile.location_lng }
      : null
  );

  // ── load users sharing location ──────────────────────────────────────────
  const loadNearbyUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, location_lat, location_lng, cars(brand, model, year)")
      .eq("location_sharing", true)
      .not("location_lat", "is", null);

    if (!error) setNearbyUsers(data || []);
  }, []);

  useEffect(() => { loadNearbyUsers(); }, [loadNearbyUsers]);

  // ── sync sharingLocation from profile when it loads ──────────────────────
  useEffect(() => {
    if (profile) {
      setSharingLocation(profile.location_sharing ?? false);
      if (profile.location_lat) {
        setMyPosition({ lat: profile.location_lat, lng: profile.location_lng });
      }
    }
  }, [profile]);

  // ── GPS uğurlu callback ───────────────────────────────────────────────────
  const handlePositionSuccess = useCallback(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const { error } = await supabase.from("profiles").update({
      location_lat:        lat,
      location_lng:        lng,
      location_sharing:    true,
      location_updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if (error) {
      setLocError("Konum saxlanmadı: " + error.message);
    } else {
      setSharingLocation(true);
      setMyPosition({ lat, lng });
      loadNearbyUsers();
    }
    setLocLoading(false);
  }, [user, loadNearbyUsers]);

  // ── toggle location sharing ───────────────────────────────────────────────
  async function toggleLocationSharing() {
    if (!user) return;
    setLocError("");

    if (sharingLocation) {
      // Turn OFF
      setSharingLocation(false);
      await supabase.from("profiles")
        .update({ location_sharing: false })
        .eq("id", user.id);
      setMyPosition(null);
      loadNearbyUsers();
      return;
    }

    // Turn ON — request GPS
    setLocLoading(true);
    if (!navigator.geolocation) {
      setLocError("Cihazınız GPS-i dəstəkləmir");
      setLocLoading(false);
      return;
    }

    const errorMsgs = {
      1: "Konum icazəsi rədd edildi. Brauzer ayarlarından icazə verin.",
      2: "Konum əldə edilə bilmədi. WiFi və ya mobil data aktiv olduğunu yoxlayın.",
      3: "Konum sorğusu vaxt aşımına uğradı. Açıq bir yerdə yenidən cəhd edin.",
    };

    // WiFi/IP ilə sürətli konum al (enableHighAccuracy: false)
    // Uğurlu olarsa arxa planda GPS ilə daha dəqiq məlumat yenilənir
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      (err) => {
        setLocError(errorMsgs[err.code] || "Konum xətası baş verdi.");
        setLocLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  }

  const upcomingMeetups = groups
    .filter(g => g.next_meetup_lat && g.next_meetup_lng)
    .slice(0, 5);

  return (
    <div className="map-page">
      <TopBar
        title="MAP"
        rightAction={
          <button
            onClick={toggleLocationSharing}
            disabled={locLoading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 20, border: "none",
              cursor: locLoading ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 600,
              background: sharingLocation
                ? "rgba(34,197,94,0.2)"
                : "rgba(255,255,255,0.06)",
              color: sharingLocation ? "#22c55e" : "#888",
            }}
          >
            {locLoading
              ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Alınır...</>
              : <><Navigation size={13} />{sharingLocation ? "Konum Açıq" : "Konum Paylaş"}</>
            }
          </button>
        }
      />

      {/* Error banner */}
      {locError && (
        <div style={{
          margin: "0 16px 8px", padding: "10px 14px", borderRadius: 12,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#fca5a5", fontSize: 12,
        }}>
          ⚠️ {locError}
        </div>
      )}

      <div className="filters">
        {FILTERS.map(f => (
          <button
            key={String(f.id)}
            className={filter === f.id ? "filter active" : "filter"}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="map-container">
        <MapView
          filter={filter}
          groups={groups}
          nearbyUsers={nearbyUsers}
          myPosition={myPosition}
          currentUserId={user?.id}
        />
      </div>

      {/* Nearby users list */}
      {(filter === null || filter === "users") && nearbyUsers.length > 0 && (
        <div className="meetups">
          <p className="meetups-title">
            Konum paylaşan istifadəçilər ({nearbyUsers.length})
          </p>
          <div className="meetups-list">
            {nearbyUsers.map(u => (
              <div key={u.id} className="meetup-card">
                <div className="meetup-header">
                  <div className="avatar" style={{ background: "rgba(249,115,22,0.15)", color: "orange" }}>
                    {u.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="meetup-name">@{u.username}</p>
                </div>
                {u.cars?.[0] && (
                  <p className="meetup-location">
                    <Car size={10} /> {u.cars[0].brand} {u.cars[0].model}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meetup locations */}
      {(filter === null || filter === "meetups") && upcomingMeetups.length > 0 && (
        <div className="meetups">
          <p className="meetups-title">Toplanma yerləri</p>
          <div className="meetups-list">
            {upcomingMeetups.map(group => (
              <div key={group.id} className="meetup-card">
                <div className="meetup-header">
                  <div className="avatar"
                    style={{ background: (group.avatar_color || "#f97316") + "22", color: group.avatar_color || "#f97316" }}>
                    {group.name?.slice(0, 2)}
                  </div>
                  <p className="meetup-name">{group.name}</p>
                </div>
                {group.next_meetup_location && (
                  <p className="meetup-location"><MapPin size={10} /> {group.next_meetup_location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
