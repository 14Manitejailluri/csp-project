import React, { useState, useEffect } from 'react';
import { Upload, X, MapPin, Loader2 } from 'lucide-react';
import {
  FOOD_CATEGORIES,
  QUANTITY_UNITS,
  STORAGE_CONDITIONS,
  ALLERGEN_OPTIONS,
} from '../../utils/constants';
import SafetyNotice from '../common/SafetyNotice';
import LocationPickerModal from '../map/LocationPickerModal';

const DonationForm = ({ initialValues = {}, onSubmit, loading = false, submitLabel = 'Create Donation' }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: FOOD_CATEGORIES[0],
    quantity: '',
    unit: QUANTITY_UNITS[0],
    expiresAt: '',
    storageCondition: STORAGE_CONDITIONS[0],
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isHalal: false,
    pickupInstructions: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    location: null,
    ...initialValues,
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(initialValues?.images?.map((i) => i.url) || []);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setAddr = (key, val) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: val } }));

  const toggleAllergen = (a) => {
    const current = form.allergens || [];
    set('allergens', current.includes(a) ? current.filter((x) => x !== a) : [...current, a]);
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
      errs.quantity = 'A positive quantity is required';
    if (!form.expiresAt) errs.expiresAt = 'Expiry date/time is required';
    if (!form.address.city.trim()) errs.city = 'City is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'allergens') {
        v.forEach((a) => fd.append('allergens[]', a));
      } else if (k === 'address') {
        fd.append('address', JSON.stringify(v));
      } else if (k === 'location' && v) {
        fd.append('location', JSON.stringify(v));
      } else if (v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });
    images.forEach((img) => fd.append('images', img));
    onSubmit(fd);
  };

  const minExpiry = new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SafetyNotice />

      {/* Basic Info */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            id="donation-title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Leftover catered food from event"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            id="donation-description"
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the food items, packaging, etc."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              id="donation-category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {FOOD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Storage Condition</label>
            <select
              id="donation-storage"
              value={form.storageCondition}
              onChange={(e) => set('storageCondition', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {STORAGE_CONDITIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
            <input
              id="donation-quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            {errors.quantity && <p className="mt-1 text-xs text-rose-500">{errors.quantity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
            <select
              id="donation-unit"
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {QUANTITY_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date & Time *</label>
          <input
            id="donation-expires"
            type="datetime-local"
            min={minExpiry}
            value={form.expiresAt}
            onChange={(e) => set('expiresAt', e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          {errors.expiresAt && <p className="mt-1 text-xs text-rose-500">{errors.expiresAt}</p>}
        </div>
      </section>

      {/* Dietary */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Dietary Information</h2>

        <div className="flex flex-wrap gap-3">
          {[['isVegetarian', '🥦 Vegetarian'], ['isVegan', '🌱 Vegan'], ['isHalal', '☪️ Halal']].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id={`donation-${key}`}
                type="checkbox"
                checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Allergens</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAllergen(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  form.allergens.includes(a)
                    ? 'bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Pickup Location</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
            <input
              id="donation-street"
              type="text"
              value={form.address.street}
              onChange={(e) => setAddr('street', e.target.value)}
              placeholder="123 Main St"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
            <input
              id="donation-city"
              type="text"
              value={form.address.city}
              onChange={(e) => setAddr('city', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
            <input
              id="donation-pincode"
              type="text"
              value={form.address.pincode}
              onChange={(e) => setAddr('pincode', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLocationModalOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          {form.location ? 'Change Pin on Map' : 'Pin Exact Location on Map'}
        </button>

        {form.location && (
          <p className="text-xs text-slate-500">
            📍 Location pinned: {form.location.coordinates[1].toFixed(5)}, {form.location.coordinates[0].toFixed(5)}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Instructions</label>
          <textarea
            id="donation-instructions"
            rows={2}
            value={form.pickupInstructions}
            onChange={(e) => set('pickupInstructions', e.target.value)}
            placeholder="e.g. Ring the bell at reception, ask for John"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
          />
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Food Images (optional, max 3)</h2>

        <div className="flex flex-wrap gap-3">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {previewUrls.length < 3 && (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="text-xs text-slate-400 mt-1">Upload</span>
              <input
                id="donation-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="hidden"
              />
            </label>
          )}
        </div>
      </section>

      {/* Submit */}
      <button
        type="submit"
        id="donation-submit-btn"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity shadow-md shadow-emerald-200"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Submitting…' : submitLabel}
      </button>

      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onConfirm={(latlng) => {
          set('location', {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat],
          });
          setLocationModalOpen(false);
        }}
        initial={
          form.location
            ? { lat: form.location.coordinates[1], lng: form.location.coordinates[0] }
            : null
        }
      />
    </form>
  );
};

export default DonationForm;
