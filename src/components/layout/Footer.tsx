'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState({
    storeName: 'Vasantham Group',
    tagline: 'Where elegance is woven with tradition.',
    address: 'OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582',
    contactPhone: '+91 94471 23456',
    contactEmail: 'info@vasanthamgroup.com',
    aboutText:
      'Welcome to Vasantham Group — Malabar’s largest textile and fashion network, where tradition meets modern elegance. For generations, Vasantham has been a trusted name in the world of textiles in Palakkad.',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800 transition-colors">
      {/* Upper Newsletter / Value Highlights */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-crimson-900/60 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-sm">Authentic Heritage Weaves</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                100% pure silk and genuine Kerala Kasavu handlooms directly sourced from master weavers.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-crimson-900/60 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-sm">Mannarkkad Store Pickup</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Convenient, free store pickup available from our flagship Mannarkkad, Palakkad store.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-crimson-900/60 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-sm">Swift Malabar Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Reliable doorstep courier delivery across Palakkad, Malappuram, Kozhikode, and all of Kerala.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info & Story */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo
              storeName={settings.storeName}
              tagline={settings.tagline}
              className="brightness-110"
            />
            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-4">
              {settings.aboutText}
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 underline"
              >
                Read Our Heritage Story &rarr;
              </Link>
            </div>
          </div>

          {/* Heritage Collections */}
          <div>
            <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-gold-400 mb-4">
              Collections
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalog?category=silk-sarees" className="hover:text-gold-300 transition">
                  Kanchipuram & Banarasi Silk
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=kerala-kasavu" className="hover:text-gold-300 transition">
                  Kerala Kasavu & Set Mundu
                </Link>
              </li>
              <li>
                <Link href="/catalog?audience=men,gents" className="hover:text-gold-300 transition">
                  Men’s Linen & Kasavu Mundu
                </Link>
              </li>
              <li>
                <Link href="/catalog?audience=women,ladies" className="hover:text-gold-300 transition">
                  Bridal Anarkalis & Kurtas
                </Link>
              </li>
              <li>
                <Link href="/catalog?audience=girls,boys" className="hover:text-gold-300 transition">
                  Kids Pattu Pavada Sets
                </Link>
              </li>
              <li>
                <Link href="/catalog?fabricType=Cotton" className="hover:text-gold-300 transition">
                  Palakkad Handloom Cottons
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Services */}
          <div>
            <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-gold-400 mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-gold-300 transition font-medium text-gold-300">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-gold-300 transition">
                  My Orders & History
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-gold-300 transition">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-300 transition">
                  Store Locator & Contact
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold-300 transition text-neutral-400">
                  Staff & Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Location & Contact */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-gold-400 mb-4">
              Flagship Store
            </h3>
            <div className="flex items-start gap-2.5 text-xs text-neutral-400">
              <MapPin className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-neutral-400">
              <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <a href={`tel:${settings.contactPhone}`} className="hover:text-gold-300">
                {settings.contactPhone}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-neutral-400">
              <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-gold-300">
                {settings.contactEmail}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-neutral-400">
              <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span>Monday – Sunday: 9:30 AM – 8:30 PM</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Crafted with <Heart className="w-3 h-3 text-crimson-600 fill-current" /> for Malabar & Kerala Tradition
          </p>
        </div>
      </div>
    </footer>
  );
}
