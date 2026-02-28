"use client";

import { useState, useEffect, useRef } from "react";
import type { PortfolioContext } from "@/lib/bedrock-advisor";

type Message = { role: "user" | "assistant"; content: string };

interface Props {
  portfolioContext: PortfolioContext;
}

export default function PortfolioAdvisorChat({ portfolioContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const welcomeSent = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (welcomeSent.current || streaming) return;
    welcomeSent.current = true;
    setStreaming(true);
    setStreamText("");
    fetch("/api/portfolio-advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "", portfolioContext }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.body?.getReader();
      })
      .then((reader) => {
        if (!reader) throw new Error("No stream");
        const r = reader;
        const decoder = new TextDecoder();
        let acc = "";
        function read(): Promise<void> {
          return r.read().then(({ done, value }) => {
            if (done) {
              setMessages((m) => [...m, { role: "assistant", content: acc }]);
              setStreamText("");
              setStreaming(false);
              return;
            }
            acc += decoder.decode(value, { stream: true });
            setStreamText(acc);
            return read();
          });
        }
        return read();
      })
      .catch(() => {
        setStreaming(false);
        setStreamText("");
        setMessages((m) => [...m, { role: "assistant", content: "Unable to load advisor. Check your connection." }]);
      });
  }, [portfolioContext]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, streamText]);

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/portfolio-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, portfolioContext }),
      });
      if (!res.ok) throw new Error("Failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamText(acc);
      }
      setMessages((m) => [...m, { role: "assistant", content: acc }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't get a response. Try again." }]);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }

  const displayMessages = messages.length > 8 ? messages.slice(-8) : messages;

  return (
    <div className="flex flex-col">
      <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">Portfolio Advisor</h2>
      <div
        ref={scrollRef}
        className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-3 text-sm"
      >
        {displayMessages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.role === "user" ? "text-right" : ""}`}
          >
            <span className={msg.role === "user" ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}>
              {msg.role === "user" ? "You: " : ""}
            </span>
            <span className="text-[var(--color-text)]" style={{ fontFamily: msg.role === "assistant" ? "var(--font-ibm-plex-mono)" : undefined }}>
              {msg.content}
            </span>
          </div>
        ))}
        {streamText && (
          <div className="mb-2 text-[var(--color-text)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            {streamText}
            <span className="animate-pulse">▌</span>
          </div>
        )}
        {streaming && !streamText && (
          <p className="text-[var(--color-muted)]">Thinking…</p>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask about your portfolio..."
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-primary)]"
          disabled={streaming}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          className="btn-primary rounded-full px-4 py-2 text-sm disabled:opacity-50"
        >
          Ask →
        </button>
      </div>
    </div>
  );
}
