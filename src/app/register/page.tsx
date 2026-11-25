'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/layout/BrandLogo';
import OtpVerifier from '@/components/auth/OtpVerifier';
import { Lock, Mail, User, ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';

const inputClass =
  'w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600 disabled:opacity-70';

export default function RegisterPage() {
  const router = useRouter();
  const { register, setSignedInUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [emailToken, setEmailToken] = useState('');
  const [phoneToken, setPhoneToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // WhatsApp quick register
  const [whatsappMode, setWhatsappMode] = useState(false);
  const [waPhone, setWaPhone] = useState('');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const canSubmit = name.trim() && emailToken && phoneToken && password.length >= 6 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToken || !phoneToken) {
      setError('Please verify both your email and WhatsApp number first.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await register({ name, email, password, phone, emailToken, phoneToken });
    setLoading(false);
    if (res.success) {
      router.push('/account/orders');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo />
          </div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Create Customer Account
          </h1>
          <p className="text-xs text-neutral-500">
            Join the Vasantham family to track orders and save your favorites
          </p>
        </div>

        {!whatsappMode ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setWhatsappMode(true)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider shadow transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Quick Register with WhatsApp
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Or register with email
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anjali Menon"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailToken('');
                    }}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                <OtpVerifier
                  key={`email-${email.trim().toLowerCase()}`}
                  channel="EMAIL"
                  target={email}
                  purpose="REGISTER"
                  disabled={!emailValid}
                  sendLabel="Send code to email"
                  verified={Boolean(emailToken)}
                  onVerified={({ verificationToken }) => setEmailToken(verificationToken || '')}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold">WhatsApp Number *</label>
                <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:ring-1 focus-within:ring-crimson-600 overflow-hidden">
                  <span className="flex items-center gap-1.5 pl-3.5 pr-2.5 bg-neutral-50 dark:bg-neutral-800/80 border-r border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-700 dark:text-neutral-300">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setPhoneToken('');
                    }}
                    placeholder="98950 11223"
                    className="w-full px-3.5 py-2.5 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none tracking-wider"
                  />
                </div>
                <OtpVerifier
                  key={`phone-${phone}`}
                  channel="WHATSAPP"
                  target={phone}
                  purpose="REGISTER"
                  disabled={!phoneValid}
                  sendLabel="Send code to WhatsApp"
                  verified={Boolean(phoneToken)}
                  onVerified={({ verificationToken }) => setPhoneToken(verificationToken || '')}
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Create Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Register'} <ArrowRight className="w-4 h-4" />
              </button>
              {(!emailToken || !phoneToken) && (
                <p className="text-center text-[11px] text-neutral-500">
                  Verify your email and WhatsApp number to finish registering.
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <button
              type="button"
              onClick={() => setWhatsappMode(false)}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1"
            >
              ← Back to email registration
            </button>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">WhatsApp Phone Number</label>
              <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:ring-1 focus-within:ring-green-500 overflow-hidden">
                <span className="flex items-center px-3 bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98950 11223"
                  className="flex-1 px-3.5 py-2.5 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none tracking-wider"
                />
              </div>
            </div>

            <OtpVerifier
              key={`wa-${waPhone}`}
              channel="WHATSAPP"
              target={waPhone}
              purpose="LOGIN"
              block
              disabled={!/^[6-9]\d{9}$/.test(waPhone)}
              sendLabel="Send WhatsApp OTP"
              verifyLabel="Verify & Create Account"
              onVerified={({ user }) => {
                if (user) setSignedInUser(user);
                router.push('/account/orders');
              }}
            />
            <p className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              No password needed – you&apos;ll sign in with a WhatsApp code.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="text-crimson-700 dark:text-gold-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
