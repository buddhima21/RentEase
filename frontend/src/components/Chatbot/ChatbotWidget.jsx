import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { matchRule } from "./chatbotRules";
import { askAI } from "./chatbotAI";
import "./Chatbot.css";

// ── Markdown-lite renderer ─────────────────────────────────────────────────
function renderMarkdown(text) {
  let safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold **text**
  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  const lines = safe.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${trimmed.slice(2)}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      if (trimmed) html += `<p>${trimmed}</p>`;
    }
  }
  if (inList) html += "</ul>";

  return html;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });
}

function todayLabel() {
  return new Date().toLocaleDateString("en-LK", {
    weekday: "long", month: "short", day: "numeric",
  });
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/>
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/>
  </svg>
);
const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ── Constants ──────────────────────────────────────────────────────────────
const HIDDEN_PATHS = ["/admin", "/technician"];

const SUGGESTIONS = [
  "How do I book a property?",
  "Pay my rent",
  "Maintenance request",
  "List my property",
  "Check my agreement",
];

const WELCOME_MSG = {
  id: "welcome",
  role: "bot",
  text: "Hi there! I'm the RentEase Support Assistant.\n\nI'm here to help you with **bookings, rent payments, maintenance requests, agreements**, and more.\n\nHow can I help you today?",
  timestamp: new Date(),
};

// ── Component ──────────────────────────────────────────────────────────────
export default function ChatbotWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Build conversation history for AI (last 10 turns)
  const buildHistory = (msgs) =>
    msgs
      .filter((m) => m.id !== "welcome")
      .slice(-10)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 280);
  }, [isOpen]);

  // Hide on admin / technician routes
  const isHidden = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));
  if (isHidden) return null;

  // ── Open / Close
  const handleOpen = () => { setIsOpen(true); setIsClosing(false); setHasUnread(false); };
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 200);
  };
  const handleToggle = () => (isOpen ? handleClose() : handleOpen());
  const handleClear = () => setMessages([WELCOME_MSG]);

  // ── Send
  const handleSend = useCallback(
    async (overrideText) => {
      const trimmed = (overrideText ?? input).trim();
      if (!trimmed || isTyping) return;

      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      const userMsg = { id: Date.now(), role: "user", text: trimmed, timestamp: new Date() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsTyping(true);

      try {
        const ruleReply = matchRule(trimmed);
        if (ruleReply) {
          await new Promise((r) => setTimeout(r, 500));
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: "bot", text: ruleReply, timestamp: new Date() },
          ]);
        } else {
          const aiText = await askAI(buildHistory(updated));
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: "bot", text: aiText, timestamp: new Date() },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            text: "I'm having trouble connecting right now. Please try again shortly, or visit our **Help Center** for assistance.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, messages]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 96) + "px"; }
  };

  // ── Render
  return (
    <div className="re-chat">
      {/* ── Launch Button ── */}
      <button
        className="rc-launch"
        onClick={handleToggle}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
        title="Support"
        id="chatbot-toggle-btn"
      >
        {isOpen
          ? <IconClose />
          : <IconChat />}
        {!isOpen && hasUnread && <span className="rc-launch-dot" aria-hidden="true" />}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className={`rc-window${isClosing ? " rc-closing" : ""}`}
          role="dialog"
          aria-label="RentEase Support Chat"
          id="chatbot-window"
        >
          {/* Header */}
          <div className="rc-header">
            <div className="rc-header-row">
              <div className="rc-header-identity">
                <div className="rc-brand-avatar" aria-hidden="true">RE</div>
                <div className="rc-header-text">
                  <h3>RentEase Support</h3>
                  <div className="rc-header-status">
                    <span className="rc-status-dot" aria-hidden="true" />
                    <span>Online now</span>
                  </div>
                </div>
              </div>
              <div className="rc-header-actions">
                <button
                  className="rc-icon-btn"
                  onClick={handleClear}
                  title="New conversation"
                  id="chatbot-clear-btn"
                  aria-label="Start new conversation"
                >
                  <IconTrash />
                </button>
                <button
                  className="rc-icon-btn"
                  onClick={handleClose}
                  title="Minimize"
                  id="chatbot-close-btn"
                  aria-label="Close chat"
                >
                  <IconMinus />
                </button>
              </div>
            </div>
            <p className="rc-header-sub">
              Typically replies instantly · Ask anything about your rental
            </p>
          </div>

          {/* Suggestion chips */}
          {messages.length <= 2 && (
            <div className="rc-suggestions" role="group" aria-label="Suggested questions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="rc-chip"
                  onClick={() => handleSend(s)}
                  id={`chatbot-chip-${s.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div
            className="rc-messages"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {/* Date label */}
            <div className="rc-date-sep">{todayLabel()}</div>

            {messages.map((msg, i) => {
              const isBot = msg.role === "bot";
              const prevBot = i > 0 && messages[i - 1].role === "bot";

              return (
                <div
                  key={msg.id}
                  className={`rc-msg-row ${isBot ? "rc-bot" : "rc-user"}`}
                  role="article"
                >
                  {/* Bot icon — shown only on first in a group */}
                  {isBot ? (
                    !prevBot
                      ? <div className="rc-msg-icon" aria-hidden="true">RE</div>
                      : <div className="rc-msg-icon-spacer" />
                  ) : null}

                  <div className="rc-bubble-wrap">
                    <div
                      className={`rc-bubble${isBot && prevBot ? " rc-grouped-top" : ""}`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                    />
                    <div className="rc-ts">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="rc-typing-row" aria-label="RentEase is typing">
                <div className="rc-msg-icon" aria-hidden="true">RE</div>
                <div className="rc-typing-bubble">
                  <div className="rc-typing-dot" />
                  <div className="rc-typing-dot" />
                  <div className="rc-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="rc-input-area">
            <div className="rc-input-box">
              <textarea
                ref={textareaRef}
                className="rc-input"
                placeholder="Type your message…"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                id="chatbot-input"
                aria-label="Message input"
                disabled={isTyping}
              />
              <button
                className="rc-send"
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                title="Send"
                id="chatbot-send-btn"
                aria-label="Send message"
              >
                <IconSend />
              </button>
            </div>
            <p className="rc-input-hint">
              Powered by <a href="#" tabIndex={-1}>RentEase AI</a> · Enter to send
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
