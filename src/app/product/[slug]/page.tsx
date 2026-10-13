'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import ProductCard from '@/components/storefront/ProductCard';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Heart,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Share2,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review submission state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          const prod = data.product;
          setProduct(prod);
          setReviews(prod.reviews || []);
          setRelatedProducts(data.relatedProducts || []);

          // Default selected variant & image
          if (prod.variants && prod.variants.length > 0) {
            const firstVariant = prod.variants[0];
            setSelectedVariant(firstVariant);
            const initialImg =
              firstVariant.images?.[0] ||
              prod.images?.[0] ||
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80';
            setSelectedImage(initialImg);
          } else {
            const initialImg =
              prod.images?.[0] ||
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80';
            setSelectedImage(initialImg);
          }
        } else {
          setError(data.error || 'Product not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSelectVariant = (v: any) => {
    setSelectedVariant(v);
    if (v.images && v.images.length > 0) {
      setSelectedImage(v.images[0]);
    } else if (product?.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-crimson-800 border-t-gold-400 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-neutral-500 font-serif">Loading craftsmanship details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          Design Not Found
        </h2>
        <p className="text-neutral-500 text-sm">{error || 'The requested product is no longer available.'}</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-crimson-800 text-gold-300 rounded-lg text-xs font-semibold"
        >
          Back to Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? selectedVariant.salePrice || selectedVariant.price
    : product.priceRange?.min || 0;
  const originalPrice = selectedVariant?.price || currentPrice;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent =
    selectedVariant?.discountPercent ||
    (hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  const stock = selectedVariant ? selectedVariant.stockQuantity : 0;
  const isOutOfStock = stock <= 0;
  const isFavorite = isInWishlist(product._id);

  // Active gallery images - priority to selected variant's images
  const activeImages =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images && product.images.length > 0
      ? product.images
      : [selectedImage];

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    const result = addToCart({
      variantId: selectedVariant._id,
      productId: product._id,
      title: product.title,
      sku: selectedVariant.sku,
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: currentPrice,
      image: selectedImage,
      quantity,
      maxStock: stock,
      slug: product.slug,
    });

    if (result.success) {
      setIsCartOpen(true);
    } else {
      alert(result.message);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          userName: reviewName.trim() || 'Verified Customer',
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setReviewComment('');
        setReviewSuccess('Thank you! Your review has been submitted.');
        setTimeout(() => setReviewSuccess(''), 5000);
      }
    } catch {
      // ignore
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
        <Link href="/" className="hover:text-crimson-800 dark:hover:text-gold-400">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-crimson-800 dark:hover:text-gold-400">Catalog</Link>
        {product.categories?.[0] && (
          <>
            <span>/</span>
            <Link
              href={`/catalog?category=${product.categories[0].slug}`}
              className="hover:text-crimson-800 dark:hover:text-gold-400"
            >
              {product.categories[0].name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() =>
                toggleWishlist({
                  productId: product._id,
                  title: product.title,
                  slug: product.slug,
                  price: currentPrice,
                  image: selectedImage,
                  category: product.fabricType,
                })
              }
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition ${
                isFavorite
                  ? 'bg-crimson-800 text-white'
                  : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 hover:text-crimson-700'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {activeImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {activeImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                    selectedImage === img
                      ? 'border-crimson-700 dark:border-gold-400 ring-2 ring-crimson-700/20'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-crimson-700 dark:text-gold-400 uppercase tracking-wider">
                {product.fabricType} Handloom
              </span>
              <span className="font-mono text-neutral-400">Design #{product.designNumber || 'VSM-01'}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              {product.title}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-gold-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {product.ratingsAverage ? product.ratingsAverage.toFixed(1) : '4.8'}
              </span>
              <span className="text-neutral-400">
                ({reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-extrabold text-neutral-950 dark:text-gold-300 font-serif">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-neutral-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-xs text-neutral-500">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Variant Selection: Size & Color */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
              {/* Color picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                  Select Color / Pattern: <span className="font-normal text-crimson-700 dark:text-gold-400">{selectedVariant?.color}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => handleSelectVariant(v)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
                        selectedVariant?._id === v._id
                          ? 'border-crimson-700 dark:border-gold-400 bg-crimson-50 dark:bg-neutral-800 text-crimson-900 dark:text-gold-300 shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: v.colorHex || '#800020' }}
                      />
                      <span>{v.color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                  Size / Length: <span className="font-normal text-crimson-700 dark:text-gold-400">{selectedVariant?.size}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={`size-${v._id}`}
                      type="button"
                      onClick={() => handleSelectVariant(v)}
                      className={`px-4 py-2 rounded-lg border text-xs font-bold transition ${
                        selectedVariant?._id === v._id
                          ? 'bg-neutral-900 dark:bg-gold-500 text-white dark:text-neutral-950 border-neutral-900 dark:border-gold-500'
                          : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Inventory Status */}
              <div className="flex items-center justify-between text-xs pt-2">
                <div className="flex items-center gap-2">
                  {isOutOfStock ? (
                    <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                      <AlertCircle className="w-4 h-4" /> Out of stock for this variant
                    </span>
                  ) : stock <= 5 ? (
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <AlertCircle className="w-4 h-4" /> Only {stock} pieces left in stock!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> In Stock ({stock} available)
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-neutral-400 font-mono">
                  SKU: {selectedVariant?.sku} | Barcode: {selectedVariant?.barcode}
                </div>
              </div>
            </div>
          )}

          {/* Quantity and Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Quantity:</span>
              <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock}
                  className="px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="py-3.5 px-4 rounded-xl border-2 border-crimson-800 dark:border-gold-400 text-crimson-800 dark:text-gold-300 hover:bg-crimson-50 dark:hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-crimson-950 text-gold-300 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Guarantees */}
          <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-start gap-2.5">
              <Store className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Store Pickup Available:</strong> Collect for FREE at our Mannarkkad, Palakkad store (OPP. MY G Future, Main Road).
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Malabar Delivery:</strong> Free courier on orders above ₹1,999. Fast delivery across Kerala.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Authenticity Guarantee:</strong> 100% genuine silk zari and handloom certified.
              </span>
            </div>
          </div>

          {/* Fabric Care & Description */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-1.5">
                Product Narrative
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.fabricCare && (
              <div>
                <h4 className="font-serif font-bold text-xs text-neutral-900 dark:text-neutral-100 mb-1">
                  Fabric Care Instructions
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                  {product.fabricCare}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Authentic feedback from Vasantham patrons across Kerala
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Review Submission Form */}
          <div className="lg:col-span-5 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              Write a Review
            </h3>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg font-medium">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Anjali M."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                  <option value={2}>⭐⭐ (2 Stars - Below Average)</option>
                  <option value={1}>⭐ (1 Star - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Your Feedback</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about the fabric texture, zari weave, fit, or delivery experience..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-neutral-900 dark:bg-gold-500 hover:bg-neutral-800 text-white dark:text-neutral-950 font-bold rounded-lg transition text-xs"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">
                Be the first to review this heritage piece!
              </p>
            ) : (
              reviews.map((rev: any) => (
                <div
                  key={rev._id}
                  className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-crimson-800 text-gold-300 flex items-center justify-center font-bold text-xs uppercase">
                        {rev.userName.charAt(0)}
                      </div>
                      <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                        {rev.userName}
                      </span>
                    </div>
                    <div className="flex text-gold-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {rev.comment}
                  </p>
                  <span className="text-[10px] text-neutral-400 block">
                    Verified Customer • {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-neutral-200 dark:border-neutral-800 pt-12 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
                You May Also Like
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Related Weaves & Designs
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-semibold text-crimson-800 dark:text-gold-400 hover:underline"
            >
              Explore All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
