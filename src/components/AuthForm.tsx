"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, apiRegister } from "@/lib/api";

type Tab = "login" | "register";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

const L: React.CSSProperties = {
  display: "block", fontSize: "0.65rem", fontWeight: 600,
  color: "#9A3412", marginBottom: "4px",
  textTransform: "uppercase", letterSpacing: "0.07em",
};

export default function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setLoginEmail("");
    setLoginPassword("");
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setShowLoginPwd(false);
    setShowRegPwd(false);
  }

  async function handleLogin() {
    setError("");
    if (!loginEmail.trim() || !loginPassword.trim()) { setError("Please fill in all fields."); return; }
    if (!isValidEmail(loginEmail)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const { token } = await apiLogin(loginEmail.trim(), loginPassword);
      localStorage.setItem("bv_token", token);
      router.push("/chat");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  }

  async function handleRegister() {
    setError("");
    if (!regUsername.trim() || !regEmail.trim() || !regPassword || !regConfirm) { setError("Please fill in all fields."); return; }
    if (!isValidEmail(regEmail)) { setError("Please enter a valid email address."); return; }
    if (regPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (regPassword !== regConfirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await apiRegister(regUsername.trim(), regEmail.trim(), regPassword);
      const { token } = await apiLogin(regEmail.trim(), regPassword);
      localStorage.setItem("bv_token", token);
      router.push("/chat");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed. Try a different email.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ animation: "fade-up 0.5s ease both", width: "100%" }}>

      {/* Title */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#431407", marginBottom: "4px", letterSpacing: "-0.02em" }}>
          {tab === "login" ? "Welcome back 👋" : "Create account 🎲"}
        </h2>
        <p style={{ color: "#9A3412", fontSize: "0.75rem", lineHeight: 1.5 }}>
          {tab === "login"
            ? "Sign in to your BoardVerse account"
            : "Join BoardVerse and start exploring board games"}
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: "flex", background: "rgba(234,88,12,0.06)",
        borderRadius: "12px", padding: "3px", marginBottom: "16px",
        border: "1px solid rgba(234,88,12,0.15)",
      }}>
        {(["login", "register"] as Tab[]).map((t) => (
          <button key={t} onClick={() => switchTab(t)} style={{
            flex: 1, padding: "7px", border: "none", borderRadius: "10px",
            cursor: "pointer", fontWeight: 700, fontSize: "0.75rem",
            fontFamily: "'Poppins', sans-serif", transition: "all 0.2s",
            background: tab === t ? "linear-gradient(135deg, #EA580C, #EAB308)" : "transparent",
            color: tab === t ? "#fff" : "#9A3412",
            boxShadow: tab === t ? "0 2px 8px rgba(234,88,12,0.3)" : "none",
          }}>
            {t === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "10px", padding: "8px 12px", marginBottom: "12px",
          fontSize: "0.72rem", color: "#DC2626",
          animation: "fade-up 0.2s ease both",
        }}>⚠️ {error}</div>
      )}

      {/* Form */}
      <div key={tab} style={{ animation: "tab-slide 0.35s cubic-bezier(0.4, 0, 0.2, 1) both" }}>
        {tab === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={L}>Email</label>
              <input className="glass-input" type="email" placeholder="you@example.com"
                value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            <div>
              <label style={L}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="glass-input" type={showLoginPwd ? "text" : "password"} placeholder="••••••••"
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={{ paddingRight: "40px" }} />
                <button onClick={() => setShowLoginPwd(!showLoginPwd)} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", fontSize: "16px",
                  color: "#9A3412", padding: "0", lineHeight: 1,
                }}>{showLoginPwd ? "🙈" : "👁️"}</button>
              </div>
            </div>
            <div style={{ marginTop: "4px" }}>
              <button className="glass-btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={L}>Username</label>
              <input className="glass-input" type="text" placeholder="BoardMaster42"
                value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />
            </div>
            <div>
              <label style={L}>Email</label>
              <input className="glass-input" type="email" placeholder="you@example.com"
                value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={L}>Password</label>
                <div style={{ position: "relative" }}>
                  <input className="glass-input" type={showRegPwd ? "text" : "password"} placeholder="Min. 6 chars"
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingRight: "40px" }} />
                  <button onClick={() => setShowRegPwd(!showRegPwd)} style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: "16px",
                    color: "#9A3412", padding: "0", lineHeight: 1,
                  }}>{showRegPwd ? "🙈" : "👁️"}</button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={L}>Confirm</label>
                <div style={{ position: "relative" }}>
                  <input className="glass-input" type={showRegPwd ? "text" : "password"} placeholder="••••••••"
                    value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    style={{ paddingRight: "40px" }} />
                  <button onClick={() => setShowRegPwd(!showRegPwd)} style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: "16px",
                    color: "#9A3412", padding: "0", lineHeight: 1,
                  }}>{showRegPwd ? "🙈" : "👁️"}</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "2px" }}>
              <button className="glass-btn" onClick={handleRegister} disabled={loading}>
                {loading ? "Creating account…" : "Create Account →"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: "14px", fontSize: "0.62rem", color: "#C2410C", opacity: 0.6, textAlign: "center" }}>
        Powered by Azure OpenAI · GPT-4o · Azure AI Search
      </p>
    </div>
  );
}