import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Otp from '@/lib/models/Otp';
import User from '@/lib/models/User';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { normalizePhone } from '@/lib/msg91';

const MAX_VERIFY_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, otp, purpose = 'LOGIN' } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone and OTP are required' },
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

    // Find the most recent un-verified OTP for this phone+purpose
    const otpRecord = await Otp.findOne({
      phone: normalizedPhone,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'OTP expired or not found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_VERIFY_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = MAX_VERIFY_ATTEMPTS - otpRecord.attempts;
      return NextResponse.json(
        {
          success: false,
          error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        },
        { status: 401 }
      );
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // ---- CHECKOUT_VERIFY: Just confirm phone is verified ----
    if (purpose === 'CHECKOUT_VERIFY') {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Phone number verified successfully',
      });
    }

    // ---- LOGIN: Find or create user, issue JWT ----
    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      // Auto-create new user with phone
      const phoneSuffix = normalizedPhone.slice(-4);
      user = await User.create({
        name: `User ${phoneSuffix}`,
        phone: normalizedPhone,
        email: undefined,
        passwordHash: undefined,
        role: 'CUSTOMER',
        authMethod: 'WHATSAPP',
        addresses: [],
      });
    } else if (user.authMethod === 'EMAIL') {
      // User exists with email auth, upgrade to BOTH
      user.authMethod = 'BOTH';
      await user.save();
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email || '',
      role: user.role as 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER',
      name: user.name,
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || '',
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[verify-otp] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
