import { useState, useEffect } from "react";
import {
  Plus, Search, Users, MessageCircle, Calendar, ChevronLeft,
  Send, X, MapPin, Check, Loader2, Lock, Globe,
  Settings, Crown, ToggleLeft, ToggleRight, Car,
} from "lucide-react";
import TopBar from "../components/layout/TopBar";
import GroupCard from "../components/groups/GroupCard";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import "../css/GroupsPage.css";

// ─── Admin Panel ──────────────────────────────────────────────────────────────
function AdminPanel({ group, onClose, onUpdated }) {
  const { updateGroup } = useApp();
  const [name, setName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [locationSharing, setLocationSharing] = useState(group.location_sharing ?? false);
  const [rules, setRules] = useState(group.rules || []);
  const [newRule, setNewRule] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function addRule() {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    setRules(prev => [...prev, trimmed]);
    setNewRule("");
  }

  function removeRule(idx) {
    setRules(prev => prev.filter((_, i) => i !== idx));
  }

  function startEdit(idx) {
    setEditingIdx(idx);
    setEditingText(rules[idx]);
  }

  function saveEdit() {
    if (!editingText.trim()) return;
    setRules(prev => prev.map((r, i) => i === editingIdx ? editingText.trim() : r));
    setEditingIdx(null);
    setEditingText("");
  }

  function moveRule(idx, dir) {
    setRules(prev => {
      const arr = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return arr;
    });
  }

  async function handleSave() {
    if (!name.trim()) { setError("Ad boş ola bilməz"); return; }
    setLoading(true);
    setError("");
    const { error } = await updateGroup(group.id, {
      name: name.trim(),
      description: description.trim(),
      location_sharing: locationSharing,
      rules,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onUpdated(); }, 1200);
  }

  const inputStyle = { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 12px", color:"white", outline:"none", boxSizing:"border-box", fontSize:14 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300 }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:500, background:"#111", borderRadius:"20px 20px 0 0", padding:20, display:"flex", flexDirection:"column", gap:14, maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, color:"white" }}>
            <Crown size={16} color="orange" />
            <span style={{ fontWeight:700, fontSize:15 }}>Admin Paneli</span>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)", border:"none", padding:6, borderRadius:"50%", cursor:"pointer", color:"white" }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <p style={{ fontSize:11, color:"#888", marginBottom:4 }}>Qrup adı</p>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <p style={{ fontSize:11, color:"#888", marginBottom:4 }}>Açıqlama</p>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle, fontSize:13, resize:"none" }} />
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 14px" }}>
          <div>
            <p style={{ color:"white", fontSize:13, fontWeight:600, margin:0 }}>Konum Paylaşımı</p>
            <p style={{ color:"#666", fontSize:11, margin:"2px 0 0" }}>Üzvlər xəritədə görünsün</p>
          </div>
          <button onClick={() => setLocationSharing(v => !v)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
            {locationSharing
              ? <ToggleRight size={32} color="#22c55e" />
              : <ToggleLeft size={32} color="#555" />}
          </button>
        </div>

        {/* ── QAYDALAR ── */}
        <div>
          <p style={{ fontSize:11, color:"#888", marginBottom:8, display:"flex", alignItems:"center", gap:4 }}>
            📋 Qrup Qaydaları
          </p>

          {rules.length === 0 && (
            <div style={{ fontSize:12, color:"#444", padding:"10px 0", textAlign:"center" }}>Hələ qayda yoxdur</div>
          )}

          {rules.map((rule, idx) => (
            <div key={idx} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"8px 10px", marginBottom:6 }}>
              {editingIdx === idx ? (
                <div style={{ display:"flex", gap:6 }}>
                  <input
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveEdit()}
                    autoFocus
                    style={{ ...inputStyle, flex:1, fontSize:12, padding:"6px 10px" }}
                  />
                  <button onClick={saveEdit} style={{ background:"#22c55e22", border:"1px solid #22c55e44", borderRadius:8, color:"#22c55e", padding:"4px 10px", cursor:"pointer", fontSize:12, fontWeight:700 }}>✓</button>
                  <button onClick={() => setEditingIdx(null)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#888", padding:"4px 8px", cursor:"pointer", fontSize:12 }}>İptal</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, color:"#f97316", fontWeight:700, minWidth:20 }}>{idx + 1}.</span>
                  <span style={{ flex:1, fontSize:12, color:"#ccc", lineHeight:1.4 }}>{rule}</span>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    <button onClick={() => moveRule(idx, -1)} disabled={idx === 0}
                      style={{ background:"none", border:"none", color: idx === 0 ? "#333" : "#666", cursor: idx === 0 ? "default" : "pointer", padding:"2px 4px", fontSize:12 }}>↑</button>
                    <button onClick={() => moveRule(idx, 1)} disabled={idx === rules.length - 1}
                      style={{ background:"none", border:"none", color: idx === rules.length - 1 ? "#333" : "#666", cursor: idx === rules.length - 1 ? "default" : "pointer", padding:"2px 4px", fontSize:12 }}>↓</button>
                    <button onClick={() => startEdit(idx)}
                      style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"white", padding:"3px 8px", cursor:"pointer", fontSize:11 }}>✏️</button>
                    <button onClick={() => removeRule(idx)}
                      style={{ background:"rgba(255,80,80,0.1)", border:"1px solid rgba(255,80,80,0.2)", borderRadius:6, color:"#ff6b6b", padding:"3px 8px", cursor:"pointer", fontSize:11 }}>🗑</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display:"flex", gap:6, marginTop:4 }}>
            <input
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addRule()}
              placeholder="Yeni qayda əlavə et..."
              style={{ ...inputStyle, flex:1, fontSize:12, padding:"8px 12px" }}
            />
            <button onClick={addRule}
              style={{ background:"rgba(249,115,22,0.15)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:10, color:"orange", padding:"8px 12px", cursor:"pointer", fontWeight:700, fontSize:13, flexShrink:0 }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {error && <div style={{ color:"#ff6b6b", fontSize:12 }}>⚠️ {error}</div>}
        {success && <div style={{ color:"#22c55e", fontSize:12 }}>✓ Yadda saxlanıldı!</div>}

        <button onClick={handleSave} disabled={loading}
          style={{ padding:"12px", borderRadius:10, background:"linear-gradient(120deg,white,black)", border:"none", color:"white", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          {loading ? <><Loader2 size={15} className="spin" /> Saxlanılır...</> : "Dəyişiklikləri Saxla"}
        </button>
      </div>
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────
function MembersTab({ groupId, currentUserId }) {
  const { fetchGroupMembers } = useApp();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupMembers(groupId).then(({ data }) => {
      setMembers(data);
      setLoading(false);
    });
  }, [groupId]);

  if (loading) return (
    <div style={{ textAlign:"center", paddingTop:40, color:"#555" }}>
      <Loader2 size={22} className="spin" />
    </div>
  );

  const admins = members.filter(m => m.role === "admin");
  const others = members.filter(m => m.role !== "admin");
  const sorted = [...admins, ...others];

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:8 }}>
      {sorted.map(m => {
        const p = m.profiles;
        const isAdmin = m.role === "admin";
        const isMe = m.user_id === currentUserId;
        return (
          <div key={m.user_id} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.04)", border:`1px solid ${isAdmin ? "rgba(255,165,0,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius:12, padding:"10px 14px" }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,white,black)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:"bold", color:"white", flexShrink:0 }}>
              {p?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"white", fontWeight:600, fontSize:13 }}>@{p?.username}</span>
                {isMe && <span style={{ fontSize:10, color:"#666", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"1px 6px" }}>sən</span>}
              </div>
              {p?.full_name && <div style={{ fontSize:11, color:"#666", marginTop:1 }}>{p.full_name}</div>}
            </div>
            {isAdmin && (
              <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(210, 210, 210, 0.12)", border:"1px solid rgba(193, 193, 193, 0.25)", borderRadius:20, padding:"3px 10px", flexShrink:0 }}>
                <Crown size={11} color="orange" />
                <span style={{ fontSize:11, color:"white", fontWeight:700 }}>Admin</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Create Event Modal ───────────────────────────────────────────────────────
function CreateEventModal({ groupId, createEvent, onClose }) {
  const [form, setForm] = useState({ title:"", description:"", event_date:"", location_name:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({...f, [k]:v}));

  async function handleCreate() {
    if (!form.title.trim() || !form.event_date) { setError("Ad ve tarih zorunludur"); return; }
    setLoading(true);
    const { error } = await createEvent({ ...form, group_id: groupId });
    if (error) setError(error.message);
    else onClose();
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200 }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:500, background:"#0f0f0f", borderRadius:"20px 20px 0 0", padding:20, display:"flex", flexDirection:"column", gap:14 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ color:"white", fontSize:16, margin:0 }}>Yeni Tədbir</h2>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)", border:"none", padding:6, borderRadius:"50%", cursor:"pointer", color:"white" }}><X size={18}/></button>
        </div>
        {[["title","Başlıq *","Bakı Drift Gecəsi"],["description","Açıqlama","Tədbir haqqında..."],["location_name","Məkan","Atatürk Meydanı"]].map(([k,l,ph]) => (
          <div key={k}>
            <p style={{ fontSize:11, color:"#888", marginBottom:4 }}>{l}</p>
            <input value={form[k]} onChange={e => set(k,e.target.value)} placeholder={ph}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(189, 189, 189, 0.53)", borderRadius:10, padding:"10px 12px", color:"white", outline:"none", boxSizing:"border-box" }} />
          </div>
        ))}
        <div>
          <p style={{ fontSize:11, color:"#888", marginBottom:4 }}>Tarix və Saat *</p>
          <input type="datetime-local" value={form.event_date} onChange={e => set("event_date",e.target.value)}
            style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(189, 189, 189, 0.53)", borderRadius:10, padding:"10px 12px", color:"white", outline:"none", boxSizing:"border-box", colorScheme:"dark" }} />
        </div>
        {error && <div style={{ color:"#ff6b6b", fontSize:12 }}>{error}</div>}
        <button onClick={handleCreate} disabled={loading}
          style={{ padding:"12px", borderRadius:10, background:"linear-gradient(120deg,white,black)", border:"none", color:"white", fontWeight:750, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          {loading ? <><Loader2 size={15} className="spin"/> Yaradılır...</> : "Tədbiri Yarat"}
        </button>
      </div>
    </div>
  );
}

// ─── Group Detail View ────────────────────────────────────────────────────────
function GroupDetailView({ group: initialGroup, isMember: isMemberProp, myGroupIds, onBack, onJoinToggle }) {
  const { user } = useAuth();
  const {
    fetchGroupMessages, sendGroupMessage,
    fetchGroupEvents, createEvent, toggleEventAttendance,
    sendJoinRequest,
  } = useApp();

  const [group, setGroup] = useState(initialGroup);
  // isMember-i daxili state kimi saxlayırıq ki, join/leave dərhal UI-ı yeniləsin
  const [isMember, setIsMember] = useState(isMemberProp);
  const [subTab, setSubTab] = useState("detail");
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [myRole, setMyRole] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const isPrivate = group.group_type === "private" || group.type === "private";
  const isAdmin = myRole === "admin";

  // prop dəyişəndə sync et
  useEffect(() => {
    setIsMember(isMemberProp);
  }, [isMemberProp]);

  useEffect(() => {
    if (!user || !isMember) return;
    supabase
      .from("group_members")
      .select("role")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setMyRole(data?.role || "member"));
  }, [group.id, user, isMember]);

  useEffect(() => {
    if (subTab === "chat" && isMember) loadMessages();
    if (subTab === "events") loadEvents();
  }, [subTab]);

  useEffect(() => {
    if (subTab !== "chat" || !isMember) return;
    const channel = supabase.channel(`grp-${group.id}`)
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"group_messages", filter:`group_id=eq.${group.id}` },
        () => loadMessages()
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [subTab, group.id, isMember]);

  async function loadMessages() {
    setMsgLoading(true);
    const { data } = await fetchGroupMessages(group.id);
    setMessages(data);
    setMsgLoading(false);
  }

  async function loadEvents() {
    const { data } = await fetchGroupEvents(group.id);
    setEvents(data);
  }

  async function handleSend() {
    if (!msgInput.trim()) return;
    await sendGroupMessage(group.id, msgInput.trim());
    setMsgInput("");
    loadMessages();
  }

  async function handleJoinRequest() {
    const { error } = await sendJoinRequest(group.id);
    if (!error) setJoinRequested(true);
  }

  const avatarColor = group.avatar_color || "#f97316";

  const tabs = [
    ["detail", "Haqqında"],
    ["members", "Üzvlər"],
    ["chat", "Söhbət"],
    ["events", "Tədbirlər"],
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", paddingBottom:"calc(70px + env(safe-area-inset-bottom, 0px))", color:"white", background:"#09090b" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"white", cursor:"pointer" }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:13,
          background: avatarColor + "22", color: avatarColor, border:`1px solid ${avatarColor}44` }}>
          {group.name?.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontWeight:600, fontSize:15 }}>{group.name}</span>
            {isPrivate ? <Lock size={12} color="#888" /> : <Globe size={12} color="#22c55e" />}
            {isAdmin && <Crown size={12} color="orange" />}
          </div>
          <div style={{ fontSize:11, color:"#666" }}>{group.member_count || 0} üzv</div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdminPanel(true)}
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(189, 189, 189, 0.53)", borderRadius:10, padding:"6px 10px", cursor:"pointer", color:"white", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, flexShrink:0 }}>
            <Settings size={13} /> Ayarlar
          </button>
        )}
      </div>

      {/* Sub tabs */}
      <div style={{ display:"flex", gap:4, padding:"10px 16px 8px" }}>
        {tabs.map(([v, l]) => (
          <button key={v} onClick={() => setSubTab(v)}
            style={{ flex:1, padding:"7px 0", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
              background: subTab === v ? "linear-gradient(135deg,white)" : "rgba(240, 240, 240, 0.05)",
              color: subTab === v ? "black" : "#888", 
              border:"1px solid rgba(189, 189, 189, 0.53)" }}>
      
            {l}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>

        {/* ── DETAIL ── */}
        {subTab === "detail" && (
          <div style={{ flex:1, overflowY:"auto", padding:"0 16px 16px" }}>
            <div style={{ background: avatarColor+"11", borderRadius:16, padding:16, marginBottom:12, border:`1px solid ${avatarColor}22` }}>
              <p style={{ fontSize:14, color:"#ccc", lineHeight:1.6, margin:0 }}>{group.description || "Açıklama yoxdur."}</p>
            </div>

            {group.tags?.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                {group.tags.map(t => (
                  <span key={t} style={{ fontSize:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"3px 10px", color:"#aaa" }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Qrup Qaydaları */}
            {group.rules?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:11, color:"#888", marginBottom:8, display:"flex", alignItems:"center", gap:4 }}>
                  📋 Qrup Qaydaları
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {group.rules.map((rule, idx) => (
                    <div key={idx} style={{ display:"flex", gap:10, background:"rgba(249,115,22,0.06)", border:"1px solid rgba(249,115,22,0.15)", borderRadius:10, padding:"9px 12px" }}>
                      <span style={{ fontSize:11, color:"#f97316", fontWeight:700, minWidth:18 }}>{idx + 1}.</span>
                      <span style={{ fontSize:12, color:"#ccc", lineHeight:1.5 }}>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isMember ? (
              isPrivate ? (
                <button onClick={handleJoinRequest} disabled={joinRequested}
                  style={{ width:"100%", padding:"12px 0", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:14,
                    background: joinRequested ? "rgba(255,255,255,0.08)" : `linear-gradient(90deg,${avatarColor},${avatarColor}88)`,
                    color: joinRequested ? "#888" : "white" }}>
                  {joinRequested ? "✓ İstək göndərildi" : "🔒 Qoşulma İstəyi Göndər"}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    setJoinLoading(true);
                    await onJoinToggle();
                    setIsMember(true);
                    // Rolu yüklə
                    const { data } = await supabase
                      .from("group_members").select("role")
                      .eq("group_id", group.id).eq("user_id", user?.id).maybeSingle();
                    setMyRole(data?.role || "member");
                    setJoinLoading(false);
                  }}
                  disabled={joinLoading}
                  style={{ width:"100%", padding:"12px 0", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:14,
                    background: `linear-gradient(90deg,${avatarColor},${avatarColor}88)`, color:"white",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  {joinLoading ? <><Loader2 size={15} className="spin" /> Qoşulunur...</> : "Qrupa Qoşul"}
                </button>
              )
            ) : !isAdmin ? (
              <button onClick={async () => {
                  await onJoinToggle();
                  setIsMember(false);
                  setMyRole(null);
                }}
                style={{ width:"100%", padding:"12px 0", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", cursor:"pointer", fontSize:13, color:"#888" }}>
                Qrupdan Ayrıl
              </button>
            ) : null}
          </div>
        )}

        {/* ── MEMBERS ── */}
        {subTab === "members" && (
          <MembersTab groupId={group.id} currentUserId={user?.id} />
        )}

        {/* ── CHAT ── */}
        {subTab === "chat" && (
          isMember ? (
            <>
              <div style={{ flex:1, overflowY:"auto", padding:"8px 16px", display:"flex", flexDirection:"column", gap:8 }}>
                {msgLoading ? (
                  <div style={{ textAlign:"center", color:"#555", paddingTop:40 }}><Loader2 size={20} className="spin" /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign:"center", color:"#555", paddingTop:40 }}>
                    <MessageCircle size={32} /><p style={{ marginTop:8, fontSize:13 }}>Hələ mesaj yoxdur</p>
                  </div>
                ) : messages.map(m => {
                  const isOwn = m.user_id === user?.id;
                  return (
                    <div key={m.id} style={{ display:"flex", justifyContent: isOwn ? "flex-end" : "flex-start", gap:6 }}>
                      {!isOwn && (
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,white,black)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:"bold", flexShrink:0, alignSelf:"flex-end" }}>
                          {m.profiles?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div style={{ maxWidth:"70%" }}>
                        {!isOwn && <div style={{ fontSize:10, color:"#666", marginBottom:2, paddingLeft:2 }}>{m.profiles?.username}</div>}
                        <div style={{ padding:"8px 12px", borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isOwn ? "blue" : "rgba(255,255,255,0.07)", fontSize:13 , color: "white"}}>
                          {m.content}
                        </div>
                        <div style={{ fontSize:10, color:"#555", marginTop:2, textAlign: isOwn ? "right" : "left" }}>
                          {new Date(m.created_at).toLocaleTimeString("tr", { hour:"2-digit", minute:"2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:8, padding:"12px 16px", paddingBottom:"calc(12px + env(safe-area-inset-bottom, 0px))", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Mesaj yaz..."
                  style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"10px 14px", color:"white", outline:"none", fontSize:13 }} />
                <button onClick={handleSend} style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,white,black)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Send size={16} color="white" />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", color:"#555", padding:40 }}>
              <Lock size={32} /><p style={{ marginTop:8, fontSize:13 }}>Söhbətə baxmaq üçün qrupa qoşulun</p>
            </div>
          )
        )}

        {/* ── EVENTS ── */}
        {subTab === "events" && (
          <div style={{ flex:1, overflowY:"auto", padding:"0 16px 16px" }}>
            {isAdmin && (
              <button onClick={() => setShowCreateEvent(true)}
                style={{ width:"100%", padding:"12px", border:"2px dashed rgba(255,165,0,0.3)", borderRadius:12, background:"rgba(255,165,0,0.05)", cursor:"pointer", color:"orange", fontSize:13, fontWeight:600, marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <Plus size={16} /> Yeni Tədbir Yarat
              </button>
            )}

            {events.length === 0 ? (
              <div style={{ textAlign:"center", color:"#555", paddingTop:40 }}>
                <Calendar size={32} />
                <p style={{ marginTop:8, fontSize:13 }}>Hələ tədbir yoxdur</p>
                {!isAdmin && isMember && (
                  <p style={{ fontSize:11, color:"#444", marginTop:4 }}>Tədbirləri yalnız adminlər yarada bilər</p>
                )}
              </div>
            ) : events.map(ev => {
              const attending = ev.event_attendees?.some(a => a.user_id === user?.id);
              return (
                <div key={ev.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:14, marginBottom:10 }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{ev.title}</div>
                  {ev.description && <p style={{ fontSize:13, color:"#999", marginBottom:8 }}>{ev.description}</p>}
                  <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#aaa" }}>
                      <Calendar size={12} color="orange" />
                      {new Date(ev.event_date).toLocaleString("tr", { day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" })}
                    </div>
                    {ev.location_name && (
                      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#aaa" }}>
                        <MapPin size={12} color="orange" /> {ev.location_name}
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#aaa" }}>
                      <Users size={12} color="orange" /> {ev.event_attendees?.length || 0} katılımcı
                    </div>
                  </div>
                  {isMember && (
                    <button onClick={async () => { await toggleEventAttendance(ev.id); loadEvents(); }}
                      style={{ width:"100%", padding:"8px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:600, fontSize:13,
                        background: attending ? "rgba(34,197,94,0.15)" : "linear-gradient(90deg,orange,red)",
                        color: attending ? "#22c55e" : "white" }}>
                      {attending ? "✓ Katılacağım" : "Katılacağım"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateEvent && (
        <CreateEventModal
          groupId={group.id}
          createEvent={createEvent}
          onClose={() => { setShowCreateEvent(false); loadEvents(); }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          group={group}
          onClose={() => setShowAdminPanel(false)}
          onUpdated={() => {
            setShowAdminPanel(false);
            supabase.from("groups").select("*").eq("id", group.id).single()
              .then(({ data }) => { if (data) setGroup(data); });
          }}
        />
      )}
    </div>
  );
}

// ─── Main GroupsPage ──────────────────────────────────────────────────────────
export default function GroupsPage() {
  const { groups, groupsLoading, joinGroup, leaveGroup } = useApp();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [myGroupIds, setMyGroupIds] = useState(new Set());
  const [selectedGroup, setSelectedGroup] = useState(null);

  const refreshMyGroups = () => {
    if (!user) return;
    supabase.from("group_members").select("group_id").eq("user_id", user.id)
      .then(({ data }) => setMyGroupIds(new Set(data?.map(r => r.group_id) || [])));
  };

  useEffect(() => {
    refreshMyGroups();
  }, [user, groups]);

  const myGroups = groups.filter(g => myGroupIds.has(g.id));
  const filteredGroups = (tab === "mine" ? myGroups : groups).filter(g => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q) || g.tags?.some(t => t.toLowerCase().includes(q));
  });

  async function handleJoin(groupId) {
    await joinGroup(groupId);
    setMyGroupIds(prev => new Set([...prev, groupId]));
  }
  async function handleLeave(groupId) {
    await leaveGroup(groupId);
    setMyGroupIds(prev => { const c = new Set(prev); c.delete(groupId); return c; });
  }

  // Qrup yaradıldıqdan sonra çağırılır
  async function handleGroupCreated(newGroup) {
    setShowCreate(false);
    // myGroupIds-ı yenilə
    setMyGroupIds(prev => new Set([...prev, newGroup.id]));
    // Birbaşa qrup detail-ına get
    setSelectedGroup(newGroup);
  }

  if (selectedGroup) {
    return (
      <GroupDetailView
        group={selectedGroup}
        isMember={myGroupIds.has(selectedGroup.id)}
        myGroupIds={myGroupIds}
        onBack={() => setSelectedGroup(null)}
        onJoinToggle={async () => {
          if (myGroupIds.has(selectedGroup.id)) await handleLeave(selectedGroup.id);
          else await handleJoin(selectedGroup.id);
        }}
      />
    );
  }

  return (
    <div className="groups-page">
      <TopBar title="Qruplar" rightAction={
        <button className="create-btn" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Yarat
        </button>
      } />
      <div className="search-box">
        <Search size={15} className="search-icon" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qrup axtar..." />
      </div>
      <div className="tabs">
        <button className={tab === "all" ? "tab active" : "tab"} onClick={() => setTab("all")}>
          Bütün qruplar ({groups.length})
        </button>
        <button className={tab === "mine" ? "tab active" : "tab"} onClick={() => setTab("mine")}>
          Mənim qruplarım ({myGroups.length})
        </button>
      </div>
      <div className="groups-list">
        {groupsLoading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" />)
        ) : filteredGroups.length === 0 ? (
          <div className="empty">
            <Users size={40} /><p>Qrup tapılmadı</p>
            <span>{tab === "mine" ? "Hələ heç bir qrupa qoşulmamısınız" : "Axtarışı dəyişin"}</span>
          </div>
        ) : filteredGroups.map(group => (
          <div key={group.id} onClick={() => setSelectedGroup(group)} style={{ cursor:"pointer" }}>
            <GroupCard
              group={group}
              isMember={myGroupIds.has(group.id)}
              onJoin={e => { e.stopPropagation(); handleJoin(group.id); }}
              onLeave={e => { e.stopPropagation(); handleLeave(group.id); }}
            />
          </div>
        ))}
      </div>
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={handleGroupCreated} />}
    </div>
  );
}
