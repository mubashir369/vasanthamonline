import crypto from 'crypto';
import Razorpay from 'razorpay';

let client: Razorpay | null = null;

/** Razorpay API client, or null when the keys aren't configured. */
export function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  if (!client) client = new Razorpay({ key_id, key_secret });
  return client;
}

/** Checks the checkout signature Razorpay returns to the browser after payment. */
export function isValidPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || typeof signature !== 'string') return false;
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Rupees -> paise, the unit Razorpay amounts use. */
export const toPaise = (rupees: number) => Math.round(rupees * 100);
