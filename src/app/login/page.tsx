'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/layout/BrandLogo';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
