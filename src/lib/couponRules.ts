/**
 * Coupon rules shared by the admin API, the checkout pricing on the server and the
 * cart in the browser, so the discount shown is always the discount charged.
 * No database access here – safe to import on the client.
 */

export interface CouponRules {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
}

export const MAX_PERCENTAGE = 90;
const UNCAPPED_PERCENTAGE_LIMIT = 50;

/** The rupee discount for a subtotal; 0 when the minimum order isn't met. */
export function computeCouponDiscount(rules: CouponRules, subtotal: number): number {
  if (!rules || subtotal <= 0 || subtotal < (rules.minOrderValue || 0)) return 0;
  let discount =
    rules.discountType === 'percentage'
      ? Math.round((subtotal * rules.discountValue) / 100)
      : rules.discountValue;
  if (rules.maxDiscountAmount && discount > rules.maxDiscountAmount) discount = rules.maxDiscountAmount;
  return Math.min(Math.max(discount, 0), subtotal);
}

/** Returns an error message for an invalid coupon setup, or null if it's valid. */
export function validateCouponSetup(input: {
  code?: unknown;
  discountType?: unknown;
  discountValue?: unknown;
  minOrderValue?: unknown;
  maxDiscountAmount?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  usageLimit?: unknown;
}): string | null {
  const code = typeof input.code === 'string' ? input.code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
    return 'Coupon code must be 3–20 letters, numbers, - or _';
  }
  if (input.discountType !== 'percentage' && input.discountType !== 'fixed') {
    return 'Discount type must be percentage or fixed';
  }

  const value = Number(input.discountValue);
  const minOrder = Number(input.minOrderValue || 0);
  const hasCap = input.maxDiscountAmount !== undefined && input.maxDiscountAmount !== null && input.maxDiscountAmount !== '';
  const cap = Number(input.maxDiscountAmount);

  if (!Number.isFinite(minOrder) || minOrder < 0) return 'Minimum order value cannot be negative';
  if (hasCap && (!Number.isFinite(cap) || cap < 1)) return 'Max discount cap must be at least ₹1';

  if (input.discountType === 'percentage') {
    if (!Number.isFinite(value) || value < 1 || value > MAX_PERCENTAGE) {
      return `Percentage discount must be between 1% and ${MAX_PERCENTAGE}%`;
    }
    if (value > UNCAPPED_PERCENTAGE_LIMIT && !hasCap) {
      return `Discounts above ${UNCAPPED_PERCENTAGE_LIMIT}% need a max discount cap`;
    }
  } else {
    if (!Number.isFinite(value) || value < 1) return 'Flat discount must be at least ₹1';
    if (value >= minOrder) {
      return 'For a flat discount, set a minimum order value higher than the discount (so an order is never free)';
    }
  }

  if (input.usageLimit !== undefined && input.usageLimit !== null && input.usageLimit !== '') {
    const limit = Number(input.usageLimit);
    if (!Number.isInteger(limit) || limit < 1) return 'Usage limit must be a whole number of at least 1';
  }

  const end = input.endDate ? new Date(String(input.endDate)) : null;
  if (!end || Number.isNaN(end.getTime())) return 'A valid expiry date is required';
  const start = input.startDate ? new Date(String(input.startDate)) : null;
  if (start && !Number.isNaN(start.getTime()) && end <= start) return 'Expiry date must be after the start date';

  return null;
}
