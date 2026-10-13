'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/storefront/ProductCard';
import {
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const AUDIENCES = [
  { id: 'women', label: 'Women' },
  { id: 'ladies', label: 'Ladies' },
  { id: 'men', label: 'Men' },
  { id: 'gents', label: 'Gents' },
  { id: 'girls', label: 'Girls' },
  { id: 'boys', label: 'Boys' },
];

const FABRICS = ['Silk', 'Cotton', 'Designer', 'Ethnic', 'Linen'];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'title_asc', label: 'Alphabetical: A-Z' },
];

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters read from URL
  const currentAudience = searchParams.get('audience')?.split(',').filter(Boolean) || [];
  const currentFabric = searchParams.get('fabricType')?.split(',').filter(Boolean) || [];
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const isFeatured = searchParams.get('isFeatured') === 'true';
  const isNewArrival = searchParams.get('isNewArrival') === 'true';
  const isBestSeller = searchParams.get('isBestSeller') === 'true';

  // Fetch categories once
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Fetch products whenever URL parameters change
  useEffect(() => {
    setLoading(true);
    const queryString = searchParams.toString();
    fetch(`/api/products?${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Update URL helper
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/catalog?${params.toString()}`);
  };

  const toggleAudience = (aud: string) => {
    let next: string[];
    if (currentAudience.includes(aud)) {
      next = currentAudience.filter((a) => a !== aud);
    } else {
      next = [...currentAudience, aud];
    }
    updateQuery({ audience: next.length > 0 ? next.join(',') : null });
  };

  const toggleFabric = (fab: string) => {
    let next: string[];
    if (currentFabric.includes(fab)) {
      next = currentFabric.filter((f) => f !== fab);
    } else {
      next = [...currentFabric, fab];
    }
    updateQuery({ fabricType: next.length > 0 ? next.join(',') : null });
  };

  const clearAllFilters = () => {
    router.push('/catalog');
  };

  const activeFiltersCount =
    currentAudience.length +
    currentFabric.length +
    (currentCategory ? 1 : 0) +
    (currentInStock ? 1 : 0) +
    (currentMinPrice ? 1 : 0) +
    (currentMaxPrice ? 1 : 0) +
    (currentSearch ? 1 : 0) +
    (isFeatured ? 1 : 0) +
    (isNewArrival ? 1 : 0) +
    (isBestSeller ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-crimson-700 dark:text-gold-400 font-semibold">
            Vasantham Group Handlooms & Fashion
          </span>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Collections'
              : currentSearch
              ? `Search Results for "${currentSearch}"`
              : 'Textile & Fashion Catalog'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Showing {products.length} exquisite heritage and contemporary pieces
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 hidden sm:inline">Sort By:</span>
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium text-xs focus:ring-1 focus:ring-crimson-600 focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs text-neutral-500 font-medium">Active Filters:</span>

          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-crimson-100 dark:bg-crimson-950/80 text-crimson-800 dark:text-gold-300 text-xs font-medium">
              Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button onClick={() => updateQuery({ category: null })} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentAudience.map((aud) => (
            <span
              key={aud}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium capitalize"
            >
              {aud}
              <button onClick={() => toggleAudience(aud)} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {currentFabric.map((fab) => (
            <span
              key={fab}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 dark:bg-neutral-800 text-gold-900 dark:text-gold-300 text-xs font-medium"
            >
              Fabric: {fab}
              <button onClick={() => toggleFabric(fab)} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {currentInStock && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              In Stock Only
              <button onClick={() => updateQuery({ inStock: null })} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium">
              Keyword: &quot;{currentSearch}&quot;
              <button onClick={() => updateQuery({ search: null })} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-crimson-700 dark:text-gold-400 font-semibold hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 h-fit sticky top-28">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-crimson-700 dark:text-gold-400" />
              Filter Collections
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-neutral-500 hover:text-crimson-700 dark:hover:text-gold-400"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2.5">
              Category
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => updateQuery({ category: null })}
                className={`block w-full text-left py-1 px-2 rounded-md transition ${
                  !currentCategory
                    ? 'bg-crimson-50 dark:bg-neutral-800 font-bold text-crimson-800 dark:text-gold-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-crimson-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => updateQuery({ category: c.slug })}
                  className={`block w-full text-left py-1 px-2 rounded-md transition ${
                    currentCategory === c.slug
                      ? 'bg-crimson-50 dark:bg-neutral-800 font-bold text-crimson-800 dark:text-gold-300'
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-crimson-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Audience Filter */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2.5">
              Audience / Section
            </h4>
            <div className="space-y-2 text-xs">
              {AUDIENCES.map((aud) => (
                <label
                  key={aud.id}
                  className="flex items-center gap-2.5 cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-neutral-900"
                >
                  <input
                    type="checkbox"
                    checked={currentAudience.includes(aud.id)}
                    onChange={() => toggleAudience(aud.id)}
                    className="rounded border-neutral-300 text-crimson-700 focus:ring-crimson-600 h-4 w-4"
                  />
                  <span>{aud.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fabric Type */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2.5">
              Fabric & Weave
            </h4>
            <div className="space-y-2 text-xs">
              {FABRICS.map((fab) => (
                <label
                  key={fab}
                  className="flex items-center gap-2.5 cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-neutral-900"
                >
                  <input
                    type="checkbox"
                    checked={currentFabric.includes(fab)}
                    onChange={() => toggleFabric(fab)}
                    className="rounded border-neutral-300 text-crimson-700 focus:ring-crimson-600 h-4 w-4"
                  />
                  <span>{fab}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateQuery({ inStock: e.target.checked ? 'true' : null })}
                className="rounded border-neutral-300 text-crimson-700 focus:ring-crimson-600 h-4 w-4"
              />
              <span className="font-semibold">In Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-neutral-200 dark:bg-neutral-800 rounded-xl aspect-[3/4] animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-crimson-50 dark:bg-neutral-800 text-crimson-700 dark:text-gold-400 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral-800 dark:text-neutral-200">
                No designs match your selected filters
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                Try clearing some filter criteria, broadening your price range, or searching for a different textile term.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-crimson-800 text-gold-300 rounded-lg text-xs font-semibold shadow hover:bg-crimson-900 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white dark:bg-neutral-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
                    Filters
                  </h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-1">
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                {/* Audience */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-500 mb-2">Audience</h4>
                  <div className="space-y-2 text-xs">
                    {AUDIENCES.map((aud) => (
                      <label key={aud.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={currentAudience.includes(aud.id)}
                          onChange={() => toggleAudience(aud.id)}
                          className="rounded text-crimson-700"
                        />
                        <span>{aud.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fabrics */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-500 mb-2">Fabrics</h4>
                  <div className="space-y-2 text-xs">
                    {FABRICS.map((fab) => (
                      <label key={fab} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={currentFabric.includes(fab)}
                          onChange={() => toggleFabric(fab)}
                          className="rounded text-crimson-700"
                        />
                        <span>{fab}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-2.5 bg-crimson-800 text-gold-300 text-xs font-semibold rounded-lg shadow"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs text-neutral-500"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-500">
          Loading Vasantham Catalog...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
