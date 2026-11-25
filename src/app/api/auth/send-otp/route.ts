import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { OtpChannel } from '@/lib/models/Otp';
import { issueOtp, isOtpChannel, isOtpPurpose, normalizeTarget, phoneVariants, OTP_EXPIRY_MINUTES } from '@/lib/otp';

/**
 * POST /api/auth/send-otp
 * Body: { channel: 'EMAIL' | 'WHATSAPP', target: string, purpose }
 * (Legacy body { phone, purpose } is treated as channel WHATSAPP.)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const channel: unknown = body.channel ?? (body.phone ? 'WHATSAPP' : body.email ? 'EMAIL' : undefined);
    const purpose: unknown = body.purpose ?? 'LOGIN';

    if (!isOtpChannel(channel)) {
      return NextResponse.json({ success: false, error: 'Invalid verification channel' }, { status: 400 });
    }
    if (!isOtpPurpose(purpose)) {
      return NextResponse.json({ success: false, error: 'Invalid purpose' }, { status: 400 });
    }
    if (purpose === 'CHECKOUT_VERIFY' && channel !== 'WHATSAPP') {
      return NextResponse.json(
        { success: false, error: 'Checkout is verified with your WhatsApp number' },
        { status: 400 }
      );
    }

    const target = normalizeTarget(channel, body.target ?? body.phone ?? body.email);
    if (!target) {
      return NextResponse.json(
        {
          success: false,
          error: channel === 'EMAIL' ? 'Please enter a valid email address' : 'Please enter a valid 10-digit mobile number',
        },
        { status: 400 }
      );
    }

    const existing = await findUser(channel, target);

    if (purpose === 'REGISTER' && existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            channel === 'EMAIL'
              ? 'An account with this email already exists. Please sign in instead.'
              : 'This WhatsApp number is already registered. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    if (purpose === 'LOGIN' && channel === 'EMAIL' && !existing) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email. Please register first.' },
        { status: 404 }
      );
    }

    // Password reset: don't reveal whether an account exists.
    if (purpose === 'PASSWORD_RESET' && !existing) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a verification code has been sent.',
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      });
    }

    const result = await issueOtp(channel, target, purpose);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: channel === 'EMAIL' ? 'Verification code sent to your email' : 'Verification code sent to your WhatsApp',
      expiresInSeconds: result.expiresInSeconds,
    });
  } catch (error: any) {
    console.error('[send-otp] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send verification code' }, { status: 500 });
  }
}

function findUser(channel: OtpChannel, target: string) {
  return channel === 'EMAIL'
    ? User.findOne({ email: target }).select('_id').lean()
    : User.findOne({ phone: { $in: phoneVariants(target) } }).select('_id').lean();
}
