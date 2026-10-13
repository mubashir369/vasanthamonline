import React from 'react';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import ProductVariant from '@/lib/models/ProductVariant';
import Category from '@/lib/models/Category';
import StoreSettings from '@/lib/models/StoreSettings';
import ProductCard from '@/components/storefront/ProductCard';
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Tag,
} from 'lucide-react';

export const revalidate = 60; // ISR cache for 60 seconds

async function getHomeData() {
  await connectDB();

  const [settingsDoc, categories, products, variants] = await Promise.all([
    StoreSettings.findOne().lean(),
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).limit(6).lean(),
    Product.find().lean(),
    ProductVariant.find().lean(),
  ]);

  // Map variants to products
  const variantMap = new Map<string, any[]>();
  for (const v of variants) {
    const pid = v.productId.toString();
    if (!variantMap.has(pid)) variantMap.set(pid, []);
    variantMap.get(pid)!.push(v);
  }

  const enriched = products.map((prod) => {
    const pVars = variantMap.get(prod._id.toString()) || [];
    const minPriceVal = pVars.length > 0
      ? Math.min(...pVars.map((v) => v.salePrice || v.price))
      : 0;
    const maxPriceVal = pVars.length > 0
      ? Math.max(...pVars.map((v) => v.price))
      : 0;
    const totalStock = pVars.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

    return {
      ...prod,
      _id: prod._id.toString(),
      variants: pVars.map((v) => ({ ...v, _id: v._id.toString() })),
      primaryVariant: pVars[0] ? { ...pVars[0], _id: pVars[0]._id.toString() } : null,
      priceRange: { min: minPriceVal, max: maxPriceVal },
      totalStock,
    };
  });

  const featured = enriched.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivals = enriched.filter((p) => p.isNewArrival).slice(0, 4);
  const bestSellers = enriched.filter((p) => p.isBestSeller).slice(0, 4);

  return {
    settings: (settingsDoc as any) || {
      storeName: 'Vasantham Group',
      tagline: 'Where elegance is woven with tradition.',
      address: 'OPP. MY G Future, Main road Mannarkkad, PALAKKAD',
      aboutText:
        'Welcome to Vasantham Group — Malabar’s largest textile and fashion network, where tradition meets modern elegance. For generations, Vasantham has been a trusted name in the world of textiles in Palakkad.',
      heroBadge: 'Malabar’s Largest Textile & Fashion Network',
      heroTitle: 'Where Elegance Is\nWoven with Tradition',
      heroSubtitle:
        'From exquisite Kanchipuram wedding silks and authentic Kerala Kasavu handlooms to festive family attire — discover timeless Malabar craftsmanship perfected for modern celebrations.',
      heroPrimaryBtnText: 'Explore Silk Sarees',
      heroPrimaryBtnLink: '/catalog?category=silk-sarees',
      heroSecondaryBtnText: 'View All Collections',
      heroSecondaryBtnLink: '/catalog',
      heroImage:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      heroHighlightTag: 'Heritage Highlight',
      heroHighlightTitle: 'Kanchipuram Royal Crimson Silk',
      heroHighlightSubtitle: 'Pure zari border • Traditional temple weave',
      heroOfferTag: 'Festival Offer',
      heroOfferTitle: '10% OFF',
      heroOfferSubtitle: 'Code: VASANTHAM10',
      showHeroOffer: true,
      promoBannerTag: 'Mannarkkad Flagship Store',
      promoBannerTitle: 'Shop Online & Pick Up in Store with Zero Fees',
      promoBannerSubtitle:
        'Order your favorite sarees and festive wear from the comfort of your home and collect them anytime at our store',
      promoBannerBtnText: 'Start Shopping',
      promoBannerBtnLink: '/catalog',
      promoBannerSecondaryBtnText: 'Store Location & Hours',
      promoBannerSecondaryBtnLink: '/contact',
    },
    categories: categories.map((c) => ({ ...c, _id: c._id.toString() })),
    featured,
    newArrivals,
    bestSellers,
  };
}

export default async function HomePage() {
  const { settings, categories, featured, newArrivals, bestSellers } = await getHomeData();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-crimson-950 via-crimson-900 to-neutral-950 text-white py-16 sm:py-24 lg:py-32 border-b border-gold-500/30">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crimson-800/80 border border-gold-400/40 text-gold-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>{settings.heroBadge || 'Malabar’s Largest Textile & Fashion Network'}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                {settings.heroTitle ? (
                  settings.heroTitle.includes('\n') ? (
                    <>
                      {settings.heroTitle.split('\n')[0]} <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-200">
                        {settings.heroTitle.split('\n').slice(1).join(' ')}
                      </span>
                    </>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-200">
                      {settings.heroTitle}
                    </span>
                  )
                ) : (
                  <>
                    Where Elegance Is <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-200">
                      Woven with Tradition
                    </span>
                  </>
                )}
              </h1>

              <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {settings.heroSubtitle ||
                  'From exquisite Kanchipuram wedding silks and authentic Kerala Kasavu handlooms to festive family attire — discover timeless Malabar craftsmanship perfected for modern celebrations.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href={settings.heroPrimaryBtnLink || '/catalog?category=silk-sarees'}
                  className="px-7 py-3.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-neutral-950 font-bold text-sm shadow-lg hover:shadow-gold-500/20 flex items-center gap-2 transition duration-300"
                >
                  {settings.heroPrimaryBtnText || 'Explore Silk Sarees'} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={settings.heroSecondaryBtnLink || '/catalog'}
                  className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-gold-400/30 text-gold-200 text-sm font-semibold backdrop-blur transition duration-300"
                >
                  {settings.heroSecondaryBtnText || 'View All Collections'}
                </Link>
              </div>

              {/* Trust Callouts */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs text-neutral-300">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Store className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span>Mannarkkad Store Pickup</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span>100% Genuine Handlooms</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start col-span-2 sm:col-span-1">
                  <Truck className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span>Doorstep Kerala Courier</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-400/40 relative">
                  <img
                    src={
                      settings.heroImage ||
                      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
                    }
                    alt={settings.heroHighlightTitle || 'Royal Crimson Kanchipuram Silk Saree'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-crimson-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-gold-500/30">
                    <span className="text-gold-400 text-xs font-semibold uppercase tracking-wider">
                      {settings.heroHighlightTag || 'Heritage Highlight'}
                    </span>
                    <h3 className="font-serif text-white font-bold text-base mt-1">
                      {settings.heroHighlightTitle || 'Kanchipuram Royal Crimson Silk'}
                    </h3>
                    <p className="text-neutral-300 text-xs mt-0.5">
                      {settings.heroHighlightSubtitle || 'Pure zari border • Traditional temple weave'}
                    </p>
                  </div>
                </div>

                {/* Floating Discount Tag */}
                {settings.showHeroOffer !== false && (
                  <div className="absolute -top-4 -right-4 p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl text-neutral-950 font-bold shadow-xl border border-gold-300 text-center animate-bounce">
                    <span className="text-[10px] uppercase block tracking-wider font-extrabold">
                      {settings.heroOfferTag || 'Festival Offer'}
                    </span>
                    <span className="text-lg font-serif">
                      {settings.heroOfferTitle || '10% OFF'}
                    </span>
                    <span className="text-[9px] block text-neutral-800">
                      {settings.heroOfferSubtitle || 'Code: VASANTHAM10'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
            Curated Traditions
          </span>
          <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Shop by Collection
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
            Explore authentic handlooms, festive wedding silks, and everyday comfort woven with Kerala heritage.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/catalog?category=${category.slug}`}
              className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <img
                src={category.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-x-3 bottom-3 text-center">
                <h3 className="font-serif font-bold text-sm text-gold-300 group-hover:text-gold-200 transition-colors">
                  {category.name}
                </h3>
                <span className="text-[10px] text-neutral-300 uppercase tracking-wider block mt-0.5">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
                Signature Weaves
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Featured Collections
              </h2>
            </div>
            <Link
              href="/catalog?isFeatured=true"
              className="text-xs font-semibold text-crimson-800 dark:text-gold-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Store Pickup & Free Delivery Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-crimson-900 via-crimson-800 to-crimson-950 border border-gold-400/40 shadow-xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/50 text-gold-300 text-xs font-bold uppercase">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>{settings.promoBannerTag || 'Mannarkkad Flagship Store'}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              {settings.promoBannerTitle || 'Shop Online & Pick Up in Store with Zero Fees'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
              {settings.promoBannerSubtitle ||
                'Order your favorite sarees and festive wear from the comfort of your home and collect them anytime at our store'}:{' '}
              <strong>{settings.address}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href={settings.promoBannerBtnLink || '/catalog'}
              className="px-6 py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md transition text-center"
            >
              {settings.promoBannerBtnText || 'Start Shopping'}
            </Link>
            <Link
              href={settings.promoBannerSecondaryBtnLink || '/contact'}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium text-xs text-center transition"
            >
              {settings.promoBannerSecondaryBtnText || 'Store Location & Hours'}
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
                Fresh Off The Loom
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/catalog?isNewArrival=true"
              className="text-xs font-semibold text-crimson-800 dark:text-gold-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
                Most Loved by Malabar
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/catalog?isBestSeller=true"
              className="text-xs font-semibold text-crimson-800 dark:text-gold-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Brand Story Snippet Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 py-8 border-t border-neutral-200 dark:border-neutral-800">
        <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
          Our Heritage
        </span>
        <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          The Vasantham Story
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed italic max-w-3xl mx-auto">
          &ldquo;{settings.aboutText}&rdquo;
        </p>
        <div className="pt-2">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-crimson-700 dark:border-gold-400 text-crimson-800 dark:text-gold-400 text-xs font-semibold hover:bg-crimson-50 dark:hover:bg-neutral-800 transition"
          >
            Discover More About Us <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
