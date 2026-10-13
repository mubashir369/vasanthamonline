'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = () => {
    setLoading(true);
    fetch('/api/reviews?all=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map((r) => (r._id === id ? { ...r, isApproved: !currentStatus } : r)));
      }
    } catch {
      alert('Error updating review status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this customer review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter((r) => r._id !== id));
      }
    } catch {
      alert('Error deleting review');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Customer Review Moderation ({reviews.length})
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Approve, hide, or remove reviews submitted by patrons across Kerala
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">No reviews found.</div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <strong className="text-neutral-900 dark:text-neutral-100">{rev.userName}</strong>
                    <div className="flex text-gold-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rev.isApproved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {rev.isApproved ? 'Approved' : 'Pending / Hidden'}
                    </span>
                  </div>

                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                    <span>Item: <strong>{rev.productId?.title || 'Unknown Product'}</strong></span>
                    {rev.productId?.slug && (
                      <Link
                        href={`/product/${rev.productId.slug}`}
                        target="_blank"
                        className="text-crimson-700 dark:text-gold-400 hover:underline flex items-center gap-0.5"
                      >
                        View PDP <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    <span>• {new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggleApproval(rev._id, rev.isApproved)}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                      rev.isApproved
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {rev.isApproved ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Unpublish
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
