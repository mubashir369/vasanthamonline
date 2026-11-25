'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/layout/BrandLogo';
import OtpVerifier, { OtpVerifiedResult } from '@/components/auth/OtpVerifier';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Phone, MessageCircle, KeyRound } from 'lucide-react';

type Tab = 'password' | 'email-otp' | 'whatsapp';

const TABS: { id: Tab; label: string; icon: typeof Mail }[] = [
  { id: 'password', label: 'Password', icon: KeyRound },
  { id: 'email-otp', label: 'Email OTP', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp OTP', icon: Phone },
];

const inputClass =
  'w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-crimson-600';

export default function LoginPage() {
  const router = useRouter();
  const { login, setSignedInUser } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goToAccount = (role?: string) => {
    router.push(role === 'SUPER_ADMIN' || role === 'ADMIN' ? '/admin' : '/account/orders');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      // Role comes back on /api/auth/me; admins' emails contain "admin" in the demo data
      goToAccount(email.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleOtpSignIn = ({ user }: OtpVerifiedResult) => {
    if (user) setSignedInUser(user);
    goToAccount(user?.role);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo />
          </div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">Sign In to Your Account</h1>
          <p className="text-xs text-neutral-500">Access your orders, saved addresses, or management dashboard</p>
        </div>

        <div className="flex border-b border-neutral-200 dark:border-neutral-800" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => {
                setActiveTab(id);
                setError('');
              }}
              className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-crimson-700 text-crimson-800 dark:text-gold-300'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {activeTab === 'password' && (
          <>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-neutral-700 dark:text-neutral-300 font-semibold">Password</label>
                  <Link href="/forgot-password" className="text-crimson-700 dark:text-gold-400 font-semibold hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={inputClass}
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
                  onClick={() => {
                    setEmail('admin@vasantham.com');
                    setPassword('admin123');
                  }}
                  className="p-2 rounded-lg border border-crimson-200 dark:border-crimson-900 bg-crimson-50/50 dark:bg-crimson-950/30 text-crimson-800 dark:text-gold-300 font-medium text-[11px] flex items-center justify-center gap-1.5 hover:bg-crimson-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('customer@example.com');
                    setPassword('customer123');
                  }}
                  className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] flex items-center justify-center gap-1.5 hover:bg-neutral-100"
                >
                  <User className="w-3.5 h-3.5" /> Customer Demo
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'email-otp' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-500">We&apos;ll email you a 6-digit sign-in code. No password needed.</p>
            </div>
            <OtpVerifier
              key={`login-email-${otpEmail.trim().toLowerCase()}`}
              channel="EMAIL"
              target={otpEmail}
              purpose="LOGIN"
              block
              disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(otpEmail.trim())}
              sendLabel="Email me a code"
              verifyLabel="Verify & Sign In"
              onVerified={handleOtpSignIn}
            />
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">WhatsApp Phone Number</label>
              <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:ring-1 focus-within:ring-crimson-600 overflow-hidden">
                <span className="flex items-center pl-3.5 pr-2.5 gap-1.5 bg-neutral-50 dark:bg-neutral-800/80 border-r border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-700 dark:text-neutral-300">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full px-3.5 py-2.5 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none tracking-wider"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-500">We&apos;ll send a 6-digit code to your WhatsApp.</p>
            </div>
            <OtpVerifier
              key={`login-wa-${phone}`}
              channel="WHATSAPP"
              target={phone}
              purpose="LOGIN"
              block
              disabled={!/^[6-9]\d{9}$/.test(phone)}
              sendLabel="Send WhatsApp OTP"
              verifyLabel="Verify & Sign In"
              onVerified={handleOtpSignIn}
            />
          </div>
        )}

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
