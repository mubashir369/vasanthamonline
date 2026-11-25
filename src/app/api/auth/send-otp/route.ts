import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Otp from '@/lib/models/Otp';
import { sendWhatsAppOTP, generateOTP, normalizePhone } from '@/lib/msg91';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTPS_PER_WINDOW = 3; // Max OTPs per phone per 10 minutes
const RATE_LIMIT_WINDOW_MINUTES = 10;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, purpose = 'LOGIN' } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!['LOGIN', 'CHECKOUT_VERIFY'].includes(purpose)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purpose' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Rate limiting: check how many OTPs were sent in the last 10 minutes
    const rateLimitCutoff = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    );
    const recentOtpCount = await Otp.countDocuments({
      phone: normalizedPhone,
      purpose,
      createdAt: { $gte: rateLimitCutoff },
    });

    if (recentOtpCount >= MAX_OTPS_PER_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many OTP requests. Please wait ${RATE_LIMIT_WINDOW_MINUTES} minutes before trying again.`,
        },
        { status: 429 }
      );
    }

    // Invalidate any previous un-verified OTPs for this phone+purpose
    await Otp.deleteMany({
      phone: normalizedPhone,
      purpose,
      verified: false,
    });

    // Generate and store new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.create({
      phone: normalizedPhone,
      otp,
      purpose,
      expiresAt,
      verified: false,
      attempts: 0,
    });

    // Send via MSG91 WhatsApp
    const sendResult = await sendWhatsAppOTP(normalizedPhone, otp);

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your WhatsApp',
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error: any) {
    console.error('[send-otp] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
