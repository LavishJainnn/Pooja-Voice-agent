// OrdersPanel.jsx — Test helper showing available sample orders
import "./OrdersPanel.css";
import { ORDERS } from "../data/orders";

const STATUS_COLORS = {
  "Out for Delivery": "#f4a12a",
  "Delivered": "#4ecb6e",
  "Processing": "#7db8e0",
};

export default function OrdersPanel() {
  return (
    <div className="orders-panel">
      <div className="orders-header">
        <span className="orders-title">🧪 Test Orders</span>
        <span className="orders-subtitle">Use these IDs to test order lookup</span>
      </div>
      <div className="orders-list">
        {Object.values(ORDERS).map((order) => (
          <div key={order.orderId} className="order-card">
            <div className="order-card-top">
              <span className="order-id">{order.orderId}</span>
              <span
                className="order-status"
                style={{ color: STATUS_COLORS[order.status] || "#fff" }}
              >
                {order.status}
              </span>
            </div>
            <div className="order-customer">👤 {order.customer}</div>
            <div className="order-product">📦 {order.product}</div>
            <div className="order-value">₹{order.value}</div>
            <div className="order-notes">{order.notes}</div>
            {order.trackingId && (
              <div className="order-tracking">
                🚚 {order.trackingPartner} · {order.trackingId}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="orders-tip">
        💡 Say: <em>"Where is my order ORD-101?"</em>
      </div>
    </div>
  );
}
