import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const identifier = params.id;

    let query: any = { orderNumber: identifier };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { $or: [{ orderNumber: identifier }, { _id: identifier }, { trackingCode: identifier }] };
    }

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Security: if user is customer, verify it's their order
    if (user && user.role === 'CUSTOMER' && order.userId && order.userId.toString() !== user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
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
    const { orderStatus, note, paymentStatus } = body;

    let query: any = { orderNumber: params.id };
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      query = { $or: [{ orderNumber: params.id }, { _id: params.id }] };
    }

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        timestamp: new Date(),
        note: note || `Status updated to ${orderStatus} by administrator`,
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
