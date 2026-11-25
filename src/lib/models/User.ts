import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email?: string;
  passwordHash?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
  phone?: string;
  authMethod: 'EMAIL' | 'WHATSAPP' | 'BOTH';
  emailVerified: boolean;
  phoneVerified: boolean;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, default: 'Kerala' },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values while keeping unique constraint for non-null
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String }, // Optional for WhatsApp-only users
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'],
      default: 'CUSTOMER',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    authMethod: {
      type: String,
      enum: ['EMAIL', 'WHATSAPP', 'BOTH'],
      default: 'EMAIL',
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
