'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/layout/BrandLogo';
import OtpVerifier, { OtpChannel } from '@/components/auth/OtpVerifier';
import { ArrowRight, Lock, Mail, MessageCircle } from 'lucide-react';

const inputClass =
  'w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setSignedInUser } = useAuth();

  const [channel, setChannel] = useState<OtpChannel>('EMAIL');
  const [target, setTarget] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmail = channel === 'EMAIL';
  const targetValid = isEmail
    ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(target.trim())
    : /^[6-9]\d{9}$/.test(target);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, target, verificationToken: token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSignedInUser(data.user);
        router.push(data.user?.role === 'CUSTOMER' ? '/account/orders' : '/admin');
      } else {
        setError(data.error || 'Could not reset your password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo />
          </div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reset Your Password</h1>
          <p className="text-xs text-neutral-500">
            {token ? 'Choose a new password for your account.' : 'We’ll send a verification code to confirm it’s you.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!token ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Send code by">
              {(['EMAIL', 'WHATSAPP'] as OtpChannel[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={channel === c}
                  onClick={() => {
                    setChannel(c);
                    setTarget('');
                    setError('');
                  }}
                  className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                    channel === c
                      ? 'border-crimson-700 bg-crimson-50 dark:bg-crimson-950/40 text-crimson-800 dark:text-gold-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {c === 'EMAIL' ? <Mail className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  {c === 'EMAIL' ? 'By email' : 'By WhatsApp'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                {isEmail ? 'Account email address' : 'Account WhatsApp number'}
              </label>
              {isEmail ? (
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
              ) : (
                <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:ring-1 focus-within:ring-crimson-600 overflow-hidden">
                  <span className="flex items-center px-3 bg-neutral-50 dark:bg-neutral-800/80 border-r border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-700 dark:text-neutral-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={target}
                    onChange={(e) => setTarget(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98950 11223"
                    className="w-full px-3.5 py-2.5 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none tracking-wider"
                  />
                </div>
              )}
            </div>

            <OtpVerifier
              key={`reset-${channel}-${target.trim().toLowerCase()}`}
              channel={channel}
              target={target}
              purpose="PASSWORD_RESET"
              block
              disabled={!targetValid}
              sendLabel="Send verification code"
              verifyLabel="Verify code"
              onVerified={({ verificationToken }) => setToken(verificationToken || '')}
            />
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 text-xs">
            {[
              { label: 'New password', value: newPassword, set: setNewPassword },
              { label: 'Confirm new password', value: confirmPassword, set: setConfirmPassword },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">{label}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : 'Save new password'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <p className="text-center text-xs text-neutral-500">
          Remembered it?{' '}
          <Link href="/login" className="text-crimson-700 dark:text-gold-400 font-bold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
