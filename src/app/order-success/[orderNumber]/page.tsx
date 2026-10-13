'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { formatPrice } from '@/lib/utils';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Store,
  Truck,
  Copy,
  Check,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params?.orderNumber as string;
  const initialTrackingCode = searchParams.get('trackingCode') || '';

  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7E121D', '#D4AF37', '#be9627', '#ffffff'],
      });
    } catch {}

    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrder(data.order);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  const trackingCode = order?.trackingCode || initialTrackingCode;

  const copyTracking = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 text-center sm:text-left">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
            Order Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Thank You for Shopping with Vasantham Group!
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto pt-1">
            Your authentic Kerala handloom and textile order has been received and is now being carefully prepared.
          </p>
        </div>

        {/* Order Identifier & Tracking Token Box */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 max-w-md mx-auto space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Order Number:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              {orderNumber}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 pt-2">
            <span className="text-neutral-500">Tracking Code:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-crimson-800 dark:text-gold-400">
                {trackingCode || 'TRK-XXXX-XXXX'}
              </span>
              <button
                onClick={copyTracking}
                className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                title="Copy tracking code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/track-order?code=${encodeURIComponent(trackingCode || orderNumber)}`}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-crimson-950 text-gold-300 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" /> Track Live Order Status
          </Link>

          <Link
            href="/catalog"
            className="w-full sm:w-auto px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Order Details Breakdown */}
      {order && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Order Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Fulfillment Type
              </span>
              <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                {order.deliveryType === 'STORE_PICKUP' ? (
                  <>
                    <Store className="w-4 h-4 text-gold-600" />
                    <span>Store Pickup (OPP. MY G Future, Mannarkkad, Palakkad)</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-crimson-700" />
                    <span>Courier Delivery ({order.shippingAddress?.street}, {order.shippingAddress?.city})</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <span className="font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Payment Info
              </span>
              <p className="font-medium text-neutral-800 dark:text-neutral-200">
                Method: <strong>{order.paymentMethod}</strong> • Status: <strong className="text-emerald-600">{order.paymentStatus}</strong>
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border-t border-neutral-100 dark:border-neutral-800 pt-4">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{item.title}</span>
                    <p className="text-[11px] text-neutral-500">{item.size} • {item.color} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-gold-300">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <span>Total Paid / Payable</span>
              <span className="text-crimson-800 dark:text-gold-300 font-serif text-base">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
