import crypto from 'crypto';

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `VSM-${year}-${randomChars}`;
}

export function generateTrackingCode(): string {
  const bytes = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `TRK-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}`;
}

export function calculateDeliveryFee(
  deliveryType: 'STORE_PICKUP' | 'HOME_DELIVERY',
  subtotal: number,
  baseFee: number = 80,
  freeThreshold: number = 1999
): number {
  if (deliveryType === 'STORE_PICKUP') {
    return 0;
  }
  if (subtotal >= freeThreshold) {
    return 0;
  }
  return baseFee;
}
