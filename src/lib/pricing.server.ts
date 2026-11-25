/**
 * Server-side cart pricing. The single source of truth for what an order costs:
 * used to create the Razorpay order (what the customer is charged) and to create
 * the order itself, so the browser can never choose the amount.
 */
import ProductVariant from '@/lib/models/ProductVariant';
import Product from '@/lib/models/Product';
import Coupon, { ICoupon } from '@/lib/models/Coupon';
import StoreSettings from '@/lib/models/StoreSettings';
import { calculateDeliveryFee } from '@/lib/utils.server';
import { computeCouponDiscount } from '@/lib/couponRules';

const MAX_QUANTITY_PER_ITEM = 50;
const MAX_LINE_ITEMS = 50;

export interface PricedItem {
  productId: unknown;
  variantId: unknown;
  title: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export type CartPricing =
  | {
      ok: true;
      items: PricedItem[];
      subtotal: number;
      discountAmount: number;
      deliveryFee: number;
      totalAmount: number;
      /** The applied coupon, so the caller can count its use once the order is saved */
      coupon: (ICoupon & { save(): Promise<unknown> }) | null;
    }
  | { ok: false; error: string; status: number };

export async function priceCart(input: {
  items: unknown;
  couponCode?: unknown;
  deliveryType?: unknown;
}): Promise<CartPricing> {
  const { items } = input;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, error: 'Cart is empty' };
  }
  if (items.length > MAX_LINE_ITEMS) {
    return { ok: false, status: 400, error: 'Too many items in one order' };
  }

  const deliveryType = input.deliveryType === 'STORE_PICKUP' ? 'STORE_PICKUP' : 'HOME_DELIVERY';
  const settings = (await StoreSettings.findOne().lean()) as any;

  const priced: PricedItem[] = [];
  let subtotal = 0;

  for (const raw of items) {
    const quantity = Number((raw as any)?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return { ok: false, status: 400, error: `Each item quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}` };
    }

    const variant = await ProductVariant.findById((raw as any)?.variantId).catch(() => null);
    if (!variant) {
      return { ok: false, status: 404, error: 'A product in your bag is no longer available' };
    }
    if (variant.stockQuantity < quantity) {
      return {
        ok: false,
        status: 400,
        error: `Insufficient stock for ${variant.color} (${variant.size}). Only ${variant.stockQuantity} remaining.`,
      };
    }

    const product = await Product.findById(variant.productId);
    const unitPrice = variant.salePrice || variant.price;
    subtotal += unitPrice * quantity;

    priced.push({
      productId: variant.productId,
      variantId: variant._id,
      title: product?.title || 'Heritage Textile Item',
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: unitPrice,
      quantity,
      image: variant.images?.[0] || product?.images?.[0] || '',
    });
  }

  let discountAmount = 0;
  let appliedCoupon: any = null;
  if (typeof input.couponCode === 'string' && input.couponCode.trim()) {
    const now = new Date();
    const coupon = await Coupon.findOne({ code: input.couponCode.toUpperCase().trim(), isActive: true });
    const usable =
      coupon &&
      (!coupon.startDate || new Date(coupon.startDate) <= now) &&
      (!coupon.endDate || new Date(coupon.endDate) >= now) &&
      (!coupon.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit) &&
      subtotal >= (coupon.minOrderValue || 0);

    if (usable) {
      discountAmount = computeCouponDiscount(coupon, subtotal);
      appliedCoupon = coupon;
    }
  }

  const deliveryFee = calculateDeliveryFee(
    deliveryType,
    subtotal - discountAmount,
    settings?.baseCourierCharge ?? 80,
    settings?.freeDeliveryMinAmount ?? 1999
  );

  return {
    ok: true,
    items: priced,
    subtotal,
    discountAmount,
    deliveryFee,
    totalAmount: subtotal - discountAmount + deliveryFee,
    coupon: appliedCoupon,
  };
}
