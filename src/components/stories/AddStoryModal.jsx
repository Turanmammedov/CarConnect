import { useState, useRef } from "react";
import { X, Send, ImagePlus, Loader2, FileText } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { uploadImage } from "../../lib/cloudinary";
import "./css/AddStoryModal.css";

export default function AddStoryModal({ onClose }) {
  const { addPost } = useApp();

  const [tab, setTab] = useState("post"); // "post" | "story"
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Yalnız şəkil seçin"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Max 10MB"); return; }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!caption.trim() && !imageFile) { setError("Mətn və ya şəkil əlavə edin"); return; }
    setUploading(true);
    setError("");
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, tab === "story" ? "stories" : "posts");
      }
      const { error } = await addPost({ caption: caption.trim(), imageUrl, type: tab });
      if (error) throw error;
      onClose();
    } catch (err) {
      setError(err.message || "Xəta baş verdi");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Yeni Paylaşım</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Type selector */}
        <div style={{ display:"flex", gap:8, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:4 }}>
          {[["post","Gönderi",FileText],["story","Hikaye",ImagePlus]].map(([val, label, Icon]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                padding:"8px 0", borderRadius:10, border:"none", cursor:"pointer",
                background: tab === val ? "linear-gradient(90deg,orange,red)" : "transparent",
                color: tab === val ? "white" : "#888", fontSize:13, fontWeight:600,
              }}
            >
              <Icon size={14}/> {label}
            </button>
          ))}
        </div>

        {tab === "story" && (
          <p style={{fontSize:11, color:"#888", textAlign:"center", marginTop:-4}}>
            📸 Hikayeler 24 saat sonra otomatik silinir
          </p>
        )}

        {/* Image Upload */}
        <div
          className={`image-box ${imagePreview ? "active" : ""}`}
          onClick={() => !imagePreview && fileRef.current?.click()}
        >
          {imagePreview ? (
            <div className="preview">
              <img src={imagePreview} alt="preview" />
              <button className="remove" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <ImagePlus size={28} />
              <span>Şəkil seç</span>
              <small>Maks 10MB • Cloudinary-ə yüklənir</small>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={tab === "story" ? "Hikaye açıklaması..." : "Nə paylaşmaq istəyirsən?"}
          className="caption"
        />

        {error && <div className="error">{error}</div>}

        <button className="submit-btn" onClick={handleSubmit} disabled={uploading}>
          {uploading ? (
            <><Loader2 size={16} className="spin" /> Yüklənir...</>
          ) : (
            <><Send size={16} /> {tab === "story" ? "Hikaye Paylaş" : "Gönderi Paylaş"}</>
          )}
        </button>
      </div>
    </div>
  );
}
