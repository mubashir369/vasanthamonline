'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { User, Phone, MapPin, Plus, Trash2, CheckCircle2, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);

  // New Address Form
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('Palakkad');
  const [newDistrict, setNewDistrict] = useState('Palakkad');
  const [newState, setNewState] = useState('Kerala');
  const [newPincode, setNewPincode] = useState('678001');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, addresses }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      setMessage('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newPincode.trim()) return;

    const newAddr = {
      fullName: name,
      phone,
      street: newStreet.trim(),
      landmark: newLandmark.trim(),
      city: newCity.trim(),
      district: newDistrict.trim(),
      state: newState.trim(),
      pincode: newPincode.trim(),
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setNewStreet('');
    setNewLandmark('');
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-neutral-500">
        Please sign in to access your profile settings.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Profile & Saved Addresses
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your contact credentials and default shipping destinations
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Personal Details */}
        <div className="lg:col-span-6 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <User className="w-4 h-4 text-crimson-700 dark:text-gold-400" />
            Personal Details
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98950 11223"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-crimson-800 hover:bg-crimson-900 text-gold-300 font-bold rounded-lg text-xs uppercase tracking-wider shadow flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Saved Addresses */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-crimson-700 dark:text-gold-400" />
              Saved Delivery Addresses ({addresses.length})
            </h2>

            {addresses.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex items-start justify-between text-xs"
                  >
                    <div>
                      <strong className="block text-neutral-900 dark:text-neutral-100">
                        {addr.fullName || name}
                      </strong>
                      <p className="text-neutral-600 dark:text-neutral-300 mt-0.5">
                        {addr.street} {addr.landmark && `(Near ${addr.landmark})`}
                      </p>
                      <p className="text-neutral-500 text-[11px]">
                        {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                      </p>
                      {addr.phone && <p className="text-[11px] text-neutral-400 mt-1">Phone: {addr.phone}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(idx)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Address Sub-form */}
            <form onSubmit={handleAddAddress} className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
              <span className="font-bold text-neutral-700 dark:text-neutral-300 block">Add New Address</span>

              <input
                type="text"
                required
                placeholder="House / Building / Street *"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Landmark"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <input
                  type="text"
                  required
                  placeholder="City / Town *"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="District *"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <input
                  type="text"
                  required
                  placeholder="Pincode *"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Address to List
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
