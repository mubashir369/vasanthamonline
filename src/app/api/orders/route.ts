import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import ProductVariant from '@/lib/models/ProductVariant';
import Product from '@/lib/models/Product';
import Coupon from '@/lib/models/Coupon';
import StoreSettings from '@/lib/models/StoreSettings';
import { getUserFromRequest } from '@/lib/auth';
import { generateOrderNumber, generateTrackingCode, calculateDeliveryFee } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const body = await req.json();

    const {
      customerInfo,
      shippingAddress,
      deliveryType,
      items,
      couponCode,
      paymentMethod,
    } = body;

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    // Settings for delivery calculations
    const settings = (await StoreSettings.findOne()) || {
      baseCourierCharge: 80,
      freeDeliveryMinAmount: 1999,
    };

    // 1. Validate variants & stock
    const validatedItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const variant = await ProductVariant.findById(item.variantId);
      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Product variant not found` },
          { status: 404 }
        );
      }

      if (variant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${variant.color} (${variant.size}). Only ${variant.stockQuantity} remaining.`,
          },
          { status: 400 }
        );
      }

      const product = await Product.findById(variant.productId);
      const unitPrice = variant.salePrice || variant.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: variant.productId,
        variantId: variant._id,
        title: product?.title || 'Heritage Textile Item',
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: unitPrice,
        quantity: item.quantity,
        image: variant.images?.[0] || product?.images?.[0] || '',
      });
    }

    // 2. Validate coupon if present
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (coupon && (!coupon.endDate || new Date(coupon.endDate) >= new Date())) {
        if (subtotal >= (coupon.minOrderValue || 0)) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          if (discountAmount > subtotal) discountAmount = subtotal;

          // Increment coupon used count
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      }
    }

    // 3. Calculate delivery fee
    const deliveryFee = calculateDeliveryFee(
      deliveryType || 'HOME_DELIVERY',
      subtotal - discountAmount,
      settings.baseCourierCharge,
      settings.freeDeliveryMinAmount
    );

    const totalAmount = subtotal - discountAmount + deliveryFee;

    // 4. Determine payment status
    const isOnlineOrDemo = paymentMethod === 'ONLINE' || paymentMethod === 'DEMO_TEST';
    const paymentStatus = isOnlineOrDemo ? 'PAID' : 'PENDING';

    const orderNumber = generateOrderNumber();
    const trackingCode = generateTrackingCode();

    // 5. Decrement stock
    for (const item of validatedItems) {
      await ProductVariant.findByIdAndUpdate(item.variantId, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // 6. Create order
    const order = await Order.create({
      orderNumber,
      trackingCode,
      userId: user ? user.userId : undefined,
      customerInfo: {
        name: customerInfo.name.trim(),
        email: customerInfo.email?.trim() || 'customer@vasantham.com',
        phone: customerInfo.phone.trim(),
      },
      shippingAddress:
        deliveryType === 'STORE_PICKUP'
          ? {
              fullName: customerInfo.name.trim(),
              phone: customerInfo.phone.trim(),
              street: 'Store Pickup: OPP. MY G Future, Main road Mannarkkad',
              city: 'Mannarkkad',
              district: 'Palakkad',
              state: 'Kerala',
              pincode: '678582',
            }
          : {
              fullName: shippingAddress?.fullName || customerInfo.name,
              phone: shippingAddress?.phone || customerInfo.phone,
              street: shippingAddress?.street || 'Main Road',
              landmark: shippingAddress?.landmark || '',
              city: shippingAddress?.city || 'Palakkad',
              district: shippingAddress?.district || 'Palakkad',
              state: shippingAddress?.state || 'Kerala',
              pincode: shippingAddress?.pincode || '678001',
            },
      deliveryType: deliveryType || 'HOME_DELIVERY',
      items: validatedItems,
      subtotal,
      discountAmount,
      couponCode: discountAmount > 0 ? couponCode.toUpperCase() : undefined,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus,
      orderStatus: 'PENDING',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note:
            deliveryType === 'STORE_PICKUP'
              ? 'Order placed. Customer selected Store Pickup at Mannarkkad.'
              : 'Order placed successfully and queued for fulfillment.',
        },
      ],
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const filter: any = {};

    // Customer only sees their orders
    if (user.role === 'CUSTOMER') {
      filter.userId = user.userId;
    } else {
      // Admin filters
      if (status) filter.orderStatus = status;
      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { trackingCode: { $regex: search, $options: 'i' } },
          { 'customerInfo.name': { $regex: search, $options: 'i' } },
          { 'customerInfo.phone': { $regex: search, $options: 'i' } },
        ];
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
