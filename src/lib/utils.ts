import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

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
