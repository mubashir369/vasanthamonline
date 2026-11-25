import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { isValidVerificationToken, normalizeTarget } from '@/lib/otp';
import { priceCart } from '@/lib/pricing.server';
import { getRazorpay, toPaise } from '@/lib/razorpay.server';

/**
 * POST /api/razorpay/create-order
 * Body: { items, couponCode, deliveryType, phone, checkoutToken }
 *
 * The amount is calculated here from the cart – never taken from the browser –
 * and the OTP-verified phone is stored on the Razorpay order, so /api/orders can
 * confirm the payment covers exactly this order for this customer.
 */
export async function POST(req: NextRequest) {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json(
        { success: false, error: 'Razorpay API credentials not configured.' },
        { status: 500 }
      );
    }

    const { items, couponCode, deliveryType, phone, checkoutToken } = await req.json();

    // The customer's WhatsApp number must be OTP-verified before they can pay.
    const verifiedPhone = normalizeTarget('WHATSAPP', phone);
    if (!verifiedPhone || !isValidVerificationToken(checkoutToken, 'WHATSAPP', verifiedPhone, 'CHECKOUT_VERIFY')) {
      return NextResponse.json(
        { success: false, error: 'Please verify your WhatsApp number with the OTP before paying.' },
        { status: 403 }
      );
    }

    await connectDB();
    const pricing = await priceCart({ items, couponCode, deliveryType });
    if (!pricing.ok) {
      return NextResponse.json({ success: false, error: pricing.error }, { status: pricing.status });
    }
    if (pricing.totalAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid order amount.' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: toPaise(pricing.totalAmount),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { phone: verifiedPhone },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      totalAmount: pricing.totalAmount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
