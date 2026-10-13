'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useWishlist } from '@/lib/context/WishlistContext';
import { useCart } from '@/lib/context/CartContext';
import { Heart, Star, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    fabricType?: string;
    images?: string[];
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    ratingsAverage?: number;
    ratingsQuantity?: number;
    priceRange?: { min: number; max: number };
    primaryVariant?: any;
    variants?: any[];
    totalStock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const primaryVariant = product.primaryVariant || product.variants?.[0];
  const image =
    primaryVariant?.images?.[0] ||
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  const price = primaryVariant?.price || product.priceRange?.max || 0;
  const salePrice = primaryVariant?.salePrice || product.priceRange?.min || price;
  const hasDiscount = salePrice < price;
  const discountPercent =
    primaryVariant?.discountPercent ||
    (hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0);

  const isFavorite = isInWishlist(product._id);
  const isOutOfStock =
    product.totalStock !== undefined
      ? product.totalStock <= 0
      : primaryVariant
      ? primaryVariant.stockQuantity <= 0
      : false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!primaryVariant || isOutOfStock) return;

    addToCart({
      variantId: primaryVariant._id,
      productId: product._id,
      title: product.title,
      sku: primaryVariant.sku,
      color: primaryVariant.color,
      size: primaryVariant.size,
      price: primaryVariant.salePrice || primaryVariant.price,
      image,
      quantity: 1,
      maxStock: primaryVariant.stockQuantity,
      slug: product.slug,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      price: salePrice,
      image,
      category: product.fabricType,
    });
  };

  return (
    <div className="group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 hover:border-gold-400/60 dark:hover:border-gold-500/60 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-crimson-800 text-gold-300 rounded shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-neutral-950 rounded shadow-sm">
              New Arrival
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white rounded shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition shadow-md z-10 ${
            isFavorite
              ? 'bg-crimson-800 text-white'
              : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:text-crimson-700 hover:bg-white'
          }`}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add To Bag overlay on hover */}
        {!isOutOfStock && primaryVariant && (
          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block">
            <button
              onClick={handleQuickAdd}
              type="button"
              className="w-full py-2 px-3 bg-neutral-950/90 hover:bg-crimson-800 text-gold-300 text-xs font-semibold rounded-lg shadow-lg backdrop-blur flex items-center justify-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Quick Add to Bag
            </button>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Fabric Type & Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="font-medium text-crimson-700 dark:text-gold-400">
              {product.fabricType || 'Heritage Weave'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-gold-500 fill-current" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {product.ratingsAverage ? product.ratingsAverage.toFixed(1) : '4.8'}
              </span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif font-semibold text-sm text-neutral-900 dark:text-neutral-100 hover:text-crimson-800 dark:hover:text-gold-400 line-clamp-2 transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-900 dark:text-gold-300 font-serif">
              {formatPrice(salePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          {primaryVariant && (
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {primaryVariant.size}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
