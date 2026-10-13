'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  Calendar,
  Store,
  Truck,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

export default function AccountOrdersPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [user]);

  if (isLoading || loadingOrders) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-crimson-800 border-t-gold-400 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-500">Loading your purchase history...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Please sign in</h2>
        <p className="text-xs text-neutral-500">Log in to view your past orders and shipment status.</p>
        <Link
          href="/login"
          className="inline-flex px-6 py-2.5 bg-crimson-800 text-gold-300 text-xs font-bold rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            My Orders ({orders.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track and view receipts for your Vasantham Group purchases
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/account/profile"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-crimson-800 underline"
          >
            Manage Addresses
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-crimson-50 dark:bg-neutral-800 text-crimson-700 dark:text-gold-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-neutral-800 dark:text-neutral-200">
            No orders placed yet
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You haven’t placed any orders yet. Discover our wedding silks and handloom collections today.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-crimson-800 text-gold-300 font-bold rounded-lg text-xs shadow hover:bg-crimson-900 transition"
          >
            Explore Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden"
            >
              {/* Order Card Top Bar */}
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Order Number
                    </span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {ord.orderNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Date
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Total
                    </span>
                    <span className="font-bold text-crimson-800 dark:text-gold-300 font-serif">
                      {formatPrice(ord.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ord.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : ord.orderStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-gold-100 text-gold-900 dark:bg-gold-950 dark:text-gold-300'
                    }`}
                  >
                    {ord.orderStatus}
                  </span>

                  <Link
                    href={`/track-order?code=${ord.trackingCode || ord.orderNumber}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-crimson-800 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Track <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 sm:p-5 divide-y divide-neutral-100 dark:divide-neutral-800">
                {ord.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-neutral-900 dark:text-gold-300">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="block text-[10px] text-neutral-400">
                          {formatPrice(item.price)} each
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer: Delivery info */}
              <div className="bg-neutral-50/50 dark:bg-neutral-950/50 px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  {ord.deliveryType === 'STORE_PICKUP' ? (
                    <>
                      <Store className="w-3.5 h-3.5 text-gold-500" />
                      <span>Store Pickup (Mannarkkad, Palakkad)</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5 text-crimson-700" />
                      <span>Doorstep Courier to {ord.shippingAddress?.city}</span>
                    </>
                  )}
                </div>
                <span className="font-mono text-[11px] text-neutral-400">
                  Tracking: {ord.trackingCode}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
