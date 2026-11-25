import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { signedInResponse } from '@/lib/auth';
import {
  checkOtp,
  isOtpChannel,
  isOtpPurpose,
  normalizeTarget,
  phoneVariants,
  signVerificationToken,
} from '@/lib/otp';

/**
 * POST /api/auth/verify-otp
 * Body: { channel: 'EMAIL' | 'WHATSAPP', target: string, otp: string, purpose }
 *
 * LOGIN            -> signs the user in (sets the session cookie).
 * REGISTER / PASSWORD_RESET / CHECKOUT_VERIFY
 *                  -> returns { verificationToken } to send with the final request.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const channel: unknown = body.channel ?? (body.phone ? 'WHATSAPP' : body.email ? 'EMAIL' : undefined);
    const purpose: unknown = body.purpose ?? 'LOGIN';

    if (!isOtpChannel(channel) || !isOtpPurpose(purpose)) {
      return NextResponse.json({ success: false, error: 'Invalid verification request' }, { status: 400 });
    }

    const target = normalizeTarget(channel, body.target ?? body.phone ?? body.email);
    if (!target) {
      return NextResponse.json({ success: false, error: 'Invalid email or phone number' }, { status: 400 });
    }

    const result = await checkOtp(channel, target, purpose, body.otp);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    if (purpose !== 'LOGIN') {
      return NextResponse.json({
        success: true,
        verified: true,
        verificationToken: signVerificationToken(channel, target, purpose),
      });
    }

    // ---- LOGIN ----
    if (channel === 'EMAIL') {
      const user = await User.findOne({ email: target });
      if (!user) {
        return NextResponse.json({ success: false, error: 'No account found with this email' }, { status: 404 });
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
      return signedInResponse(user);
    }

    // WhatsApp login: sign in, or create a WhatsApp-only account on first use.
    let user = await User.findOne({ phone: { $in: phoneVariants(target) } });
    if (!user) {
      user = await User.create({
        name: `Customer ${target.slice(-4)}`,
        phone: target,
        role: 'CUSTOMER',
        authMethod: 'WHATSAPP',
        phoneVerified: true,
        addresses: [],
      });
    } else {
      user.phone = target; // store older accounts' numbers in normalized form
      user.phoneVerified = true;
      if (user.authMethod === 'EMAIL') user.authMethod = 'BOTH';
      await user.save();
    }
    return signedInResponse(user);
  } catch (error: any) {
    console.error('[verify-otp] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify code' }, { status: 500 });
  }
}
