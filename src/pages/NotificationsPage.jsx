import { useState } from "react";
import { Bell, Heart, Users, UserPlus, X, Check, ChevronRight, Loader2 } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import "../css/NotificationsPage.css";

const TYPE_CONFIG = {
  like:          { icon: Heart,    color: "#ef4444", label: "Bəyəndi" },
  group:         { icon: Users,    color: "#8b5cf6", label: "Qrup" },
  follow:        { icon: UserPlus, color: "#3b82f6", label: "İzlədi" },
  join_request:  { icon: Users,    color: "#f97316", label: "Qoşulma İstəyi" },
  join_accepted: { icon: Check,    color: "#22c55e", label: "Qəbul edildi" },
};

export default function NotificationsPage() {
  const { notifications, markNotifRead, respondJoinRequest, unreadCount } = useApp();
  const { user } = useAuth();
  const [responding, setResponding] = useState({});

  async function handleRespond(notif, accept) {
    setResponding(prev => ({ ...prev, [notif.id]: true }));
    // reference_id = group_id, we need request id — fetch it
    const { supabase } = await import("../lib/supabase");
    const { data: req } = await supabase
      .from("group_join_requests")
      .select("id, user_id")
      .eq("group_id", notif.reference_id)
      .eq("status", "pending")
      .maybeSingle();
    if (req) {
      await respondJoinRequest(req.id, notif.reference_id, req.user_id, accept);
    }
    await markNotifRead(notif.id);
    setResponding(prev => ({ ...prev, [notif.id]: false }));
  }

  return (
    <div className="notifications-page">
      <TopBar title={`Bildirişlər${unreadCount > 0 ? ` (${unreadCount})` : ""}`} />

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={40} />
            <p>Yeni bildiriş yoxdur</p>
          </div>
        ) : notifications.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.like;
          const Icon = cfg.icon;
          const isJoinRequest = n.type === "join_request";

          return (
            <div
              key={n.id}
              className="notif-card"
              style={{ opacity: n.read ? 0.6 : 1, borderLeft: !n.read ? `2px solid ${cfg.color}` : "2px solid transparent" }}
              onClick={() => !n.read && markNotifRead(n.id)}
            >
              {/* ICON */}
              <div className={`notif-icon`} style={{ background: cfg.color + "22", color: cfg.color }}>
                <Icon size={16} />
              </div>

              {/* TEXT */}
              <div className="notif-content" style={{ flex:1 }}>
                <p className="message">{n.message || `${cfg.label} bildirişi`}</p>
                <span className="time">
                  {new Date(n.created_at).toLocaleString("tr", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                </span>
              </div>

              {/* JOIN REQUEST ACTIONS */}
              {isJoinRequest && !n.read && (
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {responding[n.id] ? (
                    <Loader2 size={18} style={{ animation:"spin 1s linear infinite", color:"#888" }} />
                  ) : (
                    <>
                      <button onClick={e => { e.stopPropagation(); handleRespond(n, true) }}
                        style={{ padding:"6px 10px", borderRadius:8, background:"rgba(34,197,94,0.2)", border:"1px solid rgba(34,197,94,0.4)", color:"#22c55e", cursor:"pointer", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                        <Check size={12} /> Qəbul
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleRespond(n, false) }}
                        style={{ padding:"6px 10px", borderRadius:8, background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)", color:"#ef4444", cursor:"pointer", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                        <X size={12} /> Rədd
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* unread dot */}
              {!n.read && !isJoinRequest && (
                <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.color, flexShrink:0 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
