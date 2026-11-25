/**
 * One-time-password service shared by email and WhatsApp verification.
 *
 * Flow: issueOtp() sends a 6-digit code -> checkOtp() validates it ->
 * signVerificationToken() returns a short-lived token proving the email/phone
 * was verified for one purpose (REGISTER, PASSWORD_RESET, CHECKOUT_VERIFY).
 * The API that finishes the action calls isValidVerificationToken() before acting.
 */
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Otp, { OtpChannel, OtpPurpose, OTP_CHANNELS, OTP_PURPOSES } from '@/lib/models/Otp';
import { JWT_SECRET } from '@/lib/auth';
import { sendWhatsAppOTP, generateOTP, normalizePhone } from '@/lib/msg91';
import { sendEmailOTP } from '@/lib/mailer';

export const OTP_EXPIRY_MINUTES = 10;
export const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_SENDS_PER_WINDOW = 5;
/** Separate key so a verification token can never be used as a login session token. */
const VERIFY_TOKEN_SECRET = crypto.createHmac('sha256', JWT_SECRET).update('otp-verification-token').digest('hex');
const SEND_WINDOW_MINUTES = 30;

/** How long a "verified" token stays valid after the code is entered. */
const TOKEN_TTL: Record<OtpPurpose, string> = {
  LOGIN: '10m', // not used: LOGIN signs the user in directly
  REGISTER: '30m',
  PASSWORD_RESET: '15m',
  CHECKOUT_VERIFY: '60m', // long enough to finish an online payment
};

export type OtpResult = { ok: true } | { ok: false; error: string; status: number };

export function isOtpChannel(v: unknown): v is OtpChannel {
  return typeof v === 'string' && (OTP_CHANNELS as string[]).includes(v);
}

export function isOtpPurpose(v: unknown): v is OtpPurpose {
  return typeof v === 'string' && (OTP_PURPOSES as string[]).includes(v);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns the normalized email/phone, or null if it isn't valid for the channel. */
export function normalizeTarget(channel: OtpChannel, raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  if (channel === 'EMAIL') {
    const email = raw.trim().toLowerCase();
    return EMAIL_RE.test(email) && email.length <= 254 ? email : null;
  }
  const phone = normalizePhone(raw);
  // Indian mobile numbers: 91 + 10 digits starting 6-9
  return /^91[6-9]\d{9}$/.test(phone) ? phone : null;
}

/**
 * Ways a normalized phone ("919895011223") may have been stored on older accounts,
 * for use in `User.findOne({ phone: { $in: phoneVariants(p) } })`.
 */
export function phoneVariants(normalized: string): string[] {
  const local = normalized.slice(2);
  return [normalized, local, `+${normalized}`, `+91 ${local}`, `0${local}`];
}

function hashCode(channel: OtpChannel, target: string, purpose: OtpPurpose, code: string) {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${channel}:${target}:${purpose}:${code}`)
    .digest('hex');
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Creates, stores (hashed) and sends a new code, enforcing resend cooldown and rate limits. */
export async function issueOtp(
  channel: OtpChannel,
  target: string,
  purpose: OtpPurpose
): Promise<OtpResult & { expiresInSeconds?: number }> {
  const now = Date.now();
  const recent = await Otp.find({
    channel,
    target,
    purpose,
    createdAt: { $gte: new Date(now - SEND_WINDOW_MINUTES * 60 * 1000) },
  })
    .sort({ createdAt: -1 })
    .select('createdAt')
    .lean();

  if (recent.length > 0) {
    const secondsSinceLast = (now - new Date(recent[0].createdAt).getTime()) / 1000;
    if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast);
      return { ok: false, status: 429, error: `Please wait ${wait}s before requesting another code.` };
    }
  }
  if (recent.length >= MAX_SENDS_PER_WINDOW) {
    return {
      ok: false,
      status: 429,
      error: `Too many codes requested. Please try again in ${SEND_WINDOW_MINUTES} minutes.`,
    };
  }

  const code = generateOTP();
  const record = await Otp.create({
    channel,
    target,
    purpose,
    codeHash: hashCode(channel, target, purpose, code),
    expiresAt: new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000),
    attempts: 0,
  });

  const sent =
    channel === 'EMAIL'
      ? await sendEmailOTP(target, code, purpose, OTP_EXPIRY_MINUTES)
      : await sendWhatsAppOTP(target, code);

  if (!sent.success) {
    // Don't count a failed send against the customer's rate limit.
    await Otp.deleteOne({ _id: record._id });
    return { ok: false, status: 502, error: sent.message };
  }

  return { ok: true, expiresInSeconds: OTP_EXPIRY_MINUTES * 60 };
}

/** Checks a code against the latest one sent. On success all codes for this target+purpose are removed. */
export async function checkOtp(
  channel: OtpChannel,
  target: string,
  purpose: OtpPurpose,
  code: unknown
): Promise<OtpResult> {
  const cleanCode = typeof code === 'string' ? code.replace(/\D/g, '') : '';
  if (cleanCode.length !== 6) {
    return { ok: false, status: 400, error: 'Please enter the 6-digit code.' };
  }

  const record = await Otp.findOne({
    channel,
    target,
    purpose,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return { ok: false, status: 400, error: 'Code expired or not found. Please request a new one.' };
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await Otp.deleteMany({ channel, target, purpose });
    return { ok: false, status: 429, error: 'Too many wrong attempts. Please request a new code.' };
  }

  if (!safeEqual(record.codeHash, hashCode(channel, target, purpose, cleanCode))) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
    return {
      ok: false,
      status: 401,
      error:
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`
          : 'Too many wrong attempts. Please request a new code.',
    };
  }

  await Otp.deleteMany({ channel, target, purpose });
  return { ok: true };
}

type VerificationClaims = { typ: 'otp-verified'; channel: OtpChannel; target: string; purpose: OtpPurpose };

export function signVerificationToken(channel: OtpChannel, target: string, purpose: OtpPurpose): string {
  const claims: VerificationClaims = { typ: 'otp-verified', channel, target, purpose };
  return jwt.sign(claims, VERIFY_TOKEN_SECRET, { expiresIn: TOKEN_TTL[purpose] as jwt.SignOptions['expiresIn'] });
}

/** True if the token proves `target` was verified over `channel` for `purpose`. */
export function isValidVerificationToken(
  token: unknown,
  channel: OtpChannel,
  target: string,
  purpose: OtpPurpose
): boolean {
  if (typeof token !== 'string' || !token) return false;
  try {
    const claims = jwt.verify(token, VERIFY_TOKEN_SECRET) as Partial<VerificationClaims>;
    return (
      claims.typ === 'otp-verified' &&
      claims.channel === channel &&
      claims.target === target &&
      claims.purpose === purpose
    );
  } catch {
    return false;
  }
}
