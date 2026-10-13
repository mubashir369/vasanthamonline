'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Store,
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-crimson-700 dark:text-gold-400">
          We Are Here to Serve You
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          Visit Our Store or Contact Us
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          Experience our heritage textiles in person at Mannarkkad, Palakkad or reach out with any custom weaving, bridal, or order inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info & Store Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-xl text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Store Information
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-neutral-900 dark:text-neutral-100 text-sm">
                    Flagship Store Address
                  </strong>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-neutral-900 dark:text-neutral-100 text-sm">
                    Phone & WhatsApp
                  </strong>
                  <a
                    href="tel:+919447123456"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-crimson-700 dark:hover:text-gold-400 block mt-0.5"
                  >
                    +91 94471 23456
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-neutral-900 dark:text-neutral-100 text-sm">
                    Email Inquiries
                  </strong>
                  <a
                    href="mailto:info@vasanthamgroup.com"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-crimson-700 dark:hover:text-gold-400 block mt-0.5"
                  >
                    info@vasanthamgroup.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-neutral-900 dark:text-neutral-100 text-sm">
                    Opening Hours
                  </strong>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Monday to Sunday: 9:30 AM – 8:30 PM (All 7 Days Open)
                  </p>
                </div>
              </div>
            </div>

            {/* Directions Map Link */}
            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Mannarkkad+Palakkad+Kerala"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <Store className="w-4 h-4 text-crimson-700 dark:text-gold-400" />
                Open Directions in Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-neutral-900 dark:text-neutral-100">
              Send Us a Message
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Have questions about saree stock, bridal orders, or bulk purchases? Reach out directly.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you! Your message has been received. Our team will get back to you shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 94471 00000"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                Your Inquiry or Feedback *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about wedding silk collections, bulk handlooms, custom size stitching, or store pickup inquiries..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 text-gold-300 font-bold rounded-xl text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
