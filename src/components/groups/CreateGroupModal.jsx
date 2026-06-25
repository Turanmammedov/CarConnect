import { useState } from "react";
import { X, Tag, Loader2, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./css/CreateGroupModal.css";

const COLORS = [
  "#ffffff", "#bbbbbb", "#8b5cf6",
  "#3b82f6", "#10b981", "#f59e0b", "#ec4899"
];

export default function CreateGroupModal({ onClose, onCreated }) {
  const { createGroup } = useApp();

  const [form, setForm] = useState({
    name: "",
    description: "",
    tags: "",
    color: COLORS[0]
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleCreate() {
    if (!form.name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { error } = await createGroup({
        name: form.name.trim(),
        description: form.description.trim(),
        tags,
        avatar_color: form.color,
      });

      if (error) throw error;

      setDone(true);
      // onCreated callback varsa, qrupu birbaşa göstər
      if (onCreated && data) {
        setTimeout(() => onCreated(data), 800);
      } else {
        setTimeout(onClose, 1500);
      }

    } catch (err) {
      setError(err.message || "Qrup yaradılmadı");
    } finally {
      setLoading(false);
    }
  }

  // ✅ SUCCESS SCREEN
  if (done) {
    return (
      <div className="modal-overlay center">
        <div className="modal-success">
          <div className="success-icon">
            <Check size={32} />
          </div>
          <p className="success-title">Qrup yaradıldı!</p>
          <p className="success-text">"{form.name}" qrupu yaradıldı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="modal-header">
          <h2>Yeni Qrup Yarat</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* COLOR */}
        <div>
          <p className="label">Qrup rəngi</p>
          <div className="color-list">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set("color", c)}
                className={`color-item ${form.color === c ? "active" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* INPUTS */}
        <div className="form">
          <div>
            <p className="label">Qrup adı *</p>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Bakı JDM Crew"
            />
          </div>

          <div>
            <p className="label">Təsvir</p>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Qrup haqqında..."
            />
          </div>

          <div>
            <p className="label flex">
              <Tag size={12} /> Etiketlər
            </p>
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="JDM, Drift"
            />
          </div>
        </div>

        {/* PREVIEW */}
        {form.name && (
          <div
            className="preview"
            style={{ background: form.color + "11" }}
          >
            <div
              className="preview-avatar"
              style={{
                background: form.color + "22",
                color: form.color,
              }}
            >
              {form.name.slice(0, 2).toUpperCase()}
            </div>
            <p>{form.name}</p>
          </div>
        )}

        {/* ERROR */}
        {error && <div className="error">{error}</div>}

        {/* BUTTON */}
        <button
          onClick={handleCreate}
          disabled={!form.name.trim() || loading}
          className="submit-btn"
          style={{
            background: `linear-gradient(135deg, ${form.color}, ${form.color}99)`
          }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="spin" />
              Yaradılır...
            </>
          ) : (
            "Qrup Yarat"
          )}
        </button>

      </div>
    </div>
  );
}