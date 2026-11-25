import type { TokenPayload } from '@/lib/auth';

/** Admins and the customer who placed the order may see everything. */
export function canViewFullOrder(order: any, user: TokenPayload | null): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  return Boolean(order.userId && order.userId.toString() === user.userId);
}

/** Whether `code` is this order's secret tracking code (case-insensitive). */
export function hasTrackingCode(order: any, code: unknown): boolean {
  return typeof code === 'string' && code.trim().toUpperCase() === String(order.trackingCode || '').toUpperCase();
}

/**
 * Order details safe to show to anyone who only knows the order number:
 * status, items and totals – no name, phone, email, address or payment IDs.
 */
export function publicOrderView(order: any) {
  const o = typeof order.toObject === 'function' ? order.toObject() : { ...order };
  return {
    _id: o._id,
    orderNumber: o.orderNumber,
    deliveryType: o.deliveryType,
    items: o.items,
    subtotal: o.subtotal,
    discountAmount: o.discountAmount,
    couponCode: o.couponCode,
    deliveryFee: o.deliveryFee,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    statusHistory: (o.statusHistory || []).map((h: any) => ({ status: h.status, timestamp: h.timestamp })),
    shippingAddress: o.shippingAddress ? { city: o.shippingAddress.city, district: o.shippingAddress.district } : undefined,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    limitedView: true,
  };
}

/** Full order minus internal fields. */
export function fullOrderView(order: any) {
  const o = typeof order.toObject === 'function' ? order.toObject() : { ...order };
  delete o.razorpaySignature;
  return o;
}
