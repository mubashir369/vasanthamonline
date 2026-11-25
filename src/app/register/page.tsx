'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/layout/BrandLogo';
import { Lock, Mail, User, Phone, ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, sendOtp, verifyOtp } = useAuth();

  // Email registration state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // WhatsApp quick register state
  const [whatsappMode, setWhatsappMode] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waOtpSent, setWaOtpSent] = useState(false);
  const [waOtp, setWaOtp] = useState(['', '', '', '']);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState('');
  const [waSuccess, setWaSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await register(name, email, password, phone);
    setLoading(false);

    if (res.success) {
      router.push('/account/orders');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  const handleSendWhatsAppOtp = async () => {
    if (!waPhone.trim()) {
      setWaError('Please enter your phone number');
      return;
    }
    setWaLoading(true);
    setWaError('');
    setWaSuccess('');

    const res = await sendOtp(waPhone, 'LOGIN');
    setWaLoading(false);

    if (res.success) {
      setWaOtpSent(true);
      setWaSuccess('OTP sent to your WhatsApp!');
      setResendTimer(60);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } else {
      setWaError(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyWhatsAppOtp = async () => {
    const otpString = waOtp.join('');
    if (otpString.length !== 4) {
      setWaError('Please enter the complete 4-digit OTP');
      return;
    }
    setWaLoading(true);
    setWaError('');
    setWaSuccess('');

    const res = await verifyOtp(waPhone, otpString, 'LOGIN');
    setWaLoading(false);

    if (res.success) {
      router.push('/account/orders');
    } else {
      setWaError(res.error || 'Invalid OTP');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...waOtp];
    newOtp[index] = value;
    setWaOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !waOtp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
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

        {/* Quick WhatsApp Register Toggle */}
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
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anjali Menon"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98950 11223"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Register'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* WhatsApp Quick Register Flow */
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => { setWhatsappMode(false); setWaOtpSent(false); setWaError(''); setWaSuccess(''); }}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1"
            >
              ← Back to email registration
            </button>

            {waError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
                {waError}
              </div>
            )}
            {waSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-600 dark:text-green-400">
                {waSuccess}
              </div>
            )}

            {!waOtpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1 text-xs">
                    WhatsApp Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="98950 11223"
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSendWhatsAppOtp}
                  disabled={waLoading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {waLoading ? 'Sending...' : 'Send WhatsApp OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                  Enter the 4-digit OTP sent to your WhatsApp
                </p>
                <div className="flex justify-center gap-3">
                  {waOtp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-12 text-center text-lg font-bold rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyWhatsAppOtp}
                  disabled={waLoading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {waLoading ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setWaOtpSent(false); setWaOtp(['', '', '', '']); setWaError(''); }}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Change Number
                  </button>
                  {resendTimer > 0 ? (
                    <span className="text-neutral-400">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendWhatsAppOtp}
                      disabled={waLoading}
                      className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}
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
