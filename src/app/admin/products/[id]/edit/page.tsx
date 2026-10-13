'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductEditorForm from '@/components/admin/ProductEditorForm';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs font-mono">Loading product data...</div>;
  }

  if (!product) {
    return <div className="p-12 text-center text-xs text-red-500">Product not found.</div>;
  }

  return <ProductEditorForm initialData={product} isEdit={true} />;
}
