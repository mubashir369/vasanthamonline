import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword, signedInResponse } from '@/lib/auth';
import { isOtpChannel, isValidVerificationToken, normalizeTarget, phoneVariants } from '@/lib/otp';

/**
 * POST /api/auth/reset-password
 * Body: { channel: 'EMAIL' | 'WHATSAPP', target, verificationToken, newPassword }
 * verificationToken comes from /api/auth/verify-otp with purpose PASSWORD_RESET.
 * On success the customer is signed in with the new password set.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { channel, target: rawTarget, verificationToken, newPassword } = await req.json();

    if (!isOtpChannel(channel)) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const target = normalizeTarget(channel, rawTarget);
    if (!target || !isValidVerificationToken(verificationToken, channel, target, 'PASSWORD_RESET')) {
      return NextResponse.json(
        { success: false, error: 'Your verification has expired. Please request a new code.' },
        { status: 403 }
      );
    }

    const user =
      channel === 'EMAIL'
        ? await User.findOne({ email: target })
        : await User.findOne({ phone: { $in: phoneVariants(target) } });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }
    if (!user.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'This account signs in with WhatsApp OTP only and has no password. Use the WhatsApp OTP sign-in.',
        },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(newPassword);
    if (channel === 'EMAIL') user.emailVerified = true;
    else user.phoneVerified = true;
    if (user.authMethod === 'WHATSAPP') user.authMethod = 'BOTH';
    await user.save();

    return signedInResponse(user);
  } catch (error: any) {
    console.error('[reset-password] Error:', error);
    return NextResponse.json({ success: false, error: 'Could not reset password' }, { status: 500 });
  }
}
