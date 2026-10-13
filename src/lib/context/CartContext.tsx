'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
  slug: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryType: 'STORE_PICKUP' | 'HOME_DELIVERY';
  coupon: AppliedCoupon | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setDeliveryType: (type: 'STORE_PICKUP' | 'HOME_DELIVERY') => void;
  addToCart: (item: CartItem) => { success: boolean; message?: string };
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [deliveryType, setDeliveryType] = useState<'STORE_PICKUP' | 'HOME_DELIVERY'>('HOME_DELIVERY');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vasantham_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem('vasantham_coupon');
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('vasantham_cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) {
      if (coupon) {
        localStorage.setItem('vasantham_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('vasantham_coupon');
      }
    }
  }, [coupon, mounted]);

  const addToCart = (newItem: CartItem) => {
    const existingIndex = items.findIndex((i) => i.variantId === newItem.variantId);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const targetQty = currentQty + newItem.quantity;

      if (targetQty > newItem.maxStock) {
        return {
          success: false,
          message: `Only ${newItem.maxStock} pieces available in stock for this variant.`,
        };
      }

      const updated = [...items];
      updated[existingIndex].quantity = targetQty;
      setItems(updated);
      setIsCartOpen(true);
      return { success: true };
    } else {
      if (newItem.quantity > newItem.maxStock) {
        return {
          success: false,
          message: `Only ${newItem.maxStock} pieces available in stock for this variant.`,
        };
      }

      setItems([...items, newItem]);
      setIsCartOpen(true);
      return { success: true };
    }
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          const clampedQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('vasantham_cart');
    localStorage.removeItem('vasantham_coupon');
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Re-calculate coupon discount if subtotal changes
  const discountAmount = coupon ? Math.min(coupon.discountAmount, subtotal) : 0;

  // Delivery fee: ₹0 for store pickup or if subtotal >= 1999, else ₹80
  const deliveryFee =
    deliveryType === 'STORE_PICKUP'
      ? 0
      : subtotal - discountAmount >= 1999 || subtotal === 0
      ? 0
      : 80;

  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupon(data.coupon);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to apply coupon' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        deliveryFee,
        totalAmount,
        deliveryType,
        coupon,
        isCartOpen,
        setIsCartOpen,
        setDeliveryType,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
