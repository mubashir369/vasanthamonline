'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/layout/BrandLogo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Star,
  Settings,
  Store,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-crimson-700 border-t-gold-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-neutral-400">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Analytics Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products & Variants', href: '/admin/products', icon: Package },
    { label: 'Customer Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    { label: 'Review Moderation', href: '/admin/reviews', icon: Star },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col md:flex-row transition-colors font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <BrandLogo storeName="Vasantham Admin" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-neutral-700 dark:text-neutral-200"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-neutral-300 flex flex-col justify-between border-r border-neutral-800 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <BrandLogo storeName="Vasantham Group" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-neutral-400 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-2 bg-crimson-950/80 border border-gold-500/30 rounded-lg flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <div>
              <span className="font-bold text-white block">{user.name}</span>
              <span className="text-[10px] text-gold-300 uppercase tracking-wider font-mono">
                {user.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-crimson-800 text-gold-300 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2 text-xs">
          <a
            href="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition font-medium"
          >
            <Store className="w-4 h-4 text-gold-400" /> Back to Storefront
          </a>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-neutral-800 transition font-medium"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <span className="uppercase tracking-wider">Vasantham Management</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100 capitalize">
              {pathname.replace('/admin', '') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="/"
              target="_blank"
              className="text-xs font-semibold text-crimson-700 dark:text-gold-400 hover:underline flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" /> View Live Store
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
