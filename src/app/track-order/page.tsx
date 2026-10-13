'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  MapPin,
  AlertCircle,
  Calendar,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Received in system' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified by weavers' },
  { key: 'PROCESSING', label: 'Handcrafted / Packed', desc: 'Inspected for quality' },
  { key: 'SHIPPED', label: 'Out for Delivery / Ready', desc: 'In transit or ready at store' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Safely handed over' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [inputCode, setInputCode] = useState(codeParam);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'No matching order found');
        setOrder(null);
      }
    } catch {
      setError('Failed to fetch tracking data. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codeParam) {
      setInputCode(codeParam);
      fetchOrder(codeParam);
    }
  }, [codeParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputCode);
  };

  // Helper to calculate progress index
  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (currentStatus === 'CANCELLED') return 'cancelled';

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
          Real-Time Delivery & Pickup Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          Track Your Vasantham Order
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Enter your Order Number (e.g., <code>VSM-2026-XXXXX</code>) or the 16-character Tracking Token.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 shadow-md"
      >
        <div className="flex-1 relative flex items-center">
          <Package className="w-5 h-5 text-neutral-400 absolute left-3.5" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter Order # or Tracking Code..."
            required
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm font-mono uppercase rounded-xl bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:normal-case placeholder:font-sans focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-xl text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Locating...' : 'Track Parcel'}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Results Card */}
      {order && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="bg-neutral-50 dark:bg-neutral-950 p-6 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Order Reference
              </span>
              <h2 className="font-mono text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {order.orderNumber}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Current Status
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1 ${
                  order.orderStatus === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : order.orderStatus === 'CANCELLED'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : 'bg-gold-100 text-gold-900 dark:bg-gold-950 dark:text-gold-300'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Visual Multi-step Timeline */}
            <div>
              <h3 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-6">
                Fulfillment Timeline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {ORDER_STEPS.map((step, idx) => {
                  const state = getStepStatus(step.key, order.orderStatus);

                  return (
                    <div key={step.key} className="flex flex-col items-start md:items-center text-left md:text-center relative">
                      {/* Node Icon */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition shadow ${
                          state === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : state === 'current'
                            ? 'bg-crimson-800 text-gold-300 ring-4 ring-gold-400/30'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {state === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {step.label}
                      </span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Status History Log */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                  Tracking Event Log
                </h4>
                <div className="space-y-3">
                  {order.statusHistory.map((history: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-start justify-between text-xs gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {history.status}
                        </span>
                        <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">
                          {history.note || 'Status updated'}
                        </p>
                      </div>
                      <span className="text-[10px] text-neutral-400 flex-shrink-0">
                        {new Date(history.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fulfillment Destination */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-neutral-500 block">
                  Delivery Destination
                </span>
                {order.deliveryType === 'STORE_PICKUP' ? (
                  <div className="flex items-start gap-2 text-neutral-800 dark:text-neutral-200">
                    <Store className="w-4 h-4 text-gold-500 mt-0.5" />
                    <div>
                      <strong>Store Pickup at Flagship Store</strong>
                      <p className="text-neutral-500 text-[11px]">
                        OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-neutral-800 dark:text-neutral-200">
                    <Truck className="w-4 h-4 text-crimson-700 mt-0.5" />
                    <div>
                      <strong>{order.shippingAddress?.fullName}</strong>
                      <p className="text-neutral-500 text-[11px]">
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.district}, {order.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-neutral-500 block">
                  Payment Summary
                </span>
                <p className="text-neutral-800 dark:text-neutral-200">
                  Payment Method: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                </p>
                <p className="font-bold text-crimson-800 dark:text-gold-300 font-serif text-sm">
                  Total: {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm">Loading Order Tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
