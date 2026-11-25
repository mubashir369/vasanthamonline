import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import ProductVariant from '@/lib/models/ProductVariant';
import Product from '@/lib/models/Product';
import Coupon from '@/lib/models/Coupon';
import StoreSettings from '@/lib/models/StoreSettings';
import { getUserFromRequest } from '@/lib/auth';
import { generateOrderNumber, generateTrackingCode } from '@/lib/utils.server';
import { priceCart } from '@/lib/pricing.server';
import { getRazorpay, isValidPaymentSignature, toPaise } from '@/lib/razorpay.server';
import { isValidVerificationToken, normalizeTarget } from '@/lib/otp';

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
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    if (!['COD', 'ONLINE'].includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: 'Invalid payment method' }, { status: 400 });
    }

    const verifiedPhone = normalizeTarget('WHATSAPP', customerInfo.phone);
    if (!verifiedPhone) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit WhatsApp number' },
        { status: 400 }
      );
    }

    // Every checkout must verify the customer's WhatsApp number by OTP.
    // For online payments that was checked in /api/razorpay/create-order, before the
    // customer paid, and the verified number is tied to the Razorpay order (checked below).
    if (
      paymentMethod === 'COD' &&
      !isValidVerificationToken(body.checkoutToken, 'WHATSAPP', verifiedPhone, 'CHECKOUT_VERIFY')
    ) {
      return NextResponse.json(
        { success: false, error: 'Please verify your WhatsApp number with the OTP before placing the order.' },
        { status: 403 }
      );
    }

    // 1-3. Price the cart on the server (stock, coupon, delivery)
    const pricing = await priceCart({ items, couponCode, deliveryType });
    if (!pricing.ok) {
      return NextResponse.json({ success: false, error: pricing.error }, { status: pricing.status });
    }
    const { subtotal, discountAmount, deliveryFee, totalAmount } = pricing;

    // 4. Verify Online Payment if applicable
    let finalPaymentStatus: 'PENDING' | 'PAID' = 'PENDING';
    let finalOrderStatus: 'PENDING' | 'CONFIRMED' = 'PENDING';
    let paymentHistoryNote =
      deliveryType === 'STORE_PICKUP'
        ? 'Order placed. Customer selected Store Pickup at Mannarkkad.'
        : 'Order placed successfully and queued for fulfillment.';

    if (paymentMethod === 'ONLINE') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
          { success: false, error: 'Online payment details (order_id, payment_id, signature) are required.' },
          { status: 400 }
        );
      }

      if (!isValidPaymentSignature(String(razorpayOrderId), String(razorpayPaymentId), razorpaySignature)) {
        return NextResponse.json(
          { success: false, error: 'Razorpay payment signature verification failed.' },
          { status: 400 }
        );
      }

      // A payment can only ever pay for one order.
      if (await Order.exists({ $or: [{ razorpayPaymentId }, { razorpayOrderId }] })) {
        return NextResponse.json(
          { success: false, error: 'This payment has already been used for an order.' },
          { status: 409 }
        );
      }

      const razorpay = getRazorpay();
      if (!razorpay) {
        return NextResponse.json({ success: false, error: 'Server Razorpay configuration error.' }, { status: 500 });
      }

      // Ask Razorpay what was actually paid, rather than trusting the browser.
      const fetched = await Promise.all([
        razorpay.payments.fetch(String(razorpayPaymentId)),
        razorpay.orders.fetch(String(razorpayOrderId)),
      ]).catch((err) => {
        console.error('[orders] Could not fetch Razorpay payment/order', razorpayPaymentId, err);
        return null;
      });
      if (!fetched) {
        return NextResponse.json(
          { success: false, error: 'We could not confirm this payment with Razorpay. Please contact support.' },
          { status: 400 }
        );
      }
      const [payment, rzpOrder] = fetched;
      const paidCorrectAmount =
        payment.order_id === razorpayOrderId &&
        ['captured', 'authorized'].includes(payment.status) &&
        Number(payment.amount) === toPaise(totalAmount) &&
        Number(rzpOrder.amount) === toPaise(totalAmount);

      if (!paidCorrectAmount) {
        console.error('[orders] Razorpay amount/status mismatch', {
          razorpayOrderId,
          razorpayPaymentId,
          paymentStatus: payment.status,
          paid: payment.amount,
          expected: toPaise(totalAmount),
        });
        return NextResponse.json(
          {
            success: false,
            error: `The payment doesn't match your order total. Please contact support with payment ID ${razorpayPaymentId}.`,
          },
          { status: 400 }
        );
      }

      if (rzpOrder.notes?.phone !== verifiedPhone) {
        return NextResponse.json(
          { success: false, error: 'This payment was made for a different WhatsApp number.' },
          { status: 403 }
        );
      }

      finalPaymentStatus = 'PAID';
      finalOrderStatus = 'CONFIRMED';
      paymentHistoryNote = `Payment verified via Razorpay (Payment ID: ${razorpayPaymentId}). Order confirmed.`;
    }

    const orderNumber = generateOrderNumber();
    const trackingCode = generateTrackingCode();

    // 5. Decrement stock
    for (const item of pricing.items) {
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
        email: customerInfo.email?.trim() || 'customer@vasanthamonline.com',
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
      items: pricing.items,
      subtotal,
      discountAmount,
      couponCode: pricing.coupon && discountAmount > 0 ? pricing.coupon.code : undefined,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpaySignature: razorpaySignature || undefined,
      orderStatus: finalOrderStatus,
      statusHistory: [
        {
          status: finalOrderStatus,
          timestamp: new Date(),
          note: paymentHistoryNote,
        },
      ],
    });

    if (pricing.coupon && discountAmount > 0) {
      await Coupon.updateOne({ _id: pricing.coupon._id }, { $inc: { usedCount: 1 } });
    }

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
