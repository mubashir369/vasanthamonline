import mongoose, { Schema, Document, Model } from 'mongoose';

export type AudienceType = 'men' | 'women' | 'girls' | 'boys' | 'ladies' | 'gents';
export type FabricType = 'Silk' | 'Cotton' | 'Designer' | 'Ethnic' | 'Linen' | 'Georgette';

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  designNumber?: string;
  styleNumber?: string;
  categories: mongoose.Types.ObjectId[];
  audience: AudienceType;
  fabricType: FabricType;
  fabricCare?: string;
  images: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  hasVariants: boolean;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    designNumber: { type: String, trim: true, index: true },
    styleNumber: { type: String, trim: true, index: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category', index: true }],
    audience: {
      type: String,
      enum: ['men', 'women', 'girls', 'boys', 'ladies', 'gents'],
      required: true,
      index: true,
    },
    fabricType: {
      type: String,
      enum: ['Silk', 'Cotton', 'Designer', 'Ethnic', 'Linen', 'Georgette'],
      default: 'Silk',
      index: true,
    },
    fabricCare: {
      type: String,
      default: 'Dry clean recommended for silk and delicate handlooms. Gentle hand wash in cold water for cottons.',
    },
    images: [{ type: String }],
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    hasVariants: { type: Boolean, default: true },
    ratingsAverage: { type: Number, default: 4.8, min: 1, max: 5 },
    ratingsQuantity: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Search text index
ProductSchema.index({ title: 'text', description: 'text', designNumber: 'text', styleNumber: 'text' });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
