'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Package,
  LogOut,
  MapPin,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  initialSettings?: {
    storeName: string;
    tagline: string;
    address: string;
    contactPhone: string;
    logoUrl?: string;
  };
}

export default function Header({ initialSettings }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();

  const [settings, setSettings] = useState(
    initialSettings || {
      storeName: 'Vasantham Group',
      tagline: 'Where elegance is woven with tradition.',
      address: 'OPP. MY G Future, Main road Mannarkkad, PALAKKAD',
      contactPhone: '+91 94471 23456',
      logoUrl: '',
    }
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'All Collections', href: '/catalog' },
    { label: 'Silk Sarees', href: '/catalog?category=silk-sarees' },
    { label: 'Kerala Kasavu', href: '/catalog?category=kerala-kasavu' },
    { label: 'Women', href: '/catalog?audience=women,ladies' },
    { label: 'Men', href: '/catalog?audience=men,gents' },
    { label: 'Kids', href: '/catalog?audience=girls,boys' },
    { label: 'Cotton Wear', href: '/catalog?fabricType=Cotton' },
    { label: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors shadow-sm">
      {/* Top Heritage Announcement Bar */}
      <div className="bg-gradient-to-r from-crimson-900 via-crimson-950 to-crimson-900 text-gold-300 text-xs py-1.5 px-4 text-center border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-gold-200/80">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span>Store: {settings.address}</span>
          </div>
          <div className="mx-auto md:mx-0 font-medium tracking-wide">
            ✨ Free Kerala Delivery on Orders Above ₹1,999 • Store Pickup at Mannarkkad (₹0)
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-gold-200/80">
            <Link href="/track-order" className="hover:text-gold-200 underline">
              Track Order
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gold-200">
              Contact: {settings.contactPhone}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <BrandLogo
              storeName={settings.storeName}
              tagline={settings.tagline}
              logoUrl={settings.logoUrl}
            />
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search silk sarees, kasavu mundu, kurtas, style #..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-crimson-600 dark:focus:ring-gold-400 transition"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-crimson-800 hover:bg-crimson-900 text-gold-300 text-xs font-semibold rounded-full transition"
            >
              Search
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-neutral-600 hover:text-crimson-700 dark:text-neutral-300 dark:hover:text-gold-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 relative transition"
              aria-label="Wishlist"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-crimson-700 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-neutral-600 hover:text-crimson-700 dark:text-neutral-300 dark:hover:text-gold-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 relative transition"
              aria-label="Shopping Cart"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-neutral-950 font-bold rounded-full text-[10px] flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1.5 pl-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-crimson-600 dark:hover:border-gold-400 transition"
                  >
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 max-w-[100px] truncate hidden sm:inline">
                      {user.name}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-crimson-800 text-gold-300 flex items-center justify-center text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-2 z-50 animate-fade-in"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                        {user.role !== 'CUSTOMER' && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-crimson-100 dark:bg-crimson-950/80 text-crimson-800 dark:text-gold-300 text-[10px] font-bold rounded">
                            {user.role}
                          </span>
                        )}
                      </div>

                      {/* Admin Links */}
                      {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-crimson-700 dark:text-gold-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Portal
                        </Link>
                      )}

                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Package className="w-4 h-4" /> My Orders
                      </Link>

                      <Link
                        href="/account/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <UserIcon className="w-4 h-4" /> Profile & Addresses
                      </Link>

                      <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-crimson-800 hover:bg-crimson-900 text-gold-300 shadow-sm transition"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Secondary Category Navigation */}
        <nav className="hidden md:flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 py-2.5">
          <ul className="flex items-center space-x-7 text-xs font-semibold tracking-wide uppercase">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-neutral-700 dark:text-neutral-300 hover:text-crimson-800 dark:hover:text-gold-400 transition-colors pb-1"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/track-order"
            className="text-xs font-medium text-crimson-700 dark:text-gold-400 hover:underline flex items-center gap-1"
          >
            <Package className="w-3.5 h-3.5" /> Track Delivery
          </Link>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-4 space-y-4 animate-fade-in shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </form>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-crimson-50 dark:hover:bg-neutral-700 hover:text-crimson-700"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="text-crimson-700 dark:text-gold-400 font-semibold"
            >
              Track an Order
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-500 hover:underline"
            >
              Store Directions
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
