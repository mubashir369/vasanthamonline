'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/layout/BrandLogo';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Phone, MessageCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOtp, verifyOtp } = useAuth();

  // Tab state: 'email' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // WhatsApp OTP login state
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  // Common UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for 4 OTP digit boxes
  const otp0Ref = useRef<HTMLInputElement>(null);
  const otp1Ref = useRef<HTMLInputElement>(null);
  const otp2Ref = useRef<HTMLInputElement>(null);
  const otp3Ref = useRef<HTMLInputElement>(null);
  const otpRefs = [otp0Ref, otp1Ref, otp2Ref, otp3Ref];

  // Resend timer countdown effect
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Tab 1: Email & Password submit handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/account/orders');
      }
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  // Tab 2 - Step 1: Send WhatsApp OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    const res = await sendOtp(cleanPhone, 'LOGIN');
    setLoading(false);

    if (res.success) {
      setOtpStep('otp');
      setCountdown(60);
      setOtp(['', '', '', '']);
      setTimeout(() => {
        otp0Ref.current?.focus();
      }, 100);
    } else {
      setError(res.error || 'Failed to send OTP to WhatsApp');
    }
  };

  // Tab 2 - Step 2: Handle OTP input typing and auto-focus
  const handleOtpChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    if (digitsOnly.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = digitsOnly;
      setOtp(newOtp);
      if (index < 3) {
        otpRefs[index + 1].current?.focus();
      }
      return;
    }

    // Handled typed or pasted multiple digits
    if (digitsOnly.length > 1) {
      if (otp[index] && digitsOnly.length === 2) {
        const replacement = digitsOnly.replace(otp[index], '').slice(-1) || digitsOnly.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = replacement;
        setOtp(newOtp);
        if (index < 3) {
          otpRefs[index + 1].current?.focus();
        }
        return;
      }

      const chars = digitsOnly.slice(0, 4).split('');
      const newOtp = [...otp];
      chars.forEach((c, i) => {
        if (index + i < 4) {
          newOtp[index + i] = c;
        }
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + chars.length, 3);
      otpRefs[nextIdx].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const chars = pasted.split('');
    const newOtp = [...otp];
    chars.forEach((c, i) => {
      if (i < 4) newOtp[i] = c;
    });
    setOtp(newOtp);
    const nextIdx = Math.min(chars.length, 3);
    otpRefs[nextIdx].current?.focus();
  };

  // Tab 2 - Step 2: Verify WhatsApp OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter the 4-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    const res = await verifyOtp(cleanPhone, fullOtp, 'LOGIN');
    setLoading(false);

    if (res.success) {
      router.push('/account/orders');
    } else {
      setError(res.error || 'Invalid OTP. Please check and try again.');
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
            Sign In to Your Account
          </h1>
          <p className="text-xs text-neutral-500">
            Access your orders, saved addresses, or management dashboard
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-crimson-700 text-crimson-800 dark:text-gold-300'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email & Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('whatsapp');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-crimson-700 text-crimson-800 dark:text-gold-300'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp OTP</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Tab 1: Email & Password Form */}
        {activeTab === 'email' && (
          <>
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Email Address
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
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Fill Buttons for Testing */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block text-center">
                One-Click Demo Credentials
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@vasantham.com', 'admin123')}
                  className="p-2 rounded-lg border border-crimson-200 dark:border-crimson-900 bg-crimson-50/50 dark:bg-crimson-950/30 text-crimson-800 dark:text-gold-300 font-medium text-[11px] flex items-center justify-center gap-1.5 hover:bg-crimson-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('customer@example.com', 'customer123')}
                  className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] flex items-center justify-center gap-1.5 hover:bg-neutral-100"
                >
                  <User className="w-3.5 h-3.5" /> Customer Demo
                </button>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: WhatsApp OTP Form */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4">
            {otpStep === 'phone' ? (
              /* Step 1: Phone input */
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                    WhatsApp Phone Number
                  </label>
                  <div className="relative flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:ring-1 focus-within:ring-crimson-600 focus-within:border-crimson-600 overflow-hidden">
                    <div className="flex items-center pl-3.5 pr-2.5 gap-1.5 bg-neutral-50 dark:bg-neutral-800/80 border-r border-neutral-200 dark:border-neutral-700 select-none">
                      <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-500 fill-green-600/20" />
                      <span className="font-semibold text-xs text-neutral-700 dark:text-neutral-300">+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="w-full px-3.5 py-2.5 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none text-xs tracking-wider"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-neutral-500">
                    We will send a 4-digit verification code to your WhatsApp number.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, '').length !== 10}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {loading ? 'Sending OTP...' : 'Send WhatsApp OTP'}
                </button>
              </form>
            ) : (
              /* Step 2: OTP verification */
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                  <span>
                    Code sent to <strong className="text-neutral-900 dark:text-neutral-100">+91 {phone}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('phone');
                      setOtp(['', '', '', '']);
                      setError('');
                    }}
                    className="text-crimson-700 dark:text-gold-400 font-semibold hover:underline"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <label className="block text-center text-neutral-700 dark:text-neutral-300 font-semibold mb-2">
                    Enter 4-Digit OTP
                  </label>
                  <div className="flex justify-center gap-3 my-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-14 text-center font-bold text-xl rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-crimson-600 focus:border-crimson-600 transition"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 4}
                  className="w-full py-3 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-lg text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  {countdown > 0 ? (
                    <p className="text-neutral-400 text-xs">
                      Resend OTP in <span className="font-semibold text-neutral-700 dark:text-neutral-300">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSendOtp()}
                      className="text-crimson-700 dark:text-gold-400 font-semibold hover:underline text-xs disabled:opacity-50"
                    >
                      Resend WhatsApp OTP
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Registration Link */}
        <p className="text-center text-xs text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-crimson-700 dark:text-gold-400 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
