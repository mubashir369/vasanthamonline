'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Mail, MessageCircle } from 'lucide-react';

export type OtpChannel = 'EMAIL' | 'WHATSAPP';
export type OtpPurpose = 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET' | 'CHECKOUT_VERIFY';

export interface OtpVerifiedResult {
  /** Present for REGISTER / PASSWORD_RESET / CHECKOUT_VERIFY */
  verificationToken?: string;
  /** Present for LOGIN (the session cookie is already set) */
  user?: any;
}

interface OtpVerifierProps {
  channel: OtpChannel;
  /** Email address or phone number the code is sent to */
  target: string;
  purpose: OtpPurpose;
  onVerified: (result: OtpVerifiedResult) => void;
  /** Shows the verified state instead of the controls */
  verified?: boolean;
  /** Text for the first button, e.g. "Send code" */
  sendLabel?: string;
  /** Text for the verify button */
  verifyLabel?: string;
  /** Stretch the buttons to full width (stand-alone forms) */
  block?: boolean;
  disabled?: boolean;
}

const CODE_LENGTH = 6;

/**
 * Send-code / enter-code / resend widget for email and WhatsApp OTP.
 * Re-mount it (change its `key`) when the target changes to reset it.
 */
export default function OtpVerifier({
  channel,
  target,
  purpose,
  onVerified,
  verified = false,
  sendLabel,
  verifyLabel = 'Verify',
  block = false,
  disabled = false,
}: OtpVerifierProps) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState<'send' | 'verify' | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const isEmail = channel === 'EMAIL';
  const Icon = isEmail ? Mail : MessageCircle;
  const destination = isEmail ? 'email' : 'WhatsApp';
  const accent = isEmail
    ? 'bg-crimson-800 hover:bg-crimson-900 text-gold-300'
    : 'bg-green-600 hover:bg-green-700 text-white';

  const sendCode = async () => {
    if (!target.trim() || loading) return;
    setLoading('send');
    setError('');
    setInfo('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, target: target.trim(), purpose }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setCode('');
        setCountdown(45);
        setInfo(data.message || `Code sent to your ${destination}`);
        setTimeout(() => codeRef.current?.focus(), 50);
      } else {
        setError(data.error || 'Could not send the code. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(null);
    }
  };

  const verifyCode = async () => {
    if (code.length !== CODE_LENGTH || loading) return;
    setLoading('verify');
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, target: target.trim(), purpose, otp: code }),
      });
      const data = await res.json();
      if (data.success) {
        setInfo('');
        onVerified({ verificationToken: data.verificationToken, user: data.user });
      } else {
        setError(data.error || 'Incorrect code. Please try again.');
        setCode('');
        codeRef.current?.focus();
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(null);
    }
  };

  if (verified) {
    return (
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {isEmail ? 'Email verified' : 'WhatsApp number verified'}
      </p>
    );
  }

  const buttonBase = `${block ? 'w-full py-3 uppercase tracking-wider font-bold' : 'px-3 py-2 font-semibold'} rounded-lg text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap`;

  return (
    <div className="space-y-2 text-xs">
      {!sent ? (
        <button
          type="button"
          onClick={sendCode}
          disabled={disabled || !target.trim() || loading !== null}
          className={`${buttonBase} ${accent}`}
        >
          {loading === 'send' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
          {loading === 'send' ? 'Sending...' : sendLabel || `Send code to ${destination}`}
        </button>
      ) : (
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-neutral-600 dark:text-neutral-300">
              {info || `Code sent to your ${destination}`}
            </span>
            {countdown > 0 ? (
              <span className="text-neutral-400 shrink-0">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={sendCode}
                disabled={loading !== null}
                className="shrink-0 font-semibold text-crimson-700 dark:text-gold-400 hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`${CODE_LENGTH}-digit verification code`}
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH));
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // don't submit the surrounding form
                  verifyCode();
                }
              }}
              placeholder="••••••"
              className="w-32 px-3 py-2 text-center tracking-[0.4em] text-sm font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-crimson-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={verifyCode}
              disabled={code.length !== CODE_LENGTH || loading !== null}
              className={`flex-1 px-3 py-2 font-semibold rounded-lg text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 ${accent}`}
            >
              {loading === 'verify' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading === 'verify' ? 'Verifying...' : verifyLabel}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
