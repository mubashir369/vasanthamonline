import mongoose, { Schema, Document, Model } from 'mongoose';

export type OtpChannel = 'EMAIL' | 'WHATSAPP';
export type OtpPurpose = 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET' | 'CHECKOUT_VERIFY';

export const OTP_CHANNELS: OtpChannel[] = ['EMAIL', 'WHATSAPP'];
export const OTP_PURPOSES: OtpPurpose[] = ['LOGIN', 'REGISTER', 'PASSWORD_RESET', 'CHECKOUT_VERIFY'];

export interface IOtp extends Document {
  channel: OtpChannel;
  /** Normalized email address or phone number (digits with country code) */
  target: string;
  purpose: OtpPurpose;
  /** SHA-256 hash of the code; the plain code is never stored */
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    channel: { type: String, enum: OTP_CHANNELS, required: true },
    target: { type: String, required: true, trim: true },
    purpose: { type: String, enum: OTP_PURPOSES, required: true },
    codeHash: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index – auto-deletes expired codes
    },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OtpSchema.index({ channel: 1, target: 1, purpose: 1, createdAt: -1 });

// The schema changed (phone -> channel/target, plain otp -> codeHash); drop any cached
// model from hot reload so the new schema is used.
if (mongoose.models.Otp && !mongoose.models.Otp.schema.path('codeHash')) {
  mongoose.deleteModel('Otp');
}

export const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default Otp;
