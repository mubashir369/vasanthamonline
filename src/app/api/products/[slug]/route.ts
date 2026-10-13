import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import ProductVariant from '@/lib/models/ProductVariant';
import Review from '@/lib/models/Review';
import { getUserFromRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const identifier = params.slug;

    let query: any = { slug: identifier };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { $or: [{ slug: identifier }, { _id: identifier }] };
    }

    const product = await Product.findOne(query)
      .populate('categories', 'name slug description')
      .lean();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Variants
    const variants = await ProductVariant.find({ productId: product._id }).lean();

    // Approved Reviews
    const reviews = await Review.find({ productId: product._id, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    // Related products (from same category, excluding current)
    let relatedProducts: any[] = [];
    if (product.categories && product.categories.length > 0) {
      const catIds = product.categories.map((c: any) => c._id || c);
      const rawRelated = await Product.find({
        _id: { $ne: product._id },
        categories: { $in: catIds },
      })
        .limit(4)
        .lean();

      // fetch primary variant for each related product
      const relIds = rawRelated.map((p) => p._id);
      const relVariants = await ProductVariant.find({ productId: { $in: relIds } }).lean();
      relatedProducts = rawRelated.map((p) => {
        const pVars = relVariants.filter((v) => v.productId.toString() === p._id.toString());
        return {
          ...p,
          variants: pVars,
          primaryVariant: pVars[0] || null,
        };
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        variants,
        reviews,
      },
      relatedProducts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    let query: any = { slug: params.slug };
    if (mongoose.Types.ObjectId.isValid(params.slug)) {
      query = { $or: [{ slug: params.slug }, { _id: params.slug }] };
    }

    const product = await Product.findOne(query);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      designNumber,
      styleNumber,
      categories,
      audience,
      fabricType,
      fabricCare,
      images,
      isFeatured,
      isNewArrival,
      isBestSeller,
      variants,
    } = body;

    if (title && title !== product.title) {
      product.title = title.trim();
      product.slug = slugify(title);
    }
    if (description !== undefined) product.description = description;
    if (designNumber !== undefined) product.designNumber = designNumber;
    if (styleNumber !== undefined) product.styleNumber = styleNumber;
    if (categories !== undefined) product.categories = categories;
    if (audience !== undefined) product.audience = audience;
    if (fabricType !== undefined) product.fabricType = fabricType;
    if (fabricCare !== undefined) product.fabricCare = fabricCare;
    if (images !== undefined) product.images = images;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isNewArrival !== undefined) product.isNewArrival = isNewArrival;
    if (isBestSeller !== undefined) product.isBestSeller = isBestSeller;

    await product.save();

    // If variants array passed, update/sync variants
    if (Array.isArray(variants)) {
      // Remove variants that are no longer in the list if variant._id provided
      const existingVariants = await ProductVariant.find({ productId: product._id });
      const incomingIds = variants
        .filter((v: any) => v._id)
        .map((v: any) => v._id.toString());

      for (const ev of existingVariants) {
        if (!incomingIds.includes(ev._id.toString())) {
          await ProductVariant.findByIdAndDelete(ev._id);
        }
      }

      for (const v of variants) {
        const discountPercent =
          v.salePrice && v.salePrice < v.price
            ? Math.round(((v.price - v.salePrice) / v.price) * 100)
            : 0;

        if (v._id && mongoose.Types.ObjectId.isValid(v._id)) {
          await ProductVariant.findByIdAndUpdate(v._id, {
            sku: v.sku.toUpperCase().trim(),
            barcode: v.barcode.trim(),
            color: v.color.trim(),
            colorHex: v.colorHex || '#7E121D',
            size: v.size.trim(),
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : undefined,
            discountPercent,
            stockQuantity: Number(v.stockQuantity || 0),
            images: v.images || [],
          });
        } else {
          await ProductVariant.create({
            productId: product._id,
            sku: v.sku.toUpperCase().trim(),
            barcode: v.barcode.trim(),
            color: v.color.trim(),
            colorHex: v.colorHex || '#7E121D',
            size: v.size.trim(),
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : undefined,
            discountPercent,
            stockQuantity: Number(v.stockQuantity || 0),
            images: v.images || [],
          });
        }
      }
    }

    const updatedVariants = await ProductVariant.find({ productId: product._id });

    return NextResponse.json({
      success: true,
      product: {
        ...product.toObject(),
        variants: updatedVariants,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Super Admin access required' }, { status: 403 });
    }

    let query: any = { slug: params.slug };
    if (mongoose.Types.ObjectId.isValid(params.slug)) {
      query = { $or: [{ slug: params.slug }, { _id: params.slug }] };
    }

    const product = await Product.findOne(query);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Delete variants and reviews
    await ProductVariant.deleteMany({ productId: product._id });
    await Review.deleteMany({ productId: product._id });
    await Product.findByIdAndDelete(product._id);

    return NextResponse.json({ success: true, message: 'Product and variants deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
