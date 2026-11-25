import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { getUserFromRequest } from '@/lib/auth';
import { canViewFullOrder, fullOrderView, hasTrackingCode, publicOrderView } from '@/lib/orderAccess';
import ProductVariant from '@/lib/models/ProductVariant';
import { canChangeStatus, OrderStatus, PAYMENT_STATUSES } from '@/lib/orderStatus';

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const identifier = params.id;

    let query: any = { orderNumber: identifier };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { $or: [{ orderNumber: identifier }, { _id: identifier }] };
    }

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Full details only for admins, the customer who placed it, or someone holding the
    // order's secret tracking code (the order-success page has it). Anyone else who
    // only knows the order number gets status and items, without personal details.
    const code = new URL(req.url).searchParams.get('code');
    if (canViewFullOrder(order, user) || hasTrackingCode(order, code)) {
      return NextResponse.json({ success: true, order: fullOrderView(order) });
    }
    return NextResponse.json({ success: true, order: publicOrderView(order) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
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

    const from = order.orderStatus as OrderStatus;
    const changingStatus = Boolean(orderStatus) && orderStatus !== from;

    if (changingStatus && !canChangeStatus(from, orderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error:
            from === 'DELIVERED' || from === 'CANCELLED'
              ? `This order is ${from.toLowerCase()} and can no longer be changed.`
              : `An order can't go from ${from} to ${orderStatus}.`,
        },
        { status: 400 }
      );
    }
    if (paymentStatus !== undefined && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid payment status' }, { status: 400 });
    }

    const now = new Date();
    const log = (status: OrderStatus, text: string) => order.statusHistory.push({ status, timestamp: now, note: text });

    if (changingStatus) {
      order.orderStatus = orderStatus;
      log(orderStatus, note || `Status updated to ${orderStatus} by administrator`);

      if (orderStatus === 'CANCELLED') {
        // Put the items back on the shelf.
        for (const item of order.items) {
          await ProductVariant.updateOne({ _id: item.variantId }, { $inc: { stockQuantity: item.quantity } });
        }
        log('CANCELLED', `Stock returned: ${order.items.map((i: any) => `${i.quantity} × ${i.sku}`).join(', ')}.`);

        if (order.paymentStatus === 'PAID') {
          order.paymentStatus = 'REFUND_DUE';
          log(
            'CANCELLED',
            order.razorpayPaymentId
              ? `Refund due: refund Razorpay payment ${order.razorpayPaymentId} from the Razorpay dashboard, then mark the payment Refunded.`
              : 'Refund due: return the amount paid to the customer, then mark the payment Refunded.'
          );
        }
      }

      // Cash on delivery is collected when the parcel is handed over.
      if (orderStatus === 'DELIVERED' && order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING') {
        order.paymentStatus = 'PAID';
        log('DELIVERED', 'Cash on delivery collected – payment marked Paid.');
      }
    } else if (note && note.trim()) {
      // "Save & Log Event" with only a note
      log(from, note.trim());
    }

    if (paymentStatus !== undefined && paymentStatus !== order.paymentStatus) {
      order.paymentStatus = paymentStatus;
      log(order.orderStatus, `Payment marked ${paymentStatus.replace('_', ' ').toLowerCase()} by administrator.`);
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
