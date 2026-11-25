import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import ProductVariant from '@/lib/models/ProductVariant';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const [
      orders,
      totalProducts,
      totalCustomers,
      lowStockVariants,
      recentOrders,
    ] = await Promise.all([
      Order.find().lean(),
      Product.countDocuments(),
      User.countDocuments({ role: 'CUSTOMER' }),
      ProductVariant.find({ stockQuantity: { $lte: 5 } })
        .populate('productId', 'title slug')
        .limit(10)
        .lean(),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    // Sales = every order that wasn't cancelled. "Collected" is what has actually been paid
    // (online payments, and cash on delivery once delivered); the rest is awaiting payment.
    const sum = (list: any[]) => list.reduce((total, o) => total + (o.totalAmount || 0), 0);
    const activeOrders = orders.filter((o) => o.orderStatus !== 'CANCELLED');
    const totalOrders = activeOrders.length;
    const totalRevenue = sum(activeOrders);
    const collectedRevenue = sum(activeOrders.filter((o) => o.paymentStatus === 'PAID'));
    const awaitingPayment = sum(activeOrders.filter((o) => o.paymentStatus === 'PENDING'));
    const refundsDue = orders.filter((o) => o.paymentStatus === 'REFUND_DUE').length;
    const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'PENDING').length;
    const processingOrdersCount = orders.filter((o) => o.orderStatus === 'PROCESSING' || o.orderStatus === 'CONFIRMED').length;
    const shippedOrdersCount = orders.filter((o) => o.orderStatus === 'SHIPPED').length;
    const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

    // Status breakdown
    const statusCounts = {
      PENDING: pendingOrdersCount,
      PROCESSING: processingOrdersCount,
      SHIPPED: shippedOrdersCount,
      DELIVERED: deliveredOrdersCount,
      CANCELLED: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
    };

    return NextResponse.json({
      success: true,
      metrics: {
        totalOrders,
        totalRevenue,
        collectedRevenue,
        awaitingPayment,
        refundsDue,
        cancelledOrders: orders.length - activeOrders.length,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        totalProducts,
        totalCustomers,
        pendingOrdersCount,
      },
      statusCounts,
      lowStockVariants,
      recentOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
