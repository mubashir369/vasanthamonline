import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/lib/models/Coupon';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json({ success: false, error: 'This coupon offer has not started yet' }, { status: 400 });
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json({ success: false, error: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: 'Coupon usage limit has been reached' }, { status: 400 });
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        success: false,
        error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
