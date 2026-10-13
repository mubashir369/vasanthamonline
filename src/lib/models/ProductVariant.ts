import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  barcode: string;
  color: string;
  colorHex?: string;
  size: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  stockQuantity: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    barcode: { type: String, required: true, unique: true, trim: true, index: true },
    color: { type: String, required: true, trim: true },
    colorHex: { type: String, default: '#7E121D' },
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Auto calculate discount percentage before save if salePrice exists
ProductVariantSchema.pre('save', function (next) {
  if (this.salePrice && this.salePrice < this.price) {
    this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
  } else {
    this.discountPercent = 0;
  }
  next();
});

export const ProductVariant: Model<IProductVariant> =
  mongoose.models.ProductVariant ||
  mongoose.model<IProductVariant>('ProductVariant', ProductVariantSchema);

export default ProductVariant;
