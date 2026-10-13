import React from 'react';
import Link from 'next/link';
import connectDB from '@/lib/db';
import StoreSettings from '@/lib/models/StoreSettings';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  MapPin,
  Clock,
  ArrowRight,
  Award,
  Users,
} from 'lucide-react';

export const revalidate = 60;

async function getAboutData() {
  await connectDB();
  const settings = await StoreSettings.findOne().lean();
  return {
    settings: settings || {
      storeName: 'Vasantham Group',
      tagline: 'Where elegance is woven with tradition.',
      address: 'OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582',
      contactPhone: '+91 94471 23456',
      contactEmail: 'info@vasanthamgroup.com',
      aboutText:
        'Welcome to Vasantham Group — Malabar’s largest textile and fashion network, where tradition meets modern elegance. For generations, Vasantham has been a trusted name in the world of textiles. What began as a humble journey in Palakkad has now grown into one of Malabar’s most beloved destinations for premium fabrics, ethnic wear, and family fashion. At Vasantham Group, we take pride in offering an exquisite range of silk sarees, cotton wear, and designer fabrics — each piece crafted to perfection, blending timeless craftsmanship with contemporary design. Our mission is simple — to make elegant, high-quality fashion affordable for every family. From festive attire to daily wear, we bring you collections that celebrate comfort, culture, and class. Beyond fabrics, we believe in experiences — a warm, welcoming shopping atmosphere where every customer feels valued. Whether you visit our stores or connect with us online, we promise authenticity, quality, and a touch of heritage in every interaction. Vasantham Group — Where elegance is woven with tradition.',
    },
  };
}

export default async function AboutPage() {
  const { settings } = await getAboutData();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-crimson-950 via-crimson-900 to-neutral-950 text-white py-16 sm:py-24 text-center px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-800/80 border border-gold-400/40 text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Malabar’s Heritage Textile Network</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight">
            About {settings.storeName}
          </h1>

          <p className="font-serif italic text-gold-300 text-lg sm:text-xl">
            &ldquo;{settings.tagline}&rdquo;
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 shadow-md space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center sm:text-left">
            Our Journey & Tradition
          </h2>

          <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
            <p className="text-lg font-serif italic text-crimson-800 dark:text-gold-300 border-l-4 border-crimson-700 pl-4 py-1">
              {settings.aboutText}
            </p>

            <p>
              Founded in the fertile cultural hub of Palakkad, Vasantham Group has spent decades building unbreakable relationships with master handloom weavers in Balaramapuram, Kanchipuram, Banaras, and Palakkad itself. Every warp and weft in our collection undergoes rigorous quality verification so that our customers take home not merely a fabric, but a family heirloom.
            </p>

            <p>
              Today, our flagship destination in Mannarkkad serves thousands of delighted families across Malabar, bringing together the grandeur of South Indian wedding trousseaus, festive Onam and Vishu wear, and comfortable handloom cotton daily wear under one welcoming roof.
            </p>
          </div>
        </div>

        {/* Pillars of Vasantham */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-gold-400 mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              Uncompromising Authenticity
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Certified pure mulberry silk and authentic zari borders directly sourced without intermediaries.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-gold-400 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              Fashion for Every Family
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Our core mission remains to make regal, high-quality textile craftsmanship accessible and affordable.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-gold-400 mx-auto flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              Palakkad Roots
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Proudly rooted in Mannarkkad, Palakkad, committed to community growth and weavers welfare.
            </p>
          </div>
        </div>

        {/* Physical Store Callout */}
        <div className="p-8 bg-neutral-950 text-white rounded-2xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-gold-400 text-xs font-bold uppercase tracking-wider">
              Visit Our Flagship Store
            </span>
            <h3 className="font-serif text-2xl font-bold">
              Experience the Touch of Genuine Silk in Mannarkkad
            </h3>
            <p className="text-xs text-neutral-400 max-w-lg">
              {settings.address} • Contact: {settings.contactPhone}
            </p>
          </div>

          <Link
            href="/contact"
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition hover:from-gold-400 hover:to-gold-500 flex-shrink-0"
          >
            Get Store Directions &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
