import { useState } from "react";
import {
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../css/AuthPage.css";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
  });

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function errorMsg(err) {
    const msg = err?.message || "";

    if (msg.includes("Invalid login credentials"))
      return "Email və ya şifrə yanlışdır";
    if (msg.includes("Email not confirmed"))
      return "Email təsdiqlənməyib";
    if (msg.includes("User already registered"))
      return "Bu email artıq qeydiyyatdadır";
    if (msg.includes("Password should be"))
      return "Şifrə ən az 6 simvol olmalıdır";

    return msg || "Xəta baş verdi";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (tab === "login") {
        const { error } = await signIn(form.email, form.password);
        if (error) setError(errorMsg(error));
      } else {
        if (!form.username.trim()) {
          setError("İstifadəçi adı daxil edin");
          return;
        }

        if (form.password.length < 6) {
          setError("Şifrə ən az 6 simvol olmalıdır");
          return;
        }

        const { error } = await signUp(
          form.email,
          form.password,
          form.username
        );

        if (error) setError(errorMsg(error));
        else setSuccess("Hesab yaradıldı!");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">

      {/* Logo */}
      <div className="auth-logo">
        <div className="logo-icon">
          <Zap size={32} />
        </div>
        <h1 className="logo-title">CARSNAP</h1>
        <p className="logo-subtitle">Avtomobil icması</p>
      </div>

      {/* Card */}
      <div className="auth-card">

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={tab === "login" ? "tab active" : "tab"}
            onClick={() => setTab("login")}
          >
            Giriş
          </button>

          <button
            className={tab === "register" ? "tab active" : "tab"}
            onClick={() => setTab("register")}
          >
            Qeydiyyat
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="auth-form">

          {tab === "register" && (
            <div className="input-box">
              <User className="icon" size={16} />
              <input
                placeholder="İstifadəçi adı"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
              />
            </div>
          )}

          <div className="input-box">
            <Mail className="icon" size={16} />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div className="input-box">
            <Lock className="icon" size={16} />

            <input
              type={showPass ? "text" : "password"}
              placeholder="Şifrə"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="error-box">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {success && <div className="success-box">{success}</div>}

          {/* BUTTON */}
          <button className="submit-btn" disabled={loading}>
            {loading ? "Yüklənir..." : tab === "login" ? "Daxil ol" : "Qeydiyyat"}
            <ArrowRight size={16} />
          </button>

        </form>
      </div>
    </div>
  );
}