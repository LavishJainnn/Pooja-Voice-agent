// Transcript.jsx — Real-time call transcript display
import "./Transcript.css";

export default function Transcript({ transcript, interimText, callActive }) {
  return (
    <div className="transcript-panel">
      <div className="transcript-header">
        <span className="transcript-title">Call Transcript</span>
        {callActive && <span className="live-badge">● LIVE</span>}
      </div>
      <div className="transcript-body" id="transcript-body">
        {transcript.length === 0 && !callActive && (
          <div className="transcript-empty">
            <span className="transcript-empty-icon">📋</span>
            <p>Transcript will appear here once the call starts.</p>
          </div>
        )}
        {transcript.map((entry, i) => (
          <div
            key={i}
            className={`transcript-entry ${entry.role}`}
          >
            <div className="entry-meta">
              <span className="entry-role">
                {entry.role === "user" ? "👤 You" : "✦ Aria"}
              </span>
              <span className="entry-time">{entry.timestamp}</span>
            </div>
            <div className="entry-text">{entry.text}</div>
          </div>
        ))}
        {/* Live interim text */}
        {interimText && callActive && (
          <div className="transcript-entry user interim">
            <div className="entry-meta">
              <span className="entry-role">👤 You</span>
              <span className="entry-time">speaking...</span>
            </div>
            <div className="entry-text">{interimText}</div>
          </div>
        )}
      </div>
    </div>
  );
}
