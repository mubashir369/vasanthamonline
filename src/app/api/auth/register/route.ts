import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword, signedInResponse } from '@/lib/auth';
import { isValidVerificationToken, normalizeTarget, phoneVariants } from '@/lib/otp';

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone, emailToken, phoneToken }
 * emailToken / phoneToken come from /api/auth/verify-otp with purpose REGISTER.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, phone, emailToken, phoneToken } = await req.json();

    if (!name?.trim() || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, WhatsApp number and password are required' },
        { status: 400 }
      );
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeTarget('EMAIL', email);
    const normalizedPhone = normalizeTarget('WHATSAPP', phone);
    if (!normalizedEmail || !normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email and 10-digit WhatsApp number' },
        { status: 400 }
      );
    }

    if (!isValidVerificationToken(emailToken, 'EMAIL', normalizedEmail, 'REGISTER')) {
      return NextResponse.json(
        { success: false, error: 'Please verify your email address with the code we sent' },
        { status: 403 }
      );
    }
    if (!isValidVerificationToken(phoneToken, 'WHATSAPP', normalizedPhone, 'REGISTER')) {
      return NextResponse.json(
        { success: false, error: 'Please verify your WhatsApp number with the code we sent' },
        { status: 403 }
      );
    }

    if (await User.exists({ email: normalizedEmail })) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    if (await User.exists({ phone: { $in: phoneVariants(normalizedPhone) } })) {
      return NextResponse.json(
        { success: false, error: 'This WhatsApp number is already registered. Please sign in instead.' },
        { status: 409 }
      );
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      phone: normalizedPhone,
      role: 'CUSTOMER',
      authMethod: 'BOTH',
      emailVerified: true,
      phoneVerified: true,
      addresses: [],
    });

    return signedInResponse(user);
  } catch (error: any) {
    console.error('[register] Error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
