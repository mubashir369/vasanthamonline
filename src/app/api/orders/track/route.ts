import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('code')?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Order number or tracking code is required' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      $or: [
        { orderNumber: query.toUpperCase() },
        { trackingCode: query.toUpperCase() },
        { orderNumber: query },
        { trackingCode: query },
      ],
    }).select('-userId');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No order found matching this tracking code or order number' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
