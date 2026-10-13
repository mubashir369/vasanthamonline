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

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
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
        averageOrderValue: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
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
