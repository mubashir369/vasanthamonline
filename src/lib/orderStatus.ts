/**
 * Order workflow rules, shared by the order API and the admin order page.
 * Orders only move forward (skipping steps is fine, e.g. straight to SHIPPED for a
 * store pickup). They can be cancelled until they ship. DELIVERED and CANCELLED are final.
 */

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_DUE' | 'REFUNDED';

export const ORDER_FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUND_DUE', 'REFUNDED'];

const SHIPPED_INDEX = ORDER_FLOW.indexOf('SHIPPED');

/** Statuses an order may move to next from `current`. */
export function allowedNextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === 'DELIVERED' || current === 'CANCELLED') return [];
  const index = ORDER_FLOW.indexOf(current);
  const forward = ORDER_FLOW.slice(index + 1);
  return index < SHIPPED_INDEX ? [...forward, 'CANCELLED'] : forward;
}

export function canChangeStatus(from: OrderStatus, to: OrderStatus): boolean {
  return allowedNextStatuses(from).includes(to);
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUND_DUE: 'Refund due',
  REFUNDED: 'Refunded',
};
