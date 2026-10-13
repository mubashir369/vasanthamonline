import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import ProductVariant from '@/lib/models/ProductVariant';
import Category from '@/lib/models/Category';
import { getUserFromRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const audience = searchParams.get('audience');
    const fabricType = searchParams.get('fabricType');
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('isFeatured');
    const isNewArrival = searchParams.get('isNewArrival');
    const isBestSeller = searchParams.get('isBestSeller');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
    const inStock = searchParams.get('inStock') === 'true';

    // Build filter
    const filter: any = {};

    if (audience) {
      const audiences = audience.split(',').map((a) => a.trim().toLowerCase());
      filter.audience = { $in: audiences };
    }

    if (fabricType) {
      const fabrics = fabricType.split(',').map((f) => f.trim());
      filter.fabricType = { $in: fabrics };
    }

    if (isFeatured === 'true') filter.isFeatured = true;
    if (isNewArrival === 'true') filter.isNewArrival = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        filter.categories = category._id;
      }
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { designNumber: { $regex: q, $options: 'i' } },
        { styleNumber: { $regex: q, $options: 'i' } },
      ];
    }

    // Sort order
    let sortQuery: any = { createdAt: -1 };
    if (sort === 'rating') sortQuery = { ratingsAverage: -1 };
    if (sort === 'title_asc') sortQuery = { title: 1 };

    const products = await Product.find(filter)
      .populate('categories', 'name slug')
      .sort(sortQuery)
      .lean();

    // Fetch all variants for these products
    const productIds = products.map((p) => p._id);
    const variants = await ProductVariant.find({ productId: { $in: productIds } }).lean();

    // Map variants to products
    const variantMap = new Map<string, any[]>();
    for (const v of variants) {
      const pid = v.productId.toString();
      if (!variantMap.has(pid)) {
        variantMap.set(pid, []);
      }
      variantMap.get(pid)!.push(v);
    }

    let enrichedProducts = products.map((prod) => {
      const pVariants = variantMap.get(prod._id.toString()) || [];
      const primaryVariant = pVariants[0] || null;
      const minPriceVal = pVariants.length > 0
        ? Math.min(...pVariants.map((v) => v.salePrice || v.price))
        : 0;
      const maxPriceVal = pVariants.length > 0
        ? Math.max(...pVariants.map((v) => v.price))
        : 0;
      const totalStock = pVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

      return {
        ...prod,
        variants: pVariants,
        primaryVariant,
        priceRange: { min: minPriceVal, max: maxPriceVal },
        totalStock,
      };
    });

    // Apply price & stock filtering if requested
    if (minPrice !== null) {
      enrichedProducts = enrichedProducts.filter((p) => p.priceRange.min >= minPrice);
    }
    if (maxPrice !== null) {
      enrichedProducts = enrichedProducts.filter((p) => p.priceRange.min <= maxPrice);
    }
    if (inStock) {
      enrichedProducts = enrichedProducts.filter((p) => p.totalStock > 0);
    }

    // Sort by price if requested
    if (sort === 'price_asc') {
      enrichedProducts.sort((a, b) => a.priceRange.min - b.priceRange.min);
    } else if (sort === 'price_desc') {
      enrichedProducts.sort((a, b) => b.priceRange.min - a.priceRange.min);
    }

    return NextResponse.json({ success: true, count: enrichedProducts.length, products: enrichedProducts });
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

    if (!title || !description || !audience) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and audience are required' },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await Product.create({
      title: title.trim(),
      slug,
      description,
      designNumber,
      styleNumber,
      categories: categories || [],
      audience,
      fabricType: fabricType || 'Silk',
      fabricCare,
      images: images || [],
      isFeatured: !!isFeatured,
      isNewArrival: !!isNewArrival,
      isBestSeller: !!isBestSeller,
      hasVariants: true,
    });

    const createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const discountPercent =
          v.salePrice && v.salePrice < v.price
            ? Math.round(((v.price - v.salePrice) / v.price) * 100)
            : 0;

        const variantDoc = await ProductVariant.create({
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
        createdVariants.push(variantDoc);
      }
    }

    return NextResponse.json(
      { success: true, product, variants: createdVariants },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
