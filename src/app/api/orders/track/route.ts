import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { getUserFromRequest } from '@/lib/auth';
import { canViewFullOrder, fullOrderView, hasTrackingCode, publicOrderView } from '@/lib/orderAccess';

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
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No order found matching this tracking code or order number' },
        { status: 404 }
      );
    }

    // The secret tracking code shows full details (address etc.). An order number alone
    // only shows status and items, unless it's the signed-in owner or an admin.
    const full = hasTrackingCode(order, query) || canViewFullOrder(order, getUserFromRequest(req));
    const view = full ? fullOrderView(order) : publicOrderView(order);
    if (full) delete (view as any).userId;
    return NextResponse.json({ success: true, order: view });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
