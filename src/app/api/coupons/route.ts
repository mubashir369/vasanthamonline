import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const filter: any = {};
    if (activeOnly || !user || user.role === 'CUSTOMER') {
      filter.isActive = true;
      filter.endDate = { $gte: new Date() };
    }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = body;

    if (!code || !discountType || discountValue === undefined || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Code, discountType, discountValue, and endDate are required' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: upperCode });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 409 });
    }

    const coupon = await Coupon.create({
      code: upperCode,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : 500,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
