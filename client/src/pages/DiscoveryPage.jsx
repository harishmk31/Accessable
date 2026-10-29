import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  MapPin,
  X,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  Columns2,
  Navigation
} from 'lucide-react';
import { placeService } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import PlaceCard from '../components/PlaceCard';
import SearchBar from '../components/SearchBar';
import FilterDrawer from '../components/FilterDrawer';
import InteractiveMap from '../components/InteractiveMap';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const DiscoveryPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map' | 'split'
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  // Extract filter parameters from URL
  const currentFilters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    district: searchParams.get('district') || '',
    locality: searchParams.get('locality') || '',
    city: searchParams.get('city') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    radius: searchParams.get('radius') || '',
    wheelchairRamp: searchParams.get('wheelchairRamp') || '',
    elevatorLift: searchParams.get('elevatorLift') || '',
    accessibleToilet: searchParams.get('accessibleToilet') || '',
    accessibleParking: searchParams.get('accessibleParking') || '',
    brailleSignage: searchParams.get('brailleSignage') || '',
    audioAssistance: searchParams.get('audioAssistance') || '',
    minRating: searchParams.get('minRating') || '',
    minAccessibilityRating: searchParams.get('minAccessibilityRating') || '',
    sortBy: searchParams.get('sortBy') || (searchParams.get('lat') ? 'distance' : 'newest'),
    page: parseInt(searchParams.get('page') || '1', 10)
  };

  const [searchInput, setSearchInput] = useState(currentFilters.q);

  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = {};
        Object.entries(currentFilters).forEach(([k, v]) => {
          if (v) queryParams[k] = v;
        });

        // Use appropriate endpoint
        let res;
        if (currentFilters.lat && currentFilters.lng) {
          res = await placeService.getNearbyPlaces(queryParams);
        } else {
          res = await placeService.getPlaces(queryParams);
        }

        setPlaces(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: (res.data.data || []).length });
      } catch (err) {
        setError(err.message || 'Failed to retrieve places directory');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [searchParams]);

  const updateFilters = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset page to 1 when filters change (unless it's the page itself)
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (text) => {
    updateFilters('q', text.trim());
  };

  const handleSearchClear = () => {
    setSearchInput('');
    updateFilters('q', '');
  };

  const handleResetAll = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    updateFilters('page', newPage.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const userLocation =
    currentFilters.lat && currentFilters.lng
      ? { lat: parseFloat(currentFilters.lat), lng: parseFloat(currentFilters.lng) }
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('directoryTitle')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('directorySubtitle')}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-pressed={viewMode === 'list'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('viewModeList')}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-pressed={viewMode === 'map'}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t('viewModeMap')}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'split'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-pressed={viewMode === 'split'}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{t('viewModeSplit')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex-1">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearchSubmit}
            onClear={handleSearchClear}
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          aria-expanded={showMobileFilter}
          aria-controls="mobile-filter-drawer"
        >
          <SlidersHorizontal className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <span>{showMobileFilter ? 'Hide Filters' : t('filters')}</span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filter / Mobile Drawer */}
        <div
          id="mobile-filter-drawer"
          className={`lg:block ${showMobileFilter ? 'block' : 'hidden'}`}
        >
          <div className="sticky top-20">
            <FilterDrawer
              filters={currentFilters}
              onChange={updateFilters}
              onReset={handleResetAll}
              totalResults={pagination.total}
            />
          </div>
        </div>

        {/* Content Area */}
        <main id="main-content" className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-sm text-slate-700 font-semibold flex items-center gap-2">
              <span>
                {t('foundPlaces')}{' '}
                <strong className="text-teal-700 font-black">{pagination.total}</strong>{' '}
                {t('placesCount')}
              </span>

              {userLocation && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  <Navigation className="w-3 h-3" />
                  Near GPS ({currentFilters.radius || 10} km)
                </span>
              )}
            </div>

            {/* Quick reset if any filter is active */}
            {(currentFilters.q ||
              currentFilters.category ||
              currentFilters.district ||
              currentFilters.locality ||
              currentFilters.lat ||
              currentFilters.wheelchairRamp ||
              currentFilters.elevatorLift ||
              currentFilters.accessibleToilet ||
              currentFilters.accessibleParking ||
              currentFilters.brailleSignage ||
              currentFilters.audioAssistance ||
              currentFilters.minAccessibilityRating) && (
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('resetFilters')}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm"
              role="alert"
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* VIEW: Pure Map View */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              <InteractiveMap
                places={places}
                userLocation={userLocation}
                radiusKm={currentFilters.radius ? parseFloat(currentFilters.radius) : null}
                selectedPlaceId={selectedPlaceId}
                onPlaceSelect={(p) => setSelectedPlaceId(p._id)}
                height="620px"
              />
              <p className="text-xs text-slate-500 italic text-center">
                Click any pin to inspect verified ramps, lifts, distance, and get instant directions.
              </p>
            </div>
          )}

          {/* VIEW: Split View (Map + Cards side-by-side) */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <div className="sticky top-20">
                <InteractiveMap
                  places={places}
                  userLocation={userLocation}
                  radiusKm={currentFilters.radius ? parseFloat(currentFilters.radius) : null}
                  selectedPlaceId={selectedPlaceId}
                  onPlaceSelect={(p) => setSelectedPlaceId(p._id)}
                  height="580px"
                />
              </div>
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {loading ? (
                  <LoadingSpinner message="Searching accessibility database..." />
                ) : places.length === 0 ? (
                  <EmptyState
                    title={t('noPlacesTitle')}
                    description={t('noPlacesDesc')}
                    action={
                      <button
                        type="button"
                        onClick={handleResetAll}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        {t('resetFilters')}
                      </button>
                    }
                  />
                ) : (
                  places.map((place) => (
                    <div
                      key={place._id}
                      onMouseEnter={() => setSelectedPlaceId(place._id)}
                      className={selectedPlaceId === place._id ? 'ring-2 ring-teal-600 rounded-2xl' : ''}
                    >
                      <PlaceCard place={place} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW: Standard List/Grid View */}
          {viewMode === 'list' && (
            <>
              {loading ? (
                <LoadingSpinner message="Searching accessibility database..." />
              ) : places.length === 0 ? (
                <EmptyState
                  title={t('noPlacesTitle')}
                  description={t('noPlacesDesc')}
                  action={
                    <button
                      type="button"
                      onClick={handleResetAll}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                    >
                      {t('resetFilters')}
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {places.map((place) => (
                    <PlaceCard key={place._id} place={place} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 pt-8"
              aria-label="Places directory pagination"
            >
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                aria-label="Previous page"
              >
                &larr; Previous
              </button>

              <span className="text-xs font-bold text-slate-700 px-3">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                aria-label="Next page"
              >
                Next &rarr;
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
};

export default DiscoveryPage;
