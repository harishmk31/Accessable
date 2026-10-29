import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, MapPin, X, RotateCcw } from 'lucide-react';
import { placeService } from '../services/api';
import PlaceCard from '../components/PlaceCard';
import SearchBar from '../components/SearchBar';
import FilterDrawer from '../components/FilterDrawer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const DiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Extract filter parameters from URL
  const currentFilters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    wheelchairRamp: searchParams.get('wheelchairRamp') || '',
    elevatorLift: searchParams.get('elevatorLift') || '',
    accessibleToilet: searchParams.get('accessibleToilet') || '',
    accessibleParking: searchParams.get('accessibleParking') || '',
    brailleSignage: searchParams.get('brailleSignage') || '',
    audioAssistance: searchParams.get('audioAssistance') || '',
    minRating: searchParams.get('minRating') || '',
    minAccessibilityRating: searchParams.get('minAccessibilityRating') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
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

        const res = await placeService.getPlaces(queryParams);
        setPlaces(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Accessibility Discovery Directory
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore public places with audited wheelchair ramps, elevators, accessible restrooms, and tactile signage.
        </p>
      </div>

      {/* Search Bar & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex-1">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearchSubmit}
            onClear={handleSearchClear}
            placeholder="Search by hospital name, university, street address, or city..."
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
          <span>{showMobileFilter ? 'Hide Filters' : 'Accessibility Filters'}</span>
        </button>
      </div>

      {/* Main Grid: Sidebar Filters + Places List */}
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

        {/* Places Results Section */}
        <main id="main-content" className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-sm text-slate-700 font-semibold">
              Found{' '}
              <span className="text-teal-700 font-bold">{pagination.total}</span>{' '}
              {pagination.total === 1 ? 'place' : 'places'}
            </div>

            {/* Quick reset if any filter is active */}
            {(currentFilters.q ||
              currentFilters.category ||
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
                Clear All Applied Filters
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

          {/* Results Grid / Loading / Empty */}
          {loading ? (
            <LoadingSpinner message="Searching accessibility database..." />
          ) : places.length === 0 ? (
            <EmptyState
              title="No accessibility records match your criteria"
              description="No public places matched the applied search terms and accessibility facility requirements. Try clearing some facility constraints or changing category."
              action={
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  Reset All Filters
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
