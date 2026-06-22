import FloatingIcons from "@/components/FloatingIcons";
import AuthForm from "@/components/AuthForm";

export default function HomePage() {
  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FEF3C7 100%)",
      fontFamily: "'Poppins', sans-serif",
    }}>

      {/* ── LEFT: Hero ── */}
      <div style={{
        flex: 1, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center",
        padding: "clamp(32px, 5vw, 80px) clamp(32px, 5vw, 72px)",
        minWidth: 0,
        background: "transparent",
      }}>

        {/* Animated blobs */}
        <div style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: "420px", height: "420px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)",
          animationName: "blob-move", animationDuration: "8s",
          animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "30%",
          width: "360px", height: "360px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)",
          animationName: "blob-move", animationDuration: "10s",
          animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
          animationDelay: "2s",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "-40px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)",
          animationName: "blob-move", animationDuration: "12s",
          animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
          animationDelay: "4s",
        }} />

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(234,88,12,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <FloatingIcons />

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 5, maxWidth: "520px", animation: "fade-up 0.7s ease 0.1s both" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "linear-gradient(135deg, #EA580C, #EAB308)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", boxShadow: "0 4px 16px rgba(234,88,12,0.3)",
            }}>🎲</div>
            <span style={{
              fontSize: "1.1rem", fontWeight: 800, color: "#431407", letterSpacing: "-0.01em",
            }}>BoardVerse AI</span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", fontWeight: 900,
            lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: "20px", color: "#431407",
          }}>
            Your next move<br />
            <span style={{
              background: "linear-gradient(135deg, #EA580C 0%, #EAB308 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundSize: "200% 200%", animation: "gradient-shift 4s ease infinite",
            }}>
              starts here.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(0.88rem, 1.4vw, 1rem)", color: "#9A3412",
            lineHeight: 1.75, marginBottom: "44px", maxWidth: "420px",
          }}>
            Ask about rules, strategy, recommendations and history for
            thousands of board games — powered by AI and live web search.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              { icon: "📚", val: "RAG", label: "Knowledge Base" },
              { icon: "🌐", val: "Live", label: "Web Search" },
              { icon: "🧠", val: "GPT-4o", label: "Azure OpenAI" },
            ].map((s) => (
              <div key={s.label} style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(234,88,12,0.2)",
                borderRadius: "14px", padding: "10px 16px",
                boxShadow: "0 2px 8px rgba(234,88,12,0.08)",
              }}>
                <span style={{ fontSize: "18px" }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#431407" }}>{s.val}</div>
                  <div style={{ fontSize: "0.65rem", color: "#9A3412" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth form card ── */}
      <div style={{
        width: "clamp(340px, 38vw, 460px)", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(24px, 4vw, 48px) clamp(20px, 3vw, 44px)",
        position: "relative",
        background: "transparent",
      }}>
        <div style={{
          width: "100%", maxWidth: "400px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(234,88,12,0.15)",
          borderRadius: "28px",
          padding: "clamp(28px, 4vw, 40px)",
          boxShadow: "0 24px 64px rgba(234,88,12,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
          animation: "fade-up 0.6s ease 0.2s both",
        }}>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}