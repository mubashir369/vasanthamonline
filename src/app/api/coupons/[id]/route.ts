import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const coupon = await Coupon.findById(params.id);
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    if (body.code) coupon.code = body.code.toUpperCase().trim();
    if (body.discountType) coupon.discountType = body.discountType;
    if (body.discountValue !== undefined) coupon.discountValue = Number(body.discountValue);
    if (body.minOrderValue !== undefined) coupon.minOrderValue = Number(body.minOrderValue);
    if (body.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined;
    if (body.endDate) coupon.endDate = new Date(body.endDate);
    if (body.usageLimit !== undefined) coupon.usageLimit = Number(body.usageLimit);
    if (body.isActive !== undefined) coupon.isActive = !!body.isActive;

    await coupon.save();
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Super Admin access required' }, { status: 403 });
    }

    await Coupon.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
