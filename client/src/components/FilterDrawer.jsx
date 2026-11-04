import React from 'react';
import { Filter, RotateCcw, MapPin, Navigation } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const TAMIL_NADU_REGIONS = [
  'All',
  'Western Tamil Nadu',
  'Northern Tamil Nadu',
  'Central Tamil Nadu',
  'Southern Tamil Nadu'
];

const TAMIL_NADU_DISTRICTS = [
  'All',
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kanchipuram',
  'Kanyakumari',
  'Karur',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Salem',
  'Tenkasi',
  'Thanjavur',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Vellore',
  'Villupuram',
  'Virudhunagar'
];

const DISTRICT_LOCALITIES_MAP = {
  Chengalpattu: ['GST Road', 'Mahabalipuram', 'Vandalur'],
  Chennai: ['Adyar', 'Kotturpuram', 'Marina Beach', 'Mylapore', 'Park Town', 'Royapettah', 'Thousand Lights', 'Velachery'],
  Coimbatore: ['Avinashi Road', 'Gandhipuram', 'Marudhamalai Road', 'Peelamedu', 'Pollachi Central', 'RS Puram', 'Race Course', 'Saibaba Colony', 'Saravanampatti', 'Town Hall', 'Vadavalli'],
  Dindigul: ['Bryant Park', 'Fort Area', 'Lake Area'],
  Erode: ['Brough Road', 'Central Erode', 'Vellode'],
  Kanchipuram: ['Periya Kanchipuram', 'Vishnu Kanchi'],
  Kanyakumari: ['Asaripallam', 'Coastal Terminal', 'Sunset Point'],
  Karur: ['Gandhigramam', 'Karur Central'],
  Madurai: ['Chithirai Street', 'Madurai Main', 'Mahal Area', 'Mattuthavani', 'Tamukkam', 'West Veli Street'],
  Nilgiris: ['Botanical Gardens', 'Ooty Lake', 'Sims Park', 'Station Area'],
  Salem: ['Fort', 'Kurumbapatti', 'Lake Area', 'Suramangalam'],
  Thanjavur: ['Central Kumbakonam', 'Court Area', 'Thanjavur Central', 'Thanjavur Town'],
  Thoothukudi: ['Kamraj Nagar', 'Port Area'],
  Tiruchirappalli: ['Cantonment', 'Srirangam'],
  Tirunelveli: ['Palayamkottai', 'Tirunelveli Junction'],
  Tiruppur: ['Central Tiruppur', 'Dharapuram Road', 'Kumaran Memorial Area'],
  Vellore: ['Fort Area', 'Katpadi', 'Vellore Central'],
  Virudhunagar: ['Car Street', 'Madurai Road']
};

const DEFAULT_POPULAR_LOCALITIES = [
  'Gandhipuram',
  'RS Puram',
  'Peelamedu',
  'Mylapore',
  'Adyar',
  'Srirangam',
  'Madurai Main',
  'Ooty Lake'
];

const CATEGORIES = [
  'All',
  'Hospital',
  'College/University',
  'Restaurant/Cafe',
  'Transit/Station',
  'Shopping/Mall',
  'Park/Recreation',
  'Tourist Attractions & Monuments',
  'Temples & Cultural Venues',
  'Beaches & Waterfronts',
  'Office/Government'
];

const FACILITY_OPTIONS = [
  { key: 'wheelchairRamp', labelKey: 'wheelchairRamp' },
  { key: 'elevatorLift', labelKey: 'elevatorLift' },
  { key: 'accessibleToilet', labelKey: 'accessibleToilet' },
  { key: 'accessibleParking', labelKey: 'accessibleParking' },
  { key: 'brailleSignage', labelKey: 'brailleSignage' },
  { key: 'audioAssistance', labelKey: 'audioAssistance' }
];

const DISTANCES = [
  { value: '', labelKey: 'anyDistance' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' }
];

const FilterDrawer = ({
  filters,
  onChange,
  onReset,
  totalResults = 0,
  hasUserLocation = false,
  onRequestLocation = null
}) => {
  const { t } = useTranslation();

  const handleFacilityChange = (facilityKey, val) => {
    onChange(facilityKey, val);
  };

  // Count active filters
  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'sortBy' || k === 'page' || k === 'q' || k === 'lat' || k === 'lng') return false;
    return Boolean(v);
  }).length;

  return (
    <aside
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6"
      aria-label={t('filters')}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{t('filters')}</h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-teal-100 text-teal-800 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors p-1"
            aria-label={t('resetFilters')}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {t('resetFilters')}
          </button>
        )}
      </div>

      {/* Sorting */}
      <div>
        <label htmlFor="sort-by-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {t('sortResultsBy')}
        </label>
        <select
          id="sort-by-select"
          value={filters.sortBy || 'newest'}
          onChange={(e) => onChange('sortBy', e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:border-teal-500 focus:outline-none"
        >
          <option value="newest">{t('sortNewest')}</option>
          {hasUserLocation && <option value="distance">{t('sortDistance')}</option>}
          <option value="accessibility_desc">{t('sortAccessibility')}</option>
          <option value="rating_desc">{t('sortRating')}</option>
          <option value="name_asc">{t('sortName')}</option>
        </select>
      </div>

      {/* Distance Filter (with GPS location indicator) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t('distanceLabel')}
          </label>
          {!hasUserLocation && onRequestLocation && (
            <button
              type="button"
              onClick={onRequestLocation}
              className="text-[11px] font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              Enable GPS
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {DISTANCES.map(({ value, label, labelKey }) => {
            const isSelected = (filters.radius || '') === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange('radius', value)}
                className={`py-1.5 rounded-lg text-center font-bold transition-all ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                {label || t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tamil Nadu Districts */}
      <div>
        <label htmlFor="district-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('districtLabel')}
        </label>
        
        {/* Quick District Chips */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {['All', 'Coimbatore', 'Chennai', 'Madurai', 'Tiruchirappalli', 'Salem'].map((dst) => {
            const isSelected = (!filters.district && dst === 'All') || filters.district === dst;
            return (
              <button
                key={dst}
                type="button"
                onClick={() => {
                  const newDistrict = dst === 'All' ? '' : dst;
                  onChange('district', newDistrict);
                  if (filters.locality && (!newDistrict || !DISTRICT_LOCALITIES_MAP[newDistrict]?.includes(filters.locality))) {
                    onChange('locality', '');
                  }
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                {dst}
              </button>
            );
          })}
        </div>

        {/* Full District Dropdown */}
        <select
          id="district-select"
          value={filters.district || 'All'}
          onChange={(e) => {
            const newDistrict = e.target.value === 'All' ? '' : e.target.value;
            onChange('district', newDistrict);
            if (filters.locality && (!newDistrict || !DISTRICT_LOCALITIES_MAP[newDistrict]?.includes(filters.locality))) {
              onChange('locality', '');
            }
          }}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-2 focus:border-teal-500 focus:outline-none"
        >
          {TAMIL_NADU_DISTRICTS.map((dst) => (
            <option key={dst} value={dst}>
              {dst === 'All' ? 'All 30 Districts' : dst}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Locality Filter derived from District & Real Data */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t('localityLabel')}
          </label>
          <span className="text-[10px] text-slate-400">
            {filters.district ? `in ${filters.district}` : 'Popular Hubs'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange('locality', '')}
            className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
              !filters.locality
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-pressed={!filters.locality}
          >
            All
          </button>
          {((filters.district && DISTRICT_LOCALITIES_MAP[filters.district]) || DEFAULT_POPULAR_LOCALITIES).map((loc) => {
            const isSelected = filters.locality === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => onChange('locality', loc)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tamil Nadu Regions */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('regionLabel') || 'Region'}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TAMIL_NADU_REGIONS.map((reg) => {
            const isSelected = (!filters.region && reg === 'All') || filters.region === reg;
            return (
              <button
                key={reg}
                type="button"
                onClick={() => onChange('region', reg === 'All' ? '' : reg)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                {reg === 'All' ? (t('allRegions') || 'All Regions') : reg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('categoryLabel')}
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isSelected = (!filters.category && cat === 'All') || filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange('category', cat === 'All' ? '' : cat)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-300'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                aria-pressed={isSelected}
              >
                {cat === 'All' ? t('allCategories') : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Status Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Verification Status
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { value: '', label: 'Verified Audits' },
            { value: 'all', label: 'All Places' }
          ].map(({ value, label }) => {
            const isSelected = (filters.status || '') === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange('status', value)}
                className={`py-1.5 px-2 rounded-lg text-center font-bold text-[11px] transition-all ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-2xs'
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

      {/* Accessibility Score Filter */}
      <div className="pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Minimum Accessibility Score
        </label>
        <div className="grid grid-cols-4 gap-1 text-xs">
          {[
            { value: '', label: 'Any' },
            { value: '40', label: '40+' },
            { value: '60', label: '60+' },
            { value: '80', label: '80+' }
          ].map(({ value, label }) => {
            const isSelected = (filters.minAccessibilityScore || '') === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange('minAccessibilityScore', value)}
                className={`py-1.5 px-2 rounded-lg text-center font-bold text-[11px] transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-2xs'
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

      {/* Accessibility Facilities 3-State Requirements */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {t('facilitiesFilterTitle')}
        </label>

        <div className="space-y-3">
          {FACILITY_OPTIONS.map(({ key, labelKey }) => {
            const currentValue = filters[key] || '';
            const label = t(labelKey);

            return (
              <fieldset key={key} className="space-y-1">
                <legend className="text-xs font-semibold text-slate-800">
                  {label}
                </legend>
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  {[
                    { value: '', label: 'Any' },
                    { value: 'Available', label: 'Available', activeClass: 'bg-emerald-700 text-white' },
                    { value: 'Unavailable', label: 'Unavailable', activeClass: 'bg-rose-700 text-white' },
                    { value: 'Unknown', label: 'Unknown', activeClass: 'bg-amber-700 text-white' }
                  ].map(({ value, label: statusLabel, activeClass }) => {
                    const isSelected = currentValue === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleFacilityChange(key, value)}
                        className={`py-1 px-1 rounded-md text-center truncate font-semibold transition-all ${
                          isSelected
                            ? `${activeClass || 'bg-slate-800 text-white'} shadow-2xs`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {statusLabel}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default FilterDrawer;
