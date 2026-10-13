'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import {
  ShieldCheck,
  Store,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  AlertCircle,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, deliveryFee, totalAmount, deliveryType, setDeliveryType, coupon, clearCart } = useCart();
  const { user } = useAuth();

  // Contact info
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  // Shipping Address
  const defaultAddress = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];
  const [street, setStreet] = useState(defaultAddress?.street || '');
  const [landmark, setLandmark] = useState(defaultAddress?.landmark || '');
  const [city, setCity] = useState(defaultAddress?.city || 'Palakkad');
  const [district, setDistrict] = useState(defaultAddress?.district || 'Palakkad');
  const [state, setState] = useState(defaultAddress?.state || 'Kerala');
  const [pincode, setPincode] = useState(defaultAddress?.pincode || '678001');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE' | 'DEMO_TEST'>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Update pre-fills if user loads
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (user.addresses && user.addresses.length > 0 && !street) {
        const addr = user.addresses[0];
        setStreet(addr.street);
        setLandmark(addr.landmark || '');
        setCity(addr.city);
        setDistrict(addr.district);
        setState(addr.state || 'Kerala');
        setPincode(addr.pincode);
      }
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Your shopping bag is empty</h2>
        <p className="text-neutral-500 text-sm">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-crimson-800 text-gold-300 text-xs font-semibold rounded-lg shadow"
        >
          Browse Collections <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please provide your name and contact phone number.');
      return;
    }

    if (deliveryType === 'HOME_DELIVERY') {
      if (!street.trim() || !city.trim() || !pincode.trim()) {
        setError('Please complete the shipping address fields.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        customerInfo: {
          name: customerName.trim(),
          email: customerEmail.trim() || 'customer@vasantham.com',
          phone: customerPhone.trim(),
        },
        shippingAddress: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          street: street.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        deliveryType,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        couponCode: coupon?.code,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success && data.order) {
        clearCart();
        router.push(`/order-success/${data.order.orderNumber}?trackingCode=${data.order.trackingCode}`);
      } else {
        setError(data.error || 'Failed to place order. Please try again.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Checkout & Order Verification
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Complete your order with authentic Malabar textile delivery or store pickup
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact Information */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crimson-800 text-gold-300 text-xs flex items-center justify-center font-sans font-bold">1</span>
              Customer Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Anjali Menon"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Phone Number (WhatsApp for Tracking updates) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +91 98950 11223"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Email Address (For receipt copy)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. anjali@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-crimson-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Method */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crimson-800 text-gold-300 text-xs flex items-center justify-center font-sans font-bold">2</span>
              Choose Delivery Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                onClick={() => setDeliveryType('HOME_DELIVERY')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  deliveryType === 'HOME_DELIVERY'
                    ? 'border-crimson-700 dark:border-gold-400 bg-crimson-50/50 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  <Truck className="w-4 h-4 text-crimson-700 dark:text-gold-400" />
                  <span>Doorstep Courier</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Delivered safely to your address anywhere in Kerala. Free above ₹1,999.
                </p>
              </div>

              <div
                onClick={() => setDeliveryType('STORE_PICKUP')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  deliveryType === 'STORE_PICKUP'
                    ? 'border-gold-500 bg-gold-50/50 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                    <span>Mannarkkad Store Pickup</span>
                  </div>
                  <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Collect directly at OPP. MY G Future, Main Road, Mannarkkad.
                </p>
              </div>
            </div>

            {/* Address fields if Home Delivery */}
            {deliveryType === 'HOME_DELIVERY' ? (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Shipping Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">House / Building / Street Address *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 12/482, Temple Road"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near NSS College"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">District *</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 678582"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gold-50 dark:bg-neutral-800/80 border border-gold-300/40 rounded-lg text-xs space-y-1">
                <div className="font-bold text-neutral-900 dark:text-gold-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-600" />
                  Pickup Point: Vasantham Group Flagship Store
                </div>
                <p className="text-neutral-600 dark:text-neutral-300">
                  OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582.
                  You will receive a notification and SMS when your items are packed and ready.
                </p>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crimson-800 text-gold-300 text-xs flex items-center justify-center font-sans font-bold">3</span>
              Payment Method
            </h2>

            <div className="space-y-3 text-xs">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-crimson-700 dark:border-gold-400 bg-crimson-50/40 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 text-crimson-700 focus:ring-crimson-600"
                />
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery (COD) / Pay at Store</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Pay in cash or UPI when your parcel arrives or during store pickup.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'ONLINE'
                    ? 'border-crimson-700 dark:border-gold-400 bg-crimson-50/40 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-0.5 text-crimson-700 focus:ring-crimson-600"
                />
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-crimson-700 dark:text-gold-400" />
                    <span>Instant Online Payment / UPI / NetBanking</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Simulated secure payment gateway (Cards, GooglePay, PhonePe, Paytm).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 sticky top-28">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Order Review ({items.length} items)
            </h2>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 pr-1 text-xs">
              {items.map((item) => (
                <div key={item.variantId} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-14 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-neutral-500">{item.size} • {item.color} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-gold-300">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery ({deliveryType === 'STORE_PICKUP' ? 'Store Pickup' : 'Courier'})</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  {deliveryFee === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : formatPrice(deliveryFee)}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-neutral-100 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <span>Total Amount</span>
                <span className="text-crimson-800 dark:text-gold-300 font-serif text-xl">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-4 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-crimson-950 text-gold-300 font-bold rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              {isProcessing ? 'Processing Order...' : `Confirm & Place Order (${formatPrice(totalAmount)})`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              <span>Cryptographically safe tracking code generated</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
