'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { convertToWebP } from '@/lib/imageUtils';

interface ProductEditorFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductEditorForm({ initialData, isEdit }: ProductEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [designNumber, setDesignNumber] = useState(initialData?.designNumber || '');
  const [styleNumber, setStyleNumber] = useState(initialData?.styleNumber || '');
  const [audience, setAudience] = useState(initialData?.audience || 'women');
  const [fabricType, setFabricType] = useState(initialData?.fabricType || 'Silk');
  const [fabricCare, setFabricCare] = useState(
    initialData?.fabricCare ||
      'Dry clean recommended for pure silk and zari handlooms. Store in muslin cloth.'
  );
  const [productImages, setProductImages] = useState<string[]>(initialData?.images || []);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);

  const [isFeatured, setIsFeatured] = useState(!!initialData?.isFeatured);
  const [isNewArrival, setIsNewArrival] = useState(!!initialData?.isNewArrival);
  const [isBestSeller, setIsBestSeller] = useState(!!initialData?.isBestSeller);
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.categories?.[0]?._id || initialData?.categories?.[0] || ''
  );

  const [categories, setCategories] = useState<any[]>([]);

  // Variants state - ensure images array is initialized
  const [variants, setVariants] = useState<any[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants.map((v: any) => ({
          ...v,
          images: v.images || [],
        }))
      : [
          {
            sku: 'VSM-NEW-01',
            barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            color: 'Heritage Gold',
            colorHex: '#D4AF37',
            size: 'Free Size',
            price: 2999,
            salePrice: 2499,
            stockQuantity: 15,
            images: [],
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || []);
          if (!selectedCategory && data.categories.length > 0) {
            setSelectedCategory(data.categories[0]._id);
          }
        }
      })
      .catch(() => {});
  }, [selectedCategory]);

  // Main product image upload handler (converts to WebP then uploads)
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMain(true);
    setError('');

    try {
      const formData = new FormData();

      // Convert all selected files to WebP format before uploading
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const webpFile = await convertToWebP(file);
        formData.append('files', webpFile);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.urls) {
        setProductImages((prev) => [...prev, ...data.urls]);
      } else {
        setError(data.error || 'Failed to upload images');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading images');
    } finally {
      setUploadingMain(false);
      e.target.value = '';
    }
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl.trim()) return;
    setProductImages((prev) => [...prev, manualImageUrl.trim()]);
    setManualImageUrl('');
  };

  const handleRemoveMainImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant image upload handler (converts to WebP then uploads)
  const handleVariantImageUpload = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVariantIndex(variantIndex);
    setError('');

    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const webpFile = await convertToWebP(file);
        formData.append('files', webpFile);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.urls) {
        setVariants((prev) => {
          const updated = [...prev];
          const currentImages = updated[variantIndex].images || [];
          updated[variantIndex] = {
            ...updated[variantIndex],
            images: [...currentImages, ...data.urls],
          };
          return updated;
        });
      } else {
        setError(data.error || 'Failed to upload variant images');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading variant images');
    } finally {
      setUploadingVariantIndex(null);
      e.target.value = '';
    }
  };

  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      const currentImages = updated[variantIndex].images || [];
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: currentImages.filter((_: any, i: number) => i !== imageIndex),
      };
      return updated;
    });
  };

  const handleAddVariant = () => {
    const nextNum = variants.length + 1;
    setVariants([
      ...variants,
      {
        sku: `VSM-VAR-0${nextNum}`,
        barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        color: 'Off-White',
        colorHex: '#FDFBF7',
        size: 'Standard',
        price: 2999,
        salePrice: 2499,
        stockQuantity: 10,
        images: [],
      },
    ]);
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('A product must have at least one variant.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and description.');
      return;
    }

    if (variants.length === 0) {
      setError('At least one inventory variant is required.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      designNumber: designNumber.trim(),
      styleNumber: styleNumber.trim(),
      audience,
      fabricType,
      fabricCare: fabricCare.trim(),
      images: productImages,
      categories: selectedCategory ? [selectedCategory] : [],
      isFeatured,
      isNewArrival,
      isBestSeller,
      variants,
    };

    try {
      const url = isEdit
        ? `/api/products/${initialData.slug || initialData._id}`
        : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        router.push('/admin/products');
      } else {
        setError(resData.error || 'Failed to save product');
        setSaving(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEdit ? `Edit: ${initialData.title}` : 'Add New Textile Design'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Main Details */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
        <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
          Design Identity
        </h2>

        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Product Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Kanchipuram Royal Crimson Pure Silk Saree"
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Design / Pattern #
            </label>
            <input
              type="text"
              value={designNumber}
              onChange={(e) => setDesignNumber(e.target.value)}
              placeholder="e.g. VSM-KNC-0104"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Style Number
            </label>
            <input
              type="text"
              value={styleNumber}
              onChange={(e) => setStyleNumber(e.target.value)}
              placeholder="e.g. STY-SLK-402"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Primary Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Audience / Section *
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 capitalize"
            >
              <option value="women">Women</option>
              <option value="ladies">Ladies</option>
              <option value="men">Men</option>
              <option value="gents">Gents</option>
              <option value="girls">Girls</option>
              <option value="boys">Boys</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Fabric & Weave Type
            </label>
            <select
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
            >
              <option value="Silk">Pure Silk</option>
              <option value="Cotton">Handloom Cotton</option>
              <option value="Ethnic">Ethnic / Kasavu</option>
              <option value="Designer">Designer Bridal</option>
              <option value="Linen">Pure Linen</option>
              <option value="Georgette">Georgette</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Product Narrative / Description *
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Fabric Care Instructions
          </label>
          <input
            type="text"
            value={fabricCare}
            onChange={(e) => setFabricCare(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Main Product Images with Cloudinary WebP Upload */}
        <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                Main Product Images (Auto-converted to WebP & Cloudinary)
              </label>
              <p className="text-[11px] text-neutral-500">
                Upload multiple images. Images are automatically converted to optimized WebP format before uploading.
              </p>
            </div>

            <label className="px-3 py-1.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition">
              {uploadingMain ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  <span>Converting & Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-gold-400" />
                  <span>+ Upload Images</span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={uploadingMain}
                onChange={handleMainImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Thumbnails Preview Grid */}
          {productImages.length > 0 && (
            <div className="flex flex-wrap gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700">
              {productImages.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group w-20 h-24 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600 bg-neutral-100 flex-shrink-0"
                >
                  <img src={url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMainImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-80 hover:opacity-100 transition shadow"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 inset-x-1 bg-black/75 text-gold-300 text-[9px] font-bold text-center py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fallback / Manual Image URL input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              placeholder="Or paste image URL directly (https://...)"
              className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs"
            />
            <button
              type="button"
              onClick={handleAddManualImage}
              className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg font-semibold hover:bg-neutral-300 transition"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Visibility Badges */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded text-crimson-700"
            />
            <span className="font-semibold">Featured on Homepage</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="rounded text-crimson-700"
            />
            <span className="font-semibold">Mark as New Arrival</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="rounded text-crimson-700"
            />
            <span className="font-semibold">Mark as Best Seller</span>
          </label>
        </div>
      </div>

      {/* Multi-Variants Table with Dedicated Variant Images */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              Product Variants & Live Stock Inventory ({variants.length})
            </h2>
            <p className="text-[11px] text-neutral-500">
              Each variant tracks independent SKU, barcode, size, color, pricing, stock, and multiple dedicated photos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddVariant}
            className="px-3 py-1.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Variant
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/30 space-y-3"
            >
              {/* Row 1: SKU, Barcode, Color, Size, Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Barcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={v.barcode}
                    onChange={(e) => handleVariantChange(idx, 'barcode', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Color Name
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={v.colorHex || '#800020'}
                      onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)}
                      className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                      placeholder="e.g. Royal Red"
                      className="flex-1 px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Size / Length
                  </label>
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                    placeholder="e.g. 6.25m / M / XL"
                    className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={v.salePrice || ''}
                    onChange={(e) =>
                      handleVariantChange(idx, 'salePrice', e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Optional"
                    className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Stock Units *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={v.stockQuantity}
                      onChange={(e) => handleVariantChange(idx, 'stockQuantity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono font-bold text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-2 text-neutral-400 hover:text-red-600 transition self-end mb-0.5"
                    title="Delete Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Dedicated Variant Images (Upload multiple & WebP) */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2.5 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-gold-500" />
                  Variant Photos ({v.images?.length || 0}):
                </span>

                {/* Upload button for this variant */}
                <label className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 hover:border-crimson-600 text-neutral-700 dark:text-neutral-300 rounded text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition">
                  {uploadingVariantIndex === idx ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-gold-400" />
                      <span>Converting to WebP...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 text-crimson-700 dark:text-gold-400" />
                      <span>+ Upload Photos</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={uploadingVariantIndex === idx}
                    onChange={(e) => handleVariantImageUpload(idx, e)}
                    className="hidden"
                  />
                </label>

                {/* Thumbnail list for this variant */}
                {v.images && v.images.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {v.images.map((imgUrl: string, imgIdx: number) => (
                      <div
                        key={imgIdx}
                        className="relative group w-11 h-12 rounded overflow-hidden border border-neutral-300 dark:border-neutral-600 bg-neutral-100 flex-shrink-0"
                      >
                        <img src={imgUrl} alt="Variant" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantImage(idx, imgIdx)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition"
                          title="Remove photo"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
