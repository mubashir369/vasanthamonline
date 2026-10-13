'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" and all its inventory variants?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.slug !== slug && p._id !== slug));
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch {
      alert('Delete error');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.designNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.fabricType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Product & Inventory Catalog ({products.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your Kerala handlooms, silk sarees, variants, barcodes, and stock levels
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Design
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, design #, or fabric..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 font-mono">
            Loading products catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No products match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-950 font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Design / Title</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Fabric</th>
                  <th className="py-3.5 px-4">Variants</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Price Range</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map((prod) => {
                  const image =
                    prod.images?.[0] ||
                    prod.primaryVariant?.images?.[0] ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80';

                  return (
                    <tr key={prod._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-10 h-12 rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                          <img src={image} alt={prod.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <strong className="block text-neutral-900 dark:text-neutral-100 font-serif line-clamp-1">
                            {prod.title}
                          </strong>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {prod.designNumber || prod.styleNumber || prod.slug}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 capitalize text-neutral-700 dark:text-neutral-300">
                        {prod.audience}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                        <span className="px-2 py-0.5 rounded bg-crimson-50 dark:bg-crimson-950 text-crimson-800 dark:text-gold-300 font-semibold text-[10px]">
                          {prod.fabricType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {prod.variants?.length || 0} variants
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            prod.totalStock <= 5 ? 'text-red-600 font-bold' : 'text-emerald-600'
                          }`}
                        >
                          {prod.totalStock} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-serif font-bold text-neutral-900 dark:text-gold-300">
                        {formatPrice(prod.priceRange?.min || 0)}
                        {prod.priceRange?.max > prod.priceRange?.min &&
                          ` - ${formatPrice(prod.priceRange.max)}`}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 inline-block text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/products/${prod.slug}/edit`}
                          className="p-1.5 inline-block text-neutral-600 hover:text-crimson-700 dark:text-neutral-300 dark:hover:text-gold-400"
                          title="Edit Product & Variants"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(prod.slug, prod.title)}
                          className="p-1.5 inline-block text-neutral-400 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
