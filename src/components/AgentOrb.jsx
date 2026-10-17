// AgentOrb.jsx — Animated visual state indicator for the AI agent
import "./AgentOrb.css";
import { AGENT_STATE } from "../hooks/useCallManager";

const STATE_CONFIG = {
  [AGENT_STATE.IDLE]: {
    label: "Ready",
    className: "idle",
    stateClass: "state-idle",
    icon: "✦",
  },
  [AGENT_STATE.LISTENING]: {
    label: "Listening...",
    className: "listening",
    stateClass: "state-listening",
    icon: "🎤",
  },
  [AGENT_STATE.THINKING]: {
    label: "Thinking...",
    className: "thinking",
    stateClass: "state-thinking",
    icon: null,
  },
  [AGENT_STATE.SPEAKING]: {
    label: "Speaking",
    className: "speaking",
    stateClass: "state-speaking",
    icon: null,
  },
};

export default function AgentOrb({ agentState, callActive }) {
  const config = STATE_CONFIG[agentState] || STATE_CONFIG[AGENT_STATE.IDLE];

  return (
    <div className="orb-container">
      <div className={`orb-wrapper ${config.className}`}>
        {/* Ripple rings */}
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />

        {/* Core sphere */}
        <div className={`orb-core ${config.className}`}>
          {agentState === AGENT_STATE.THINKING ? (
            <div className="thinking-dots">
              <div className="thinking-dot" />
              <div className="thinking-dot" />
              <div className="thinking-dot" />
            </div>
          ) : agentState === AGENT_STATE.SPEAKING ? (
            <div className="sound-wave">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
          ) : (
            <span className="orb-icon">{config.icon}</span>
          )}
        </div>
      </div>

      <span className={`orb-state-label ${config.stateClass}`}>
        {callActive ? config.label : "Not in call"}
      </span>
    </div>
  );
}
