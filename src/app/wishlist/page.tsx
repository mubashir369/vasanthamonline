'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/context/WishlistContext';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-crimson-50 dark:bg-neutral-800 text-crimson-700 dark:text-gold-400 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Your Wishlist is Empty
        </h1>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">
          Save your favorite silk sarees, traditional Kasavu weaves, and festive collections to review later.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-crimson-800 text-gold-300 text-xs font-semibold rounded-lg shadow hover:bg-crimson-900 transition"
        >
          Explore Collections <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          My Saved Wishlist ({items.length})
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Handcrafted heritage favorites curated by you
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <Link href={`/product/${item.slug}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-neutral-900/80 text-neutral-500 hover:text-red-600 transition"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-1">
                {item.category && (
                  <span className="text-[10px] uppercase font-bold text-crimson-700 dark:text-gold-400">
                    {item.category}
                  </span>
                )}
                <Link href={`/product/${item.slug}`} className="block">
                  <h3 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1 hover:text-crimson-700">
                    {item.title}
                  </h3>
                </Link>
                <div className="text-sm font-bold text-neutral-900 dark:text-gold-300 font-serif pt-1">
                  {formatPrice(item.price)}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                href={`/product/${item.slug}`}
                className="w-full py-2 px-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-crimson-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> View & Select Options
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
