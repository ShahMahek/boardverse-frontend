"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiChat, apiLogout, apiGetSessions, apiGetMessages, Session, ChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: "RAG" | "WEB" | null;
  loading?: boolean;
  thinkingIndex?: number;
}

const THINKING = [
  "Thinking…",
  "Searching the knowledge base…",
  "Thanks for your patience…",
  "Almost there…",
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTitles, setSessionTitles] = useState<Record<number, string>>({});
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const thinkingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("bv_token")) router.push("/");
  }, [router]);

  const loadSessions = useCallback(async () => {
    try {
      const data = await apiGetSessions();
      setSessions(data);
      const titles: Record<number, string> = {};
      data.forEach((s) => {
        titles[s.Id] = s.Title || `Session #${s.Id}`;
      });
      setSessionTitles(titles);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadSession(sessionId: number) {
    try {
      const msgs: ChatMessage[] = await apiGetMessages(sessionId);
      setActiveSession(sessionId);
      setMessages(msgs.map((m) => ({ role: m.Role, content: m.Message, source: m.ResponseSource })));
    } catch { /* silent */ }
  }

  function startThinking() {
    let i = 0;
    thinkingTimer.current = setInterval(() => {
      i = (i + 1) % THINKING.length;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.loading) updated[updated.length - 1] = { ...last, thinkingIndex: i };
        return updated;
      });
    }, 2500);
  }

  function stopThinking() {
    if (thinkingTimer.current) clearInterval(thinkingTimer.current);
    thinkingTimer.current = null;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", loading: true, thinkingIndex: 0 },
    ]);
    setSending(true);
    startThinking();

    try {
      await apiChat(
        text,
        activeSession,
        (token) => {
          stopThinking();
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + token,
                loading: false,
              };
            }
            return updated;
          });
        },
        (meta) => {
          setActiveSession(meta.sessionId);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "assistant") {
              updated[updated.length - 1] = { ...last, source: meta.source };
            }
            return updated;
          });
          loadSessions();
        }
      );
    } catch (e: unknown) {
      stopThinking();
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: e instanceof Error ? e.message : "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  async function handleLogout() {
    try { await apiLogout(); } catch { /* silent */ }
    localStorage.removeItem("bv_token");
    router.push("/");
  }

  function startNewChat() {
    stopThinking();
    setMessages([]);
    setActiveSession(null);
    textareaRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", fontFamily: "'Poppins', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? "clamp(220px, 22vw, 260px)" : "0",
        minWidth: sidebarOpen ? "clamp(220px, 22vw, 260px)" : "0",
        transition: "all 0.28s ease", overflow: "hidden",
        background: "var(--surface)",
        borderRight: "1.5px solid var(--border-strong)",
        display: "flex", flexDirection: "column",
        boxShadow: "2px 0 16px rgba(91,33,182,0.08)",
        flexShrink: 0,
      }}>

        {/* Logo */}
        <div style={{ padding: "16px 14px 13px", borderBottom: "1.5px solid var(--border-strong)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ fontSize: "16px" }}>🎲</span>
            <span style={{
              fontWeight: 900, fontSize: "0.88rem",
              background: "linear-gradient(135deg, #EA580C 0%, #EAB308 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>BoardVerse AI</span>
          </div>
        </div>

        {/* Sessions list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          <p style={{
            fontSize: "0.62rem", color: "var(--text-muted)", padding: "8px 8px 5px",
            textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700,
          }}>History</p>

          {sessions.length === 0 && (
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", padding: "8px", opacity: 0.6 }}>
              No sessions yet
            </p>
          )}

          {sessions.map((s) => (
            <button key={s.Id} onClick={() => loadSession(s.Id)} style={{
              width: "100%", textAlign: "left", padding: "8px 10px",
              borderRadius: "12px", border: "none",
              borderLeft: activeSession === s.Id ? "2px solid #EA580C" : "2px solid transparent",
              background: activeSession === s.Id ? "rgba(234,88,12,0.06)" : "transparent",
              color: "var(--text-primary)", fontSize: "0.76rem",
              cursor: "pointer", marginBottom: "2px",
              fontFamily: "'Poppins', sans-serif", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { if (activeSession !== s.Id) e.currentTarget.style.background = "var(--bg-2)"; }}
              onMouseLeave={(e) => { if (activeSession !== s.Id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontWeight: 600, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {sessionTitles[s.Id] || `Session #${s.Id}`}
              </div>
              <div style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                {new Date(s.CreatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </button>
          ))}
        </div>

        {/* New Chat button */}
        <div style={{ padding: "12px 14px" }}>
          <button onClick={startNewChat} style={{
            width: "100%", padding: "9px", border: "none", borderRadius: "12px",
            background: "linear-gradient(135deg, #EA580C 0%, #EAB308 100%)",
            color: "white", fontWeight: 700, fontSize: "0.78rem",
            cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "opacity 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >+ New Chat</button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{
          padding: "8.3px 20px",
          borderBottom: "1.5px solid var(--border-strong)",
          background: "var(--bg)",
          display: "flex", alignItems: "center", gap: "10px",
          flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "transparent", border: "none", color: "var(--text-muted)",
            fontSize: "1rem", cursor: "pointer", padding: "4px", lineHeight: 1,
            flexShrink: 0,
          }}>☰</button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--text-primary)" }}>Board Game Oracle</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>RAG · Web Search · GPT-4o</div>
          </div>

          <button onClick={handleLogout} style={{
            padding: "6px 14px", border: "1.5px solid var(--border-strong)",
            borderRadius: "12px", background: "transparent",
            color: "var(--text-secondary)", fontSize: "0.76rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "all 0.15s",
            flexShrink: 0,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-2)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
          >Logout</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 0", background: "var(--bg)" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 clamp(8px, 1.5vw, 16px)" }}>

            {messages.length === 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", paddingTop: "80px", opacity: 0.5,
                animation: "fade-up 0.5s ease both",
              }}>
                <div style={{ fontSize: "44px", marginBottom: "12px" }}>🎲</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "5px" }}>
                  Ask me anything about board games
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Rules · Strategy · Recommendations · History
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "18px",
                animation: "fade-up 0.25s ease both",
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    background: "var(--grad-main)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", marginRight: "10px", marginTop: "2px",
                    boxShadow: "0 2px 8px rgba(139,92,246,0.3)",
                  }}>🎲</div>
                )}

                <div style={{ maxWidth: "75%", minWidth: 0 }}>
                  <div style={{
                    padding: "11px 15px",
                    borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                    background: msg.role === "user" ? "var(--grad-main)" : "var(--surface)",
                    border: msg.role === "assistant" ? "1.5px solid var(--border-strong)" : "none",
                    fontSize: "0.85rem", lineHeight: 1.72,
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    boxShadow: "var(--shadow-md)",
                  }}>
                    {msg.loading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        <span style={{ display: "flex", gap: "4px" }}>
                          {[0, 1, 2].map((d) => (
                            <span key={d} style={{
                              width: "6px", height: "6px", borderRadius: "50%",
                              background: "#EA580C", display: "inline-block",
                              animationName: "pulse-dot", animationDuration: "1.2s",
                              animationDelay: `${d * 0.2}s`, animationIterationCount: "infinite",
                            }} />
                          ))}
                        </span>
                        {THINKING[msg.thinkingIndex ?? 0]}
                      </div>
                    ) : (
                      <div className="markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {msg.role === "assistant" && msg.source && !msg.loading && (
                    <div style={{ marginTop: "5px" }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: "100px",
                        fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        background: msg.source === "RAG" ? "rgba(234,88,12,0.08)" : "rgba(234,179,8,0.08)",
                        color: msg.source === "RAG" ? "#EA580C" : "#92400E",
                        border: `1.5px solid ${msg.source === "RAG" ? "rgba(234,88,12,0.2)" : "rgba(234,179,8,0.2)"}`,
                      }}>
                        {msg.source === "RAG" ? "🔍 Knowledge Base" : "🌐 Web Search"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: "12px 20px", background: "var(--bg)", flexShrink: 0 }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: "10px",
              background: "var(--surface)", border: "1.5px solid var(--border-strong)",
              borderRadius: "18px", padding: "10px 12px",
              boxShadow: "var(--shadow-md)",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onInput={autoResize}
                placeholder="Ask about any board game…"
                rows={1}
                disabled={sending}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "var(--text-primary)", fontSize: "0.85rem", lineHeight: 2.3,
                  resize: "none", maxHeight: "128px", overflowY: "auto",
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
              <button onClick={sendMessage} disabled={!input.trim() || sending} style={{
                width: "34px", height: "34px", borderRadius: "12px", border: "none",
                flexShrink: 0,
                cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                background: input.trim() && !sending ? "linear-gradient(135deg, #EA580C, #EAB308)" : "var(--bg-2)",
                color: input.trim() && !sending ? "white" : "var(--text-muted)",
                fontSize: "0.95rem", display: "flex", alignItems: "center",
                justifyContent: "center", transition: "all 0.2s",
              }}>{sending ? "⏳" : "↑"}</button>
            </div>
            <p style={{
              marginTop: "6px", fontSize: "0.65rem", color: "var(--text-muted)",
              textAlign: "center", opacity: 0.6,
            }}>
              BoardVerse only answers board game questions · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}