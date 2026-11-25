import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { computeCouponDiscount } from '@/lib/couponRules';

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

    const rules = {
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || undefined,
    };

    // The cart keeps these rules and recalculates the discount whenever the bag changes.
    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        ...rules,
        discountAmount: computeCouponDiscount(rules, Number(subtotal) || 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
