import React from 'react';
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Hospital',
  'College/University',
  'Restaurant/Cafe',
  'Office/Government',
  'Transit/Station',
  'Shopping/Mall',
  'Park/Recreation',
  'Other'
];

const FACILITY_OPTIONS = [
  { key: 'wheelchairRamp', label: 'Wheelchair Ramp' },
  { key: 'elevatorLift', label: 'Elevator / Lift' },
  { key: 'accessibleToilet', label: 'Accessible Restroom' },
  { key: 'accessibleParking', label: 'Accessible Parking' },
  { key: 'brailleSignage', label: 'Braille Signage' },
  { key: 'audioAssistance', label: 'Audio Assistance' }
];

const STATUS_VALUES = [
  { value: '', label: 'Any' },
  { value: 'Available', label: 'Available' },
  { value: 'Unavailable', label: 'Unavailable' },
  { value: 'Unknown', label: 'Unknown / Unverified' }
];

const FilterDrawer = ({
  filters,
  onChange,
  onReset,
  totalResults = 0
}) => {
  const handleCategoryClick = (cat) => {
    onChange('category', cat === 'All' ? '' : cat);
  };

  const handleFacilityChange = (facilityKey, val) => {
    onChange(facilityKey, val);
  };

  // Count active filters
  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'sortBy' || k === 'page' || k === 'q') return false;
    return Boolean(v);
  }).length;

  return (
    <aside
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
      aria-label="Filter places by accessibility facilities and category"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <h2 className="font-bold text-slate-900 text-base">Filters</h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-teal-100 text-teal-800 rounded-full">
              {activeCount} active
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-xs p-1"
            aria-label="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* Sorting */}
      <div className="mt-4 pt-1">
        <label htmlFor="sort-by-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sort Results By
        </label>
        <select
          id="sort-by-select"
          value={filters.sortBy || 'newest'}
          onChange={(e) => onChange('sortBy', e.target.value)}
          className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
        >
          <option value="newest">Recently Added</option>
          <option value="accessibility_desc">Highest Accessibility Rating</option>
          <option value="rating_desc">Highest General Rating</option>
          <option value="name_asc">Name (A-Z)</option>
        </select>
      </div>

      {/* Category selector */}
      <div className="mt-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Place Category
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Place categories">
          {CATEGORIES.map((cat) => {
            const isSelected =
              (!filters.category && cat === 'All') ||
              filters.category === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-teal-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility Facilities 3-State Requirements */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Accessibility Facilities
          </label>
          <span className="text-[11px] text-slate-500 italic">3-State Logic</span>
        </div>

        <div className="space-y-4">
          {FACILITY_OPTIONS.map(({ key, label }) => {
            const currentValue = filters[key] || '';

            return (
              <fieldset key={key} className="space-y-1.5">
                <legend className="text-xs font-semibold text-slate-800">
                  {label}
                </legend>
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  {STATUS_VALUES.map(({ value, label: statusLabel }) => {
                    const isSelected = currentValue === value;
                    const isAvail = value === 'Available';
                    const isUnavail = value === 'Unavailable';
                    const isUnknown = value === 'Unknown';

                    let activeClass = 'bg-slate-800 text-white font-bold';
                    if (isAvail && isSelected) activeClass = 'bg-emerald-700 text-white font-bold';
                    if (isUnavail && isSelected) activeClass = 'bg-rose-700 text-white font-bold';
                    if (isUnknown && isSelected) activeClass = 'bg-amber-700 text-white font-bold';

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleFacilityChange(key, value)}
                        className={`py-1.5 px-1 rounded text-center truncate transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                          isSelected
                            ? `${activeClass} shadow-2xs`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={`${label}: ${statusLabel}`}
                        aria-pressed={isSelected}
                      >
                        {statusLabel.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      {/* Minimum Accessibility Rating */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Min Accessibility Rating
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            { val: '', label: 'Any' },
            { val: '3', label: '3+ Stars' },
            { val: '4', label: '4+ Stars' }
          ].map(({ val, label }) => {
            const isSelected = (filters.minAccessibilityRating || '') === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChange('minAccessibilityRating', val)}
                className={`py-1.5 rounded text-center font-medium transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-teal-700 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default FilterDrawer;
