const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function token(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bv_token");
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const t = token();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

/* ── Auth ── */
export const apiRegister = (username: string, email: string, password: string) =>
  req<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

export const apiLogin = (email: string, password: string) =>
  req<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const apiLogout = () =>
  req<{ message: string }>("/api/auth/logout", { method: "POST" });

/* ── Chat ── */
export interface ChatResponse {
  sessionId: number;
  source: "RAG" | "WEB";
  answer: string;
}

export const apiChat = async (
  message: string,
  sessionId: number | null | undefined,
  onToken: (token: string) => void,
  onMeta: (meta: { sessionId: number; source: "RAG" | "WEB" | null; sourceUrls: string[] }) => void
): Promise<void> => {
  const t = typeof window !== "undefined" ? localStorage.getItem("bv_token") : null;

  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    body: JSON.stringify({ message, sessionId: sessionId ?? null }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (!json) continue;

      try {
        const event = JSON.parse(json);
        if (event.type === "meta") onMeta({ 
          sessionId: event.sessionId, 
          source: event.source,
          sourceUrls: event.sourceUrls || []
        });
        else if (event.type === "token") onToken(event.token);
        else if (event.type === "error") throw new Error(event.message);
      } catch { /* skip malformed */ }
    }
  }
};

/* ── Sessions ── */
export interface Session {
  Id: number;
  UserId: number;
  Title: string | null;
  CreatedAt: string;
  ExpiresAt: string;
}

export interface ChatMessage {
  Id: number;
  SessionId: number;
  Role: "user" | "assistant";
  Message: string;
  ResponseSource: "RAG" | "WEB" | null;
  CreatedAt: string;
}

export const apiGetSessions = () =>
  req<Session[]>("/api/sessions");

export const apiGetMessages = (sessionId: number) =>
  req<ChatMessage[]>(`/api/sessions/${sessionId}/messages`);