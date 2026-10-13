'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const loadAnalytics = () => {
    setLoading(true);
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed/reset the database with the complete authentic Kerala textile catalog. Continue?')) {
      return;
    }
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const resData = await res.json();
      if (resData.success) {
        setSeedMessage('Catalog successfully reseeded!');
        loadAnalytics();
        setTimeout(() => setSeedMessage(''), 5000);
      }
    } catch {
      alert('Seeding error');
    } finally {
      setSeeding(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-crimson-800 border-t-gold-400 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-500 font-mono">Aggregating store metrics...</p>
      </div>
    );
  }

  const { metrics, statusCounts, lowStockVariants, recentOrders } = data || {
    metrics: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, totalProducts: 0, totalCustomers: 0 },
    statusCounts: {},
    lowStockVariants: [],
    recentOrders: [],
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Store Performance & KPIs
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time sales, order processing queue, and inventory alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding...' : 'Reseed Malabar Catalog'}
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
            {formatPrice(metrics.totalRevenue)}
          </div>
          <p className="text-[11px] text-neutral-500">From paid & completed deliveries</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-crimson-100 dark:bg-crimson-950 text-crimson-700 dark:text-gold-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
            {metrics.totalOrders}
          </div>
          <p className="text-[11px] text-neutral-500">Avg Value: {formatPrice(metrics.averageOrderValue)}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Designs</span>
            <div className="w-8 h-8 rounded-lg bg-gold-100 dark:bg-gold-950 text-gold-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
            {metrics.totalProducts}
          </div>
          <p className="text-[11px] text-neutral-500">Live products in store</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Patrons</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
            {metrics.totalCustomers}
          </div>
          <p className="text-[11px] text-neutral-500">Active customer accounts</p>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <h2 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100">
          Order Pipeline Status Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">Pending</span>
            <span className="text-xl font-bold font-serif text-amber-900 dark:text-amber-200">
              {statusCounts?.PENDING || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 block">Processing</span>
            <span className="text-xl font-bold font-serif text-blue-900 dark:text-blue-200">
              {statusCounts?.PROCESSING || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
            <span className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-300 block">Shipped / Pickup</span>
            <span className="text-xl font-bold font-serif text-purple-900 dark:text-purple-200">
              {statusCounts?.SHIPPED || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Delivered</span>
            <span className="text-xl font-bold font-serif text-emerald-900 dark:text-emerald-200">
              {statusCounts?.DELIVERED || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
            <span className="text-[10px] uppercase font-bold text-red-800 dark:text-red-300 block">Cancelled</span>
            <span className="text-xl font-bold font-serif text-red-900 dark:text-red-200">
              {statusCounts?.CANCELLED || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Warnings (&le; 5 units)
            </h2>
            <Link
              href="/admin/products"
              className="text-xs text-crimson-700 dark:text-gold-400 font-semibold hover:underline"
            >
              Manage &rarr;
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">All product variants have healthy stock levels.</p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {lowStockVariants.map((v: any) => (
                <div key={v._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <strong className="block text-neutral-900 dark:text-neutral-100 line-clamp-1">
                      {v.productId?.title || 'Textile Item'}
                    </strong>
                    <span className="text-neutral-500 text-[11px]">
                      {v.color} • {v.size} (SKU: {v.sku})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-[11px]">
                    {v.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-crimson-700 dark:text-gold-400" />
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-crimson-700 dark:text-gold-400 font-semibold hover:underline"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No orders received yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {recentOrders.map((ord: any) => (
                <div key={ord._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gold-100 text-gold-900'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px] mt-0.5">
                      {ord.customerInfo?.name} • {ord.deliveryType === 'STORE_PICKUP' ? 'Store Pickup' : 'Courier'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-neutral-900 dark:text-gold-300 font-serif">
                      {formatPrice(ord.totalAmount)}
                    </span>
                    <Link
                      href={`/admin/orders/${ord.orderNumber}`}
                      className="block text-[11px] text-crimson-700 dark:text-gold-400 hover:underline font-semibold mt-0.5"
                    >
                      Update &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
