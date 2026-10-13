import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vasantham';

// Schemas
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
    phone: { type: String },
    addresses: [
      {
        fullName: String,
        phone: String,
        street: String,
        landmark: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
        isDefault: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    description: String,
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    designNumber: String,
    styleNumber: String,
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    audience: { type: String, required: true },
    fabricType: { type: String, default: 'Silk' },
    fabricCare: String,
    images: [String],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    hasVariants: { type: Boolean, default: true },
    ratingsAverage: { type: Number, default: 4.8 },
    ratingsQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductVariantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true },
    barcode: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    colorHex: String,
    size: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: Number,
    discountPercent: { type: Number, default: 0 },
    stockQuantity: { type: Number, required: true, default: 0 },
    images: [String],
  },
  { timestamps: true }
);

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: Number,
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 500 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StoreSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Vasantham Group' },
    tagline: { type: String, default: 'Where elegance is woven with tradition.' },
    address: {
      type: String,
      default: 'OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582',
    },
    contactPhone: { type: String, default: '+91 94471 23456' },
    contactEmail: { type: String, default: 'info@vasanthamgroup.com' },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#7E121D' },
    secondaryColor: { type: String, default: '#D4AF37' },
    aboutText: {
      type: String,
      default:
        'Welcome to Vasantham Group — Malabar’s largest textile and fashion network, where tradition meets modern elegance. For generations, Vasantham has been a trusted name in the world of textiles. What began as a humble journey in Palakkad has now grown into one of Malabar’s most beloved destinations for premium fabrics, ethnic wear, and family fashion. At Vasantham Group, we take pride in offering an exquisite range of silk sarees, cotton wear, and designer fabrics — each piece crafted to perfection, blending timeless craftsmanship with contemporary design. Our mission is simple — to make elegant, high-quality fashion affordable for every family. From festive attire to daily wear, we bring you collections that celebrate comfort, culture, and class. Beyond fabrics, we believe in experiences — a warm, welcoming shopping atmosphere where every customer feels valued. Whether you visit our stores or connect with us online, we promise authenticity, quality, and a touch of heritage in every interaction. Vasantham Group — Where elegance is woven with tradition.',
    },
    freeDeliveryRadiusKm: { type: Number, default: 15 },
    freeDeliveryMinAmount: { type: Number, default: 1999 },
    baseCourierCharge: { type: Number, default: 80 },
    storeLat: { type: Number, default: 10.9889 },
    storeLng: { type: Number, default: 76.4589 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const ProductVariant = mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const StoreSettings = mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);

import { initialCategories, initialProducts, initialCoupons } from './seedData.mjs';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully.');

  // Clean collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    ProductVariant.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
    StoreSettings.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // 1. Store Settings
  await StoreSettings.create({});
  console.log('Default StoreSettings created for Mannarkkad, Palakkad.');

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
  console.log('Seeded Users: Super Admin (admin@vasantham.com) and Customer (customer@example.com)');

  // 3. Categories
  const categoryMap = new Map();
  for (const cat of initialCategories) {
    const createdCat = await Category.create(cat);
    categoryMap.set(cat.slug, createdCat._id);
  }
  console.log(`Seeded ${categoryMap.size} categories.`);

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

    // Add 2 reviews per product
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
  console.log(`Seeded ${initialProducts.length} heritage products with multiple variants and reviews.`);

  // 5. Coupons
  for (const c of initialCoupons) {
    await Coupon.create(c);
  }
  console.log(`Seeded ${initialCoupons.length} coupons.`);

  console.log('Seeding complete! Database is ready.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
