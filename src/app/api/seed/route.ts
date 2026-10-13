import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import ProductVariant from '@/lib/models/ProductVariant';
import Coupon from '@/lib/models/Coupon';
import Review from '@/lib/models/Review';
import StoreSettings from '@/lib/models/StoreSettings';
import { initialCategories, initialProducts, initialCoupons } from '@/lib/seedData';

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      ProductVariant.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      StoreSettings.deleteMany({}),
    ]);

    // 1. Settings
    const settings = await StoreSettings.create({});

    // 2. Users
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const customerPasswordHash = await bcrypt.hash('customer123', 10);

    const superAdmin = await User.create({
      name: 'Vasantham Administrator',
      email: 'admin@vasantham.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      phone: '+91 94471 23456',
      addresses: [
        {
          fullName: 'Store Head Office',
          phone: '+91 94471 23456',
          street: 'OPP. MY G Future, Main road Mannarkkad',
          city: 'Mannarkkad',
          district: 'Palakkad',
          state: 'Kerala',
          pincode: '678582',
          isDefault: true,
        },
      ],
    });

    const customer = await User.create({
      name: 'Anjali Menon',
      email: 'customer@example.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+91 98950 11223',
      addresses: [
        {
          fullName: 'Anjali Menon',
          phone: '+91 98950 11223',
          street: 'Rose Garden, Near Municipal Stand',
          city: 'Palakkad',
          district: 'Palakkad',
          state: 'Kerala',
          pincode: '678001',
          isDefault: true,
        },
      ],
    });

    // 3. Categories
    const categoryMap = new Map();
    for (const cat of initialCategories) {
      const createdCat = await Category.create(cat);
      categoryMap.set(cat.slug, createdCat._id);
    }

    // 4. Products & Variants
    for (const prodData of initialProducts) {
      const categoryId = categoryMap.get(prodData.categorySlug);
      const { variants, categorySlug, ...rest } = prodData;

      const product = await Product.create({
        ...rest,
        categories: categoryId ? [categoryId] : [],
        ratingsAverage: 4.8 + Math.round(Math.random() * 2) / 10,
        ratingsQuantity: Math.floor(Math.random() * 20) + 5,
      });

      for (const v of variants) {
        const discountPercent =
          v.salePrice && v.salePrice < v.price
            ? Math.round(((v.price - v.salePrice) / v.price) * 100)
            : 0;

        await ProductVariant.create({
          productId: product._id,
          sku: v.sku,
          barcode: v.barcode,
          color: v.color,
          colorHex: v.colorHex || '#800020',
          size: v.size,
          price: v.price,
          salePrice: v.salePrice,
          discountPercent,
          stockQuantity: v.stockQuantity,
        });
      }

      await Review.create({
        productId: product._id,
        userId: customer._id,
        userName: 'Lakshmi Nair',
        rating: 5,
        comment: 'Absolutely authentic fabric quality! The zari weave is vibrant and pure. Delivered quickly to Palakkad.',
        isApproved: true,
      });

      await Review.create({
        productId: product._id,
        userName: 'Rahul K. Pillai',
        rating: 5,
        comment: 'Superb craftsmanship and genuine traditional style. Vasantham Group never disappoints!',
        isApproved: true,
      });
    }

    // 5. Coupons
    for (const c of initialCoupons) {
      await Coupon.create(c);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with Malabar heritage catalog and default accounts!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
