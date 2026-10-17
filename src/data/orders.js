// Mock Order Database for Aura Skincare
export const ORDERS = {
  "ORD-101": {
    orderId: "ORD-101",
    customer: "Priya Sharma",
    product: "Vitamin C Serum (30ml)",
    value: 699,
    status: "Out for Delivery",
    trackingPartner: "BlueDart",
    trackingId: "BD-982103",
    notes: "Expected by 6 PM today",
    canCancel: false,
    canReturn: false,
    deliveredDaysAgo: null,
  },
  "ORD-102": {
    orderId: "ORD-102",
    customer: "Rahul Verma",
    product: "Hydrating Sunscreen SPF 50",
    value: 499,
    status: "Delivered",
    trackingPartner: "Delhivery",
    trackingId: "DL-441029",
    notes: "Delivered 14 days ago",
    canCancel: false,
    canReturn: false, // >7 days since delivery
    deliveredDaysAgo: 14,
  },
  "ORD-103": {
    orderId: "ORD-103",
    customer: "Ananya Patel",
    product: "Green Tea Face Wash + Toner",
    value: 850,
    status: "Processing",
    trackingPartner: null,
    trackingId: null,
    notes: "Ordered 3 hours ago. Eligible for cancellation",
    canCancel: true,
    canReturn: false,
    deliveredDaysAgo: null,
  },
};

export function getOrderDetails(orderId) {
  const normalised = orderId?.toString().trim().toUpperCase();
  const order = ORDERS[normalised];
  if (!order) {
    return {
      found: false,
      error: `No order found with ID ${orderId}. Please verify the order ID and try again.`,
    };
  }
  return { found: true, order };
}
