import React from 'react';
import { Search, SlidersHorizontal, X, Utensils, MapPin, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Cooked food',
  'Packaged food',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Other',
];

export const DonationFilters = ({ filters, onChange, onReset }) => {
  const handle = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Filter & Search Available Food</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search by food title */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search food name..."
            value={filters.search || ''}
            onChange={(e) => handle('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
          />
        </div>

        {/* Dietary Type Filter */}
        <select
          value={filters.dietaryType || ''}
          onChange={(e) => handle('dietaryType', e.target.value)}
          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60 text-slate-700"
        >
          <option value="">All Dietary Types</option>
          <option value="Vegetarian">🥦 Vegetarian Only</option>
          <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
          <option value="Vegan">🌱 Vegan Only</option>
        </select>

        {/* Category */}
        <select
          value={filters.foodType || filters.category || ''}
          onChange={(e) => handle('foodType', e.target.value)}
          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60 text-slate-700"
        >
          <option value="">All Food Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by city..."
            value={filters.city || ''}
            onChange={(e) => handle('city', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy || ''}
          onChange={(e) => handle('sortBy', e.target.value)}
          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60 text-slate-700 font-semibold"
        >
          <option value="">Sort: Newest First</option>
          <option value="endingSoon">Ending Soonest</option>
          <option value="quantityDesc">Quantity: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default DonationFilters;
