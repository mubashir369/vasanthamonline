import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
  phone: string;
  otp: string;
  purpose: 'LOGIN' | 'CHECKOUT_VERIFY';
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['LOGIN', 'CHECKOUT_VERIFY'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index – auto-deletes expired docs
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups
OtpSchema.index({ phone: 1, purpose: 1, verified: 1 });

export const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default Otp;
