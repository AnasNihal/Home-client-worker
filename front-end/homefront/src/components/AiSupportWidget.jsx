import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../constants/api";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m your HomeCare assistant. I can help with workers, bookings, payments, cancellations, and profile questions.",
};

const QUICK_PROMPTS = [
  "What is my latest booking status?",
  "How do I cancel a booking?",
  "How can I find a plumber?",
];

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-primary text-white"
            : "rounded-bl-md bg-gray-100 text-gray-700"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function AiSupportWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  if (!localStorage.getItem("access")) return null;

  async function ask(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || loading) return;

    const userMessage = { id: `${Date.now()}-user`, role: "user", content: text };
    const history = messages
      .filter((item) => item.id !== "welcome")
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/support-chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!response) return;
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || "I could not answer that. Please try again.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: payload.answer || "I’m not sure yet. Could you rephrase that?",
        },
      ]);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillPrompt(prompt) {
    setMessage(prompt);
    setError("");
  }

  function clearConversation() {
    setMessages([WELCOME_MESSAGE]);
    setError("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div>
              <h3 className="font-bold">HomeCare AI Help</h3>
              <p className="text-xs text-white/75">Personalized support for your account</p>
            </div>
            <button
              type="button"
              onClick={clearConversation}
              className="rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white"
              title="Start a new conversation"
            >
              New chat
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto bg-white p-4">
            {messages.map((item) => (
              <MessageBubble key={item.id} message={item} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-3 py-2 text-sm text-gray-500">
                  Thinking<span className="ml-1 animate-pulse">…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 px-4 pb-2 pt-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => fillPrompt(prompt)}
                  className="shrink-0 rounded-full border border-primary/20 px-3 py-1 text-xs text-primary hover:bg-primary/5"
                >
                  {prompt}
                </button>
              ))}
            </div>
            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
            <form onSubmit={ask} className="flex items-center gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Ask anything about your service"
                aria-label="Ask HomeCare AI Help"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/90"
        aria-expanded={open}
        aria-label={open ? "Close AI Help" : "Open AI Help"}
      >
        <span className="text-lg" aria-hidden="true">
          ✨
        </span>
        {open ? "Close" : "AI Help"}
      </button>
    </div>
  );
}
