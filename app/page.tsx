"use client";
import { useState } from "react";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi, welcome to the Data Center Helper. I was programmed and compiled by John Granholm, and created to help you with your BMS and EPMS troubleshooting. My training material was specific to this endeavor. " },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const t = text.trim();
    if (!t || busy) return;

    setBusy(true);
    setText("");

    const userMsg: Msg = { role: "user", content: t };
    const next: Msg[] = [...messages, userMsg];
    setMessages(next);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const j = await r.json();

      const assistantMsg: Msg = { role: "assistant", content: j.text || "(no reply)" };
      setMessages([...next, assistantMsg]);
    } catch {
      const assistantMsg: Msg = { role: "assistant", content: "Error calling server." };
      setMessages([...next, assistantMsg]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 10 }}>stopjg.com</h1>

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, minHeight: 420 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "10px 0" }}>
            <b>{m.role === "user" ? "You" : "Assistant"}:</b> {m.content}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #333" }}
        />
        <button onClick={send} disabled={busy} style={{ padding: "10px 14px", borderRadius: 10 }}>
          {busy ? "…" : "Send"}
        </button>
      </div>
    </main>
  );
}
