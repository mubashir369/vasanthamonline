'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Store,
  Truck,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    deliveryFee,
    totalAmount,
    deliveryType,
    setDeliveryType,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    setApplying(false);
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon');
    } else {
      setCouponCode('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-crimson-50 dark:bg-neutral-800 text-crimson-700 dark:text-gold-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Explore our authentic silk sarees, traditional Kerala Kasavu handlooms, and family festive wear.
        </p>
        <div className="pt-4">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-7 py-3 bg-crimson-800 text-gold-300 font-bold rounded-xl text-sm shadow hover:bg-crimson-900 transition"
          >
            Explore Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review your selected handloom and fashion pieces
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-neutral-400 hover:text-red-600 transition self-start sm:self-auto mt-2 sm:mt-0"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-24 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 hover:text-crimson-800 dark:hover:text-gold-400 line-clamp-1"
                >
                  {item.title}
                </Link>

                <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-2">
                  <span>Color: <strong className="text-neutral-700 dark:text-neutral-300">{item.color}</strong></span>
                  <span>•</span>
                  <span>Size: <strong className="text-neutral-700 dark:text-neutral-300">{item.size}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-neutral-400">SKU: {item.sku}</span>
                </div>

                <div className="text-xs text-neutral-500 pt-1">
                  Unit Price: <span className="font-semibold text-neutral-900 dark:text-neutral-200">{formatPrice(item.price)}</span>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                <div className="text-base font-bold text-neutral-900 dark:text-gold-300 font-serif">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Order Summary
            </h2>

            {/* Delivery Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Delivery Method
              </label>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('HOME_DELIVERY')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-3 transition ${
                    deliveryType === 'HOME_DELIVERY'
                      ? 'border-crimson-700 dark:border-gold-400 bg-crimson-50/50 dark:bg-neutral-800 ring-1 ring-crimson-700/20'
                      : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <Truck className="w-4 h-4 text-crimson-700 dark:text-gold-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                      Doorstep Courier
                    </div>
                    <div className="text-neutral-500 text-[11px]">
                      FREE for orders ₹1,999+, else ₹80
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('STORE_PICKUP')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-3 transition ${
                    deliveryType === 'STORE_PICKUP'
                      ? 'border-gold-500 bg-gold-50/50 dark:bg-neutral-800 ring-1 ring-gold-500/20'
                      : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <Store className="w-4 h-4 text-gold-600 dark:text-gold-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      Store Pickup at Mannarkkad <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
                    </div>
                    <div className="text-neutral-500 text-[11px]">
                      OPP. MY G Future, Main Road, Palakkad
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Promo / Gift Coupon
              </label>

              {coupon ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                    <Tag className="w-4 h-4" />
                    <span><strong>{coupon.code}</strong> (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-neutral-400 hover:text-red-600 underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. VASANTHAM10"
                    className="flex-1 text-xs px-3 py-2 uppercase rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponCode.trim()}
                    className="px-4 py-2 bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-neutral-100 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <span>Total Amount</span>
                <span className="text-crimson-800 dark:text-gold-300 font-serif text-xl">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-crimson-950 text-gold-300 font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              <span>Safe & Secure Kerala Textile Fulfillment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
