'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  ExternalLink,
  Store,
  Truck,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

const STATUS_FILTERS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.trackingCode?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo?.phone?.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Customer Orders & Fulfillment ({orders.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track, advance statuses, inspect pickup orders, and manage shipments
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-crimson-800 text-gold-300 shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, phone, name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 font-mono">
            Loading orders from MongoDB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No matching orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-950 font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Order / Tracking</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Delivery Type</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map((ord) => (
                  <tr key={ord._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <strong className="block text-neutral-900 dark:text-neutral-100 text-sm">
                        {ord.orderNumber}
                      </strong>
                      <span className="text-[10px] text-neutral-400">
                        {ord.trackingCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="block text-neutral-900 dark:text-neutral-100">
                        {ord.customerInfo?.name}
                      </strong>
                      <span className="text-neutral-500 text-[11px]">
                        {ord.customerInfo?.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                        {ord.deliveryType === 'STORE_PICKUP' ? (
                          <>
                            <Store className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                            <span>Store Pickup</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5 text-crimson-700 flex-shrink-0" />
                            <span>Doorstep Courier</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {ord.paymentMethod}
                      </span>
                      <span
                        className={`block text-[10px] uppercase font-bold ${
                          ord.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
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
                    </td>

                    <td className="py-3.5 px-4 font-serif font-bold text-neutral-900 dark:text-gold-300">
                      {formatPrice(ord.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.orderNumber}`}
                        className="px-3 py-1.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-crimson-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
