import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FOOD_CATEGORIES, STORAGE_CONDITIONS } from '../../utils/constants';

const DonationFilters = ({ filters, onChange, onReset }) => {
  const handle = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
        <button
          onClick={onReset}
          className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="filter-search"
            type="text"
            placeholder="Search..."
            value={filters.search || ''}
            onChange={(e) => handle('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <select
          id="filter-category"
          value={filters.category || ''}
          onChange={(e) => handle('category', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-slate-700"
        >
          <option value="">All Categories</option>
          {FOOD_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Storage */}
        <select
          id="filter-storage"
          value={filters.storageCondition || ''}
          onChange={(e) => handle('storageCondition', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-slate-700"
        >
          <option value="">Any Storage</option>
          {STORAGE_CONDITIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          id="filter-sort"
          value={filters.sortBy || ''}
          onChange={(e) => handle('sortBy', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-slate-700"
        >
          <option value="">Sort: Newest</option>
          <option value="expiresAt">Expiring Soon</option>
          <option value="distanceKm">Nearest First</option>
          <option value="quantity">Quantity: High–Low</option>
        </select>
      </div>
    </div>
  );
};

export default DonationFilters;
