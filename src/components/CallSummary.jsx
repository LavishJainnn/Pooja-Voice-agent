// CallSummary.jsx — Post-call structured JSON summary
import "./CallSummary.css";

const INTENT_LABELS = {
  ORDER_TRACKING: "📦 Order Tracking",
  RETURN_REQUEST: "↩️ Return Request",
  CANCELLATION: "❌ Cancellation",
  REFUND: "💳 Refund",
  PRODUCT_INQUIRY: "🔍 Product Inquiry",
  POLICY_QUERY: "📋 Policy Query",
  OUT_OF_SCOPE: "🚫 Out of Scope",
  GENERAL: "💬 General",
};

const STATUS_COLORS = {
  RESOLVED: "#4ecb6e",
  UNRESOLVED: "#ff6b6b",
  ESCALATION_NEEDED: "#f4a12a",
  OUT_OF_SCOPE: "#7db8e0",
};

const SENTIMENT_COLORS = {
  POSITIVE: "#4ecb6e",
  NEUTRAL: "#d4af37",
  NEGATIVE: "#ff6b6b",
};

export default function CallSummary({ summary, transcript }) {
  if (!summary && (!transcript || transcript.length === 0)) return null;

  const downloadTranscript = () => {
    const text = transcript
      .map((t) => `[${t.timestamp}] ${t.role === "user" ? "Customer" : "Aria"}: ${t.text}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aura-call-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aura-call-summary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="call-summary">
      <div className="summary-header">
        <span className="summary-title">📊 Call Summary</span>
        <div className="summary-actions">
          <button className="summary-btn" onClick={downloadTranscript}>
            ⬇ Transcript
          </button>
          {summary && (
            <button className="summary-btn gold" onClick={downloadJSON}>
              ⬇ JSON
            </button>
          )}
        </div>
      </div>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card-row">
            <div className="summary-card">
              <div className="summary-card-label">Intent</div>
              <div className="summary-card-value">
                {INTENT_LABELS[summary.customer_intent] || summary.customer_intent}
              </div>
            </div>
            {summary.order_id && (
              <div className="summary-card">
                <div className="summary-card-label">Order ID</div>
                <div className="summary-card-value order-id-val">
                  {summary.order_id}
                </div>
              </div>
            )}
            <div className="summary-card">
              <div className="summary-card-label">Resolution</div>
              <div
                className="summary-card-value"
                style={{ color: STATUS_COLORS[summary.resolution_status] }}
              >
                {summary.resolution_status}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">Sentiment</div>
              <div
                className="summary-card-value"
                style={{ color: SENTIMENT_COLORS[summary.sentiment] }}
              >
                {summary.sentiment}
              </div>
            </div>
          </div>

          {summary.call_summary && (
            <div className="summary-text-card">
              <div className="summary-card-label">Summary</div>
              <p className="summary-text">{summary.call_summary}</p>
            </div>
          )}

          <div className="summary-json-block">
            <div className="summary-card-label">Structured Output (JSON)</div>
            <pre className="summary-json">{JSON.stringify(summary, null, 2)}</pre>
          </div>
        </div>
      )}

      {!summary && transcript.length > 0 && (
        <div className="summary-generating">
          <div className="spinner" />
          <span>Generating call summary...</span>
        </div>
      )}
    </div>
  );
}
