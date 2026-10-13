'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  MapPin,
  Store,
  Truck,
  Sparkles,
  Upload,
  Loader2,
  Image as ImageIcon,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { convertToWebP } from '@/lib/imageUtils';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Vasantham Group',
    tagline: 'Where elegance is woven with tradition.',
    address: 'OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582',
    contactPhone: '+91 94471 23456',
    contactEmail: 'info@vasanthamgroup.com',
    logoUrl: '',
    primaryColor: '#7E121D',
    secondaryColor: '#D4AF37',
    aboutText: '',
    freeDeliveryMinAmount: 1999,
    baseCourierCharge: 80,
    freeDeliveryRadiusKm: 15,

    // Homepage Hero & Promo Content
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
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHero(true);
    setError('');

    try {
      const file = files[0];
      const webpFile = await convertToWebP(file);
      const formData = new FormData();
      formData.append('file', webpFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && (data.url || data.urls?.[0])) {
        const uploadedUrl = data.url || data.urls[0];
        handleChange('heroImage', uploadedUrl);
      } else {
        setError(data.error || 'Failed to upload hero image');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading hero image');
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Store settings saved successfully! Homepage and store configurations are live.');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs font-mono">Loading store settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-crimson-700 dark:text-gold-400" />
            Dynamic Store & Homepage Configuration
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Super Admin controls for brand identity, homepage hero, buttons, offers, image uploads, and delivery rules
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-2 self-start sm:self-auto disabled:opacity-50 transition"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Live Settings'}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 rounded-xl text-xs shadow-sm">
          {error}
        </div>
      )}

      {/* 1. HOMEPAGE HERO SECTION (Content, Buttons, Image, Offer) */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5 text-xs">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <Sparkles className="w-4 h-4 text-gold-500" />
          <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
            Homepage Hero Section (Headlines, Media & Buttons)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Hero Top Badge Text</label>
            <input
              type="text"
              value={settings.heroBadge || ''}
              onChange={(e) => handleChange('heroBadge', e.target.value)}
              placeholder="e.g. Malabar’s Largest Textile & Fashion Network"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">
              Hero Main Heading (Multi-line supported)
            </label>
            <textarea
              rows={2}
              value={settings.heroTitle || ''}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              placeholder="Where Elegance Is&#10;Woven with Tradition"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-serif font-bold text-sm"
            />
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Tip: The second line automatically renders in shimmering gold gradient styling!
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Hero Subtitle / Description Text</label>
            <textarea
              rows={3}
              value={settings.heroSubtitle || ''}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              placeholder="From exquisite Kanchipuram wedding silks and authentic Kerala Kasavu handlooms..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 leading-relaxed"
            />
          </div>
        </div>

        {/* Hero Image with Cloudinary / WebP uploader */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block font-semibold text-neutral-800 dark:text-neutral-200">
                Hero Showcase Image (WebP Auto-Conversion & Cloudinary)
              </label>
              <p className="text-[11px] text-neutral-500">
                Upload a portrait/banner photo or paste an external image URL.
              </p>
            </div>

            <label className="px-3.5 py-1.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition self-start sm:self-auto">
              {uploadingHero ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  <span>Converting & Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-gold-400" />
                  <span>+ Upload Hero Image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploadingHero}
                onChange={handleHeroImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
            {settings.heroImage && (
              <div className="w-24 h-32 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-100 flex-shrink-0 shadow-sm relative group">
                <img
                  src={settings.heroImage}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 w-full space-y-1">
              <input
                type="text"
                value={settings.heroImage || ''}
                onChange={(e) => handleChange('heroImage', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono"
              />
              <span className="text-[10px] text-neutral-400">
                Direct Image URL (Cloudinary or Unsplash)
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image Overlay Card Details */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3">
          <label className="block font-semibold text-neutral-800 dark:text-neutral-200">
            Hero Image Overlay Card (Bottom Highlight)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Highlight Tag</label>
              <input
                type="text"
                value={settings.heroHighlightTag || ''}
                onChange={(e) => handleChange('heroHighlightTag', e.target.value)}
                placeholder="e.g. Heritage Highlight"
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Highlight Title</label>
              <input
                type="text"
                value={settings.heroHighlightTitle || ''}
                onChange={(e) => handleChange('heroHighlightTitle', e.target.value)}
                placeholder="e.g. Kanchipuram Royal Crimson Silk"
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Highlight Subtitle</label>
              <input
                type="text"
                value={settings.heroHighlightSubtitle || ''}
                onChange={(e) => handleChange('heroHighlightSubtitle', e.target.value)}
                placeholder="e.g. Pure zari border • Traditional temple weave"
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        </div>

        {/* Hero Action Buttons */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3">
          <label className="block font-semibold text-neutral-800 dark:text-neutral-200">
            Hero Action Buttons & Links
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl space-y-2 border border-neutral-200 dark:border-neutral-700">
              <span className="font-bold text-[11px] text-neutral-700 dark:text-neutral-300 block">
                Primary Button (Gold Highlighted)
              </span>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-0.5">Button Label</label>
                <input
                  type="text"
                  value={settings.heroPrimaryBtnText || ''}
                  onChange={(e) => handleChange('heroPrimaryBtnText', e.target.value)}
                  placeholder="Explore Silk Sarees"
                  className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-0.5">Destination URL / Route</label>
                <input
                  type="text"
                  value={settings.heroPrimaryBtnLink || ''}
                  onChange={(e) => handleChange('heroPrimaryBtnLink', e.target.value)}
                  placeholder="/catalog?category=silk-sarees"
                  className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl space-y-2 border border-neutral-200 dark:border-neutral-700">
              <span className="font-bold text-[11px] text-neutral-700 dark:text-neutral-300 block">
                Secondary Button (Glass / Outline)
              </span>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-0.5">Button Label</label>
                <input
                  type="text"
                  value={settings.heroSecondaryBtnText || ''}
                  onChange={(e) => handleChange('heroSecondaryBtnText', e.target.value)}
                  placeholder="View All Collections"
                  className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-0.5">Destination URL / Route</label>
                <input
                  type="text"
                  value={settings.heroSecondaryBtnLink || ''}
                  onChange={(e) => handleChange('heroSecondaryBtnLink', e.target.value)}
                  placeholder="/catalog"
                  className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Festival Offer Badge */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-neutral-800 dark:text-neutral-200">
              Floating Festival Offer Badge (Over Hero Card)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={settings.showHeroOffer !== false}
                onChange={(e) => handleChange('showHeroOffer', e.target.checked)}
                className="rounded text-crimson-700"
              />
              <span>Display on Homepage</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Badge Tag / Occasion</label>
              <input
                type="text"
                value={settings.heroOfferTag || ''}
                onChange={(e) => handleChange('heroOfferTag', e.target.value)}
                placeholder="Festival Offer"
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Offer Title / Discount</label>
              <input
                type="text"
                value={settings.heroOfferTitle || ''}
                onChange={(e) => handleChange('heroOfferTitle', e.target.value)}
                placeholder="10% OFF"
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-serif font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Coupon Code / Details</label>
              <input
                type="text"
                value={settings.heroOfferSubtitle || ''}
                onChange={(e) => handleChange('heroOfferSubtitle', e.target.value)}
                placeholder="Code: VASANTHAM10"
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. HOMEPAGE PROMOTIONAL BANNER */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
        <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
          Homepage Mid-Banner (Store Pickup & Free Delivery Promo)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Banner Tag</label>
            <input
              type="text"
              value={settings.promoBannerTag || ''}
              onChange={(e) => handleChange('promoBannerTag', e.target.value)}
              placeholder="Mannarkkad Flagship Store"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Banner Heading</label>
            <input
              type="text"
              value={settings.promoBannerTitle || ''}
              onChange={(e) => handleChange('promoBannerTitle', e.target.value)}
              placeholder="Shop Online & Pick Up in Store with Zero Fees"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-serif font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Banner Subtitle / Description</label>
            <textarea
              rows={2}
              value={settings.promoBannerSubtitle || ''}
              onChange={(e) => handleChange('promoBannerSubtitle', e.target.value)}
              placeholder="Order your favorite sarees and festive wear from the comfort of your home..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Button 1 Label</label>
            <input
              type="text"
              value={settings.promoBannerBtnText || ''}
              onChange={(e) => handleChange('promoBannerBtnText', e.target.value)}
              placeholder="Start Shopping"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Button 1 Link URL</label>
            <input
              type="text"
              value={settings.promoBannerBtnLink || ''}
              onChange={(e) => handleChange('promoBannerBtnLink', e.target.value)}
              placeholder="/catalog"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Button 2 Label</label>
            <input
              type="text"
              value={settings.promoBannerSecondaryBtnText || ''}
              onChange={(e) => handleChange('promoBannerSecondaryBtnText', e.target.value)}
              placeholder="Store Location & Hours"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Button 2 Link URL</label>
            <input
              type="text"
              value={settings.promoBannerSecondaryBtnLink || ''}
              onChange={(e) => handleChange('promoBannerSecondaryBtnLink', e.target.value)}
              placeholder="/contact"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* 3. BRAND IDENTITY & STORY */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
        <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
          Brand Defaults & Story
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={settings.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-serif font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Brand Tagline *</label>
            <input
              type="text"
              required
              value={settings.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 italic"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Brand Narrative / About Us Page Copy
          </label>
          <textarea
            rows={5}
            value={settings.aboutText}
            onChange={(e) => handleChange('aboutText', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Custom Logo URL (Leave blank to use default Heritage Gold & Crimson Emblem)
          </label>
          <input
            type="text"
            value={settings.logoUrl || ''}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block font-semibold mb-1">Primary Color (Crimson)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primaryColor || '#7E121D'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-9 h-9 rounded border border-neutral-300 cursor-pointer"
              />
              <span className="font-mono">{settings.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Secondary Color (Gold)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.secondaryColor || '#D4AF37'}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-9 h-9 rounded border border-neutral-300 cursor-pointer"
              />
              <span className="font-mono">{settings.secondaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STORE LOCATION & CONTACT */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
        <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
          Flagship Store & Physical Location
        </h2>

        <div>
          <label className="block font-semibold mb-1">Physical Store Address *</label>
          <input
            type="text"
            required
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Contact Phone *</label>
            <input
              type="text"
              required
              value={settings.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Contact Email *</label>
            <input
              type="email"
              required
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>
      </div>

      {/* 5. DELIVERY & COURIER RULES */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
        <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
          Delivery Charges & Free Shipping Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Free Delivery Minimum Cart Value (₹)</label>
            <input
              type="number"
              min={0}
              value={settings.freeDeliveryMinAmount}
              onChange={(e) => handleChange('freeDeliveryMinAmount', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold"
            />
            <span className="text-[10px] text-neutral-400">
              Orders above this value receive free delivery anywhere in Kerala.
            </span>
          </div>

          <div>
            <label className="block font-semibold mb-1">Base Courier Charge (₹)</label>
            <input
              type="number"
              min={0}
              value={settings.baseCourierCharge}
              onChange={(e) => handleChange('baseCourierCharge', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold"
            />
            <span className="text-[10px] text-neutral-400">
              Applied to courier deliveries under the free threshold. Store Pickup is always ₹0.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
