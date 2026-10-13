import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const all = searchParams.get('all') === 'true';

    const filter: any = {};
    if (productId) filter.productId = productId;

    // Only admins can see unapproved reviews
    if (!all || !user || user.role === 'CUSTOMER') {
      filter.isApproved = true;
    }

    const reviews = await Review.find(filter)
      .populate('productId', 'title slug images')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { productId, rating, comment, userName } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Product ID, rating (1-5), and review comment are required' },
        { status: 400 }
      );
    }

    const name = userName?.trim() || user?.name || 'Vasantham Patron';

    const review = await Review.create({
      productId,
      userId: user?.userId,
      userName: name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      isApproved: true, // Auto-approve or default approved for high UX engagement
    });

    // Update product ratings average and count
    const allApproved = await Review.find({ productId, isApproved: true });
    const count = allApproved.length;
    const avg =
      count > 0
        ? Math.round((allApproved.reduce((acc, r) => acc + r.rating, 0) / count) * 10) / 10
        : 5;

    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: avg,
      ratingsQuantity: count,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
