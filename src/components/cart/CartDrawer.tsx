'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Store, Truck } from 'lucide-react';

export default function CartDrawer() {
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
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon code');
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 shadow-2xl flex flex-col transition-all duration-300 transform animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-crimson-700 dark:text-gold-400" />
              <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-100">
                Your Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Selector Bar */}
          <div className="px-6 py-2.5 bg-crimson-50/50 dark:bg-neutral-800/40 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">Delivery:</span>
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setDeliveryType('HOME_DELIVERY')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                  deliveryType === 'HOME_DELIVERY'
                    ? 'bg-crimson-700 text-white font-semibold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Courier
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('STORE_PICKUP')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                  deliveryType === 'STORE_PICKUP'
                    ? 'bg-gold-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
                title="Free pickup from Mannarkkad, Palakkad store"
              >
                <Store className="w-3.5 h-3.5" />
                Pickup (₹0)
              </button>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-crimson-50 dark:bg-neutral-800 flex items-center justify-center text-crimson-600 dark:text-gold-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                  Your bag is currently empty
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                  Discover our timeless Kerala Kasavu sarees, pure silk weaves, and festival wear.
                </p>
                <Link
                  href="/catalog"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-crimson-800 hover:bg-crimson-900 text-gold-300 font-medium rounded-lg text-sm shadow-md transition"
                >
                  Explore Collections <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden relative border border-neutral-200 dark:border-neutral-700">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-medium text-sm text-neutral-900 dark:text-neutral-100 hover:text-crimson-700 dark:hover:text-gold-400 line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 space-x-2">
                        <span>Color: <strong className="text-neutral-700 dark:text-neutral-300">{item.color}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-neutral-700 dark:text-neutral-300">{item.size}</strong></span>
                      </div>

                      <div className="text-xs font-mono text-neutral-400 mt-0.5">
                        SKU: {item.sku}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-semibold text-sm text-neutral-900 dark:text-gold-300">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-neutral-400">
                            {formatPrice(item.price)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-3">
              {/* Coupon Form */}
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{coupon.code}</strong> applied (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-neutral-400 hover:text-red-600 text-xs font-semibold underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon (e.g. VASANTHAM10)"
                    className="flex-1 text-xs px-3 py-2 uppercase rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-crimson-600"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-xs text-red-600 dark:text-red-400">{couponError}</p>}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-200">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    Delivery ({deliveryType === 'STORE_PICKUP' ? 'Mannarkkad Store Pickup' : 'Courier'})
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-200">
                    {deliveryFee === 0 ? (
                      <strong className="text-emerald-600 uppercase">FREE</strong>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <span>Total Payable</span>
                  <span className="text-crimson-800 dark:text-gold-300 font-serif text-base">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-crimson-950 text-gold-300 font-semibold rounded-lg text-center shadow-md flex items-center justify-center gap-2 transition"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2 text-center text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium"
                >
                  View Full Cart Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
