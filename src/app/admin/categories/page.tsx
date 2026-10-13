'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = () => {
    setLoading(true);
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setImage('');
    setDescription('');
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat._id);
    setName(cat.name);
    setImage(cat.image || '');
    setDescription(cat.description || '');
    setSortOrder(cat.sortOrder || 0);
    setShowForm(true);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter((c) => c._id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Delete error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');

    const payload = {
      name: name.trim(),
      image: image.trim(),
      description: description.trim(),
      sortOrder: Number(sortOrder),
    };

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        loadCategories();
      } else {
        setError(data.error || 'Failed to save category');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Category & Heritage Tree ({categories.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Organize catalog groupings (Silk Sarees, Kasavu, Festive Kurtas, Daily Cottons)
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-crimson-800 to-crimson-900 text-gold-300 font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button type="button" onClick={resetForm} className="text-neutral-400 hover:text-neutral-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Silk Sarees"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Display Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Cover Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief note about this fabric or collection..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-crimson-800 text-gold-300 font-bold rounded-lg uppercase tracking-wider"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400 font-mono col-span-3">
            Loading categories...
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c._id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      No Image
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                    Order: {c.sortOrder || 0}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100">
                    {c.name}
                  </h3>
                  <span className="font-mono text-[11px] text-neutral-400 block">
                    /{c.slug}
                  </span>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                    {c.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs mt-3">
                <button
                  onClick={() => handleEdit(c)}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-crimson-700 font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(c._id, c.name)}
                  className="text-neutral-400 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
