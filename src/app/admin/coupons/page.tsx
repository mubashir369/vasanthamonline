'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, X, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(1500);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(1000);
  const [endDate, setEndDate] = useState('2028-12-31');
  const [usageLimit, setUsageLimit] = useState(500);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadCoupons = () => {
    setLoading(true);
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCoupons(data.coupons || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderValue(1500);
    setMaxDiscountAmount(1000);
    setEndDate('2028-12-31');
    setUsageLimit(500);
    setShowForm(false);
    setError('');
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Delete coupon "${codeName}"?`)) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.filter((c) => c._id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Delete error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    setError('');

    const payload = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      endDate: new Date(endDate),
      usageLimit: Number(usageLimit),
      isActive: true,
    };

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        loadCoupons();
      } else {
        setError(data.error || 'Failed to create coupon');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Promotional Coupons & Festive Vouchers ({coupons.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage percentage and flat discount codes for weddings and festive campaigns
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-crimson-800 to-crimson-900 text-gold-300 font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              Create Promotional Coupon
            </h2>
            <button type="button" onClick={resetForm} className="text-neutral-400 hover:text-neutral-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ONAM2026"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat Discount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'} *
              </label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                min={0}
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Max Discount Cap (₹)</label>
              <input
                type="number"
                min={0}
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-crimson-800 text-gold-300 font-bold rounded-lg uppercase tracking-wider"
            >
              {submitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading coupons...</div>
        ) : (
          <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50 dark:bg-neutral-950 font-semibold text-neutral-500 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Max Discount</th>
                <th className="py-3 px-4">Used Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-crimson-700 dark:text-gold-400">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                  </td>
                  <td className="py-3 px-4">{formatPrice(c.minOrderValue || 0)}</td>
                  <td className="py-3 px-4">{c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'No Cap'}</td>
                  <td className="py-3 px-4 font-mono">{c.usedCount || 0} times</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c._id, c.code)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
