'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import {
  ArrowLeft,
  Store,
  Truck,
  CheckCircle2,
  Save,
  Clock,
  ExternalLink,
} from 'lucide-react';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const loadOrder = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
          setNewStatus(data.order.orderStatus);
          setNewPaymentStatus(data.order.paymentStatus);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          paymentStatus: newPaymentStatus,
          note: statusNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setStatusNote('');
        setMessage('Order status updated and event logged in audit timeline!');
        setTimeout(() => setMessage(''), 5000);
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch {
      alert('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs font-mono">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-xs text-red-500">Order not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Order {order.orderNumber}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans font-bold ${
                  order.orderStatus === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gold-100 text-gold-900'
                }`}
              >
                {order.orderStatus}
              </span>
            </h1>
            <span className="font-mono text-xs text-neutral-400">
              Tracking Code: {order.trackingCode}
            </span>
          </div>
        </div>

        <Link
          href={`/track-order?code=${order.trackingCode}`}
          target="_blank"
          className="text-xs font-semibold text-crimson-700 dark:text-gold-400 hover:underline flex items-center gap-1.5"
        >
          View Public Tracker <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Address Card */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              Customer & Delivery Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-neutral-500 uppercase block mb-1">Customer</span>
                <strong className="block text-sm text-neutral-900 dark:text-neutral-100">
                  {order.customerInfo?.name}
                </strong>
                <p className="text-neutral-600 dark:text-neutral-400">{order.customerInfo?.phone}</p>
                <p className="text-neutral-600 dark:text-neutral-400">{order.customerInfo?.email}</p>
              </div>

              <div>
                <span className="font-bold text-neutral-500 uppercase block mb-1">Fulfillment Mode</span>
                <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-semibold mb-1">
                  {order.deliveryType === 'STORE_PICKUP' ? (
                    <>
                      <Store className="w-4 h-4 text-gold-500" />
                      <span>Store Pickup (Mannarkkad)</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 text-crimson-700" />
                      <span>Doorstep Courier Delivery</span>
                    </>
                  )}
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                  {order.shippingAddress?.district}, {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              Ordered Products ({order.items?.length})
            </h2>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <strong className="block text-neutral-900 dark:text-neutral-100">
                        {item.title}
                      </strong>
                      <span className="text-neutral-500 text-[11px]">
                        Color: {item.color} • Size: {item.size} • SKU: {item.sku}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-neutral-900 dark:text-gold-300 font-serif">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <span className="block text-[10px] text-neutral-400">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1.5 text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({order.couponCode || 'PROMO'})</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span>Total Amount</span>
                <span className="text-crimson-800 dark:text-gold-300 font-serif text-base">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Updater & Audit History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Progression Form */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              Update Order Status
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Status Note / Audit Comment
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Saree inspected for pure zari quality. Packed and ready at Mannarkkad store."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-lg uppercase tracking-wider shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {updating ? 'Updating...' : 'Save & Log Event'}
              </button>
            </form>
          </div>

          {/* Audit History Log */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
            <h3 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              Status History Timeline ({order.statusHistory?.length || 0})
            </h3>

            <div className="space-y-3">
              {order.statusHistory?.map((h: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-crimson-800 dark:text-gold-400 uppercase">
                      {h.status}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(h.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  {h.note && <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">{h.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
