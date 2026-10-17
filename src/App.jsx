// App.jsx — Main application component
import { useState, useEffect, useRef } from "react";
import "./App.css";
import { useCallManager, AGENT_STATE } from "./hooks/useCallManager";
import AgentOrb from "./components/AgentOrb";
import Transcript from "./components/Transcript";
import OrdersPanel from "./components/OrdersPanel";
import CallSummary from "./components/CallSummary";

const POLICY_ITEMS = [
  { icon: "🚚", text: "Free shipping above ₹499. Standard: 3–5 business days." },
  { icon: "↩️", text: "Returns within 7 days for unopened/unused products only." },
  { icon: "⚠️", text: "Damaged goods must be reported within 48 hrs with photos." },
  { icon: "❌", text: "Cancellations only when order is in 'Processing' status." },
  { icon: "💵", text: "COD available for orders up to ₹2,500." },
];

export default function App() {
  const {
    callState,
    agentState,
    transcript,
    callSummary,
    interimText,
    error,
    isSupported,
    startCall,
    endCall,
  } = useCallManager();

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("groq_api_key") || import.meta.env.VITE_GROQ_API_KEY || ""
  );
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const transcriptBodyRef = useRef(null);

  // Auto-scroll transcript
  useEffect(() => {
    const el = document.getElementById("transcript-body");
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript, interimText]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("groq_api_key", apiKeyInput.trim());
      // Inject into env so hooks pick it up
      window.__groqApiKey = apiKeyInput.trim();
      setApiKey(apiKeyInput.trim());
      setApiKeyInput("");
      setShowApiInput(false);
    }
  };

  const hasApiKey = !!apiKey;
  const isCallActive = callState === "active";
  const isCallEnded = callState === "ended";

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="brand-icon">✦</div>
          <div>
            <span className="brand-name">Aura Skincare</span>
            <span className="brand-tagline">Voice Support Agent</span>
          </div>
        </div>
        <div className={`header-badge ${isCallActive ? "" : "inactive"}`}>
          <span className="badge-dot" />
          {isCallActive ? "Live Call" : isCallEnded ? "Call Ended" : "Ready"}
        </div>
      </header>

      {/* Main layout */}
      <main className="app-main">
        {/* LEFT: Policy info + API key */}
        <aside className="sidebar-left">
          {/* API Key Panel */}
          {!hasApiKey || showApiInput ? (
            <div className="api-key-panel">
              <h3>🔑 Groq API Key Required</h3>
              <p>
                Enter your free Groq API key to enable AI responses. Get one at{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#d4af37" }}
                >
                  console.groq.com
                </a>
              </p>
              <div className="api-key-input-row">
                <input
                  className="api-key-input"
                  type="password"
                  placeholder="gsk_..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveApiKey()}
                />
                <button className="api-key-btn" onClick={handleSaveApiKey}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "rgba(78, 203, 110, 0.06)",
                border: "1px solid rgba(78, 203, 110, 0.15)",
                borderRadius: "12px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
              onClick={() => setShowApiInput(true)}
            >
              <span style={{ color: "#4ecb6e" }}>✓ API Key saved</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Change</span>
            </div>
          )}

          {/* Brand Policies */}
          <div className="policy-card">
            <span className="policy-card-title">📋 Brand Policies</span>
            {POLICY_ITEMS.map((item, i) => (
              <div key={i} className="policy-item">
                <span className="policy-icon">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Orders Panel */}
          <OrdersPanel />
        </aside>

        {/* CENTER: Agent orb + controls */}
        <section className="center-panel">
          <div className="agent-card">
            {/* Agent identity */}
            <div className="agent-name-block">
              <span className="agent-name">Aria</span>
              <span className="agent-title">Aura Skincare · Customer Support</span>
            </div>

            {/* Animated orb */}
            <AgentOrb agentState={agentState} callActive={isCallActive} />

            {/* Live interim speech text */}
            {isCallActive && (
              <div className="interim-display">
                {interimText ? (
                  <>🎤 {interimText}</>
                ) : agentState === AGENT_STATE.LISTENING ? (
                  "Listening for your voice..."
                ) : agentState === AGENT_STATE.THINKING ? (
                  "Aria is thinking..."
                ) : agentState === AGENT_STATE.SPEAKING ? (
                  "Aria is responding..."
                ) : (
                  "Initialising..."
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error-banner">⚠️ {error}</div>
            )}

            {/* Call controls */}
            <div className="call-controls">
              {!isCallActive ? (
                <button
                  id="btn-start-call"
                  className="btn-start-call"
                  onClick={startCall}
                  disabled={!hasApiKey || !isSupported}
                  title={!isSupported ? "Use Chrome for speech recognition" : ""}
                >
                  📞 Start Call
                </button>
              ) : (
                <button
                  id="btn-end-call"
                  className="btn-end-call"
                  onClick={endCall}
                >
                  📵 End Call
                </button>
              )}
            </div>

            {!isSupported && (
              <p style={{ fontSize: "0.75rem", color: "#ff6b6b", textAlign: "center" }}>
                ⚠️ Please use Google Chrome for speech recognition support.
              </p>
            )}
          </div>

          {/* Post-call summary */}
          {isCallEnded && (
            <div style={{ width: "100%" }}>
              <CallSummary summary={callSummary} transcript={transcript} />
            </div>
          )}
        </section>

        {/* RIGHT: Live transcript */}
        <aside className="sidebar-right">
          <div className="transcript-wrapper">
            <Transcript
              transcript={transcript}
              interimText={interimText}
              callActive={isCallActive}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
