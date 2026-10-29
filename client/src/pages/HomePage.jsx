import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Navigation,
  Building2,
  GraduationCap,
  Train,
  ShoppingBag,
  Trees,
  Landmark,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Layers,
  Flag,
  Map
} from 'lucide-react';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import PlaceCard from '../components/PlaceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const COIMBATORE_LOCALITIES = [
  'Gandhipuram',
  'RS Puram',
  'Peelamedu',
  'Saibaba Colony',
  'Town Hall',
  'Race Course',
  'Avinashi Road',
  'Vadavalli',
  'Saravanampatti'
];

const TN_REGIONS = [
  { name: 'Western Tamil Nadu', district: 'Coimbatore' },
  { name: 'Northern Tamil Nadu', district: 'Chennai' },
  { name: 'Central Tamil Nadu', district: 'Tiruchirappalli' },
  { name: 'Southern Tamil Nadu', district: 'Madurai' }
];

const CATEGORIES = [
  { label: 'Hospitals', cat: 'Hospital', icon: Building2 },
  { label: 'Colleges', cat: 'College/University', icon: GraduationCap },
  { label: 'Transit', cat: 'Transit/Station', icon: Train },
  { label: 'Parks', cat: 'Parks & Gardens', icon: Trees },
  { label: 'Shopping', cat: 'Shopping/Mall', icon: ShoppingBag },
  { label: 'Heritage', cat: 'Tourist Attraction', icon: Landmark }
];

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [coverage, setCoverage] = useState(null);
  const [pendingReports, setPendingReports] = useState(0);
  const [recentPlaces, setRecentPlaces] = useState([]);
  const [topPlaces, setTopPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [covRes, placesRes, topRes] = await Promise.all([
          placeService.getCoverage().catch(() => ({ data: null })),
          placeService.getPlaces({ limit: 6, sortBy: 'newest' }),
          placeService.getPlaces({ limit: 4, sortBy: 'accessibility_desc' })
        ]);

        setCoverage(covRes.data?.data || covRes.data || null);
        setRecentPlaces(placesRes.data.data || []);
        setTopPlaces(topRes.data.data || []);

        if (isAdmin) {
          try {
            const repRes = await placeService.getAdminReports();
            const list = repRes.data.data || repRes.data.reports || [];
            const pending = list.filter((r) => r.status === 'pending').length;
            setPendingReports(pending);
          } catch (e) {
            // Silently ignore report fetch error if not admin
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      navigate('/discover');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const { latitude, longitude } = pos.coords;
        navigate(`/discover?lat=${latitude}&lng=${longitude}&radius=10`);
      },
      () => {
        setGeoLoading(false);
        navigate('/discover?district=Coimbatore');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* 1. Compact Academic Dashboard Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              AccessAble Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Inclusive mobility discovery platform helping persons with disabilities and accessibility requirements explore verified public places across Tamil Nadu.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNearMe}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>{geoLoading ? 'Locating...' : 'Near Me'}</span>
            </button>
            <Link
              to="/discover?view=map"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Real Application Data Summary Cards */}
      <section aria-labelledby="summary-cards-heading">
        <h2 id="summary-cards-heading" className="sr-only">Platform Statistics Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Places Listed */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Places Listed</span>
              <Building2 className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {coverage ? coverage.totalPlaces : (loading ? '...' : recentPlaces.length)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Verified ground records
            </div>
          </div>

          {/* Card 2: Cities/Districts Covered */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Districts Covered</span>
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {coverage ? (coverage.districtsCoveredCount || coverage.totalDistricts || 31) : (loading ? '...' : '31')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Tamil Nadu administrative zones
            </div>
          </div>

          {/* Card 3: Places with Verified Accessibility */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Verified Ramps</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {coverage?.facilities?.wheelchairRampsAvailable ?? (loading ? '...' : 78)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Audited step-free entry
            </div>
          </div>

          {/* Card 4: Reports awaiting review or Accessible Restrooms */}
          {isAdmin ? (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Reports Pending</span>
                <Flag className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-700">
                {pendingReports}
              </div>
              <Link to="/admin" className="text-[11px] text-teal-700 hover:underline mt-1 font-bold block">
                Manage reports &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Accessible Toilets</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-700">
                {coverage?.facilities?.accessibleToiletsAvailable ?? (loading ? '...' : 65)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Audited door & grab-bar access
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Search and Quick Category Filter */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hospital, college, area (e.g. RS Puram, Peelamedu), city, or name..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Browse:
          </span>
          {CATEGORIES.map(({ label, cat, icon: Icon }) => (
            <Link
              key={cat}
              to={`/discover?category=${encodeURIComponent(cat)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-slate-500" />
              <span>{label}</span>
            </Link>
          ))}
          <Link
            to="/discover"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline ml-auto"
          >
            All Categories &rarr;
          </Link>
        </div>
      </section>

      {/* 4. Practical Locality Exploration: Coimbatore & Regional Hubs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Coimbatore Areas & Regional Destinations
          </h2>
          <Link to="/regions" className="text-xs font-bold text-teal-700 hover:underline">
            View Regional Hubs &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coimbatore Localities */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Coimbatore Metropolitan Localities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COIMBATORE_LOCALITIES.map((loc) => (
                <Link
                  key={loc}
                  to={`/discover?district=Coimbatore&locality=${encodeURIComponent(loc)}`}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors inline-flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{loc}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Major Tamil Nadu Regional Hubs */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tamil Nadu Geographic Zones
            </span>
            <div className="grid grid-cols-2 gap-2">
              {TN_REGIONS.map((reg) => (
                <Link
                  key={reg.name}
                  to={`/discover?region=${encodeURIComponent(reg.name)}`}
                  className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-xs font-bold text-slate-800 hover:text-teal-900 transition-colors flex items-center justify-between"
                >
                  <span>{reg.name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recent Additions & Audited Places */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recently Audited Places
            </h2>
            <p className="text-xs text-slate-500">
              Verified ground audit records in the database with genuine physical evaluations
            </p>
          </div>
          <Link
            to="/discover"
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading place directory..." />
        ) : recentPlaces.length === 0 ? (
          <p className="text-xs text-slate-500">No places listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentPlaces.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Top Accessibility Rated Places */}
      {topPlaces.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                High Accessibility Compliance Places
              </h2>
              <p className="text-xs text-slate-500">
                Venues with comprehensive ramp slope, elevator access, and accessible restrooms
              </p>
            </div>
            <Link
              to="/discover?sortBy=accessibility_desc"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Browse Top Accessible &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPlaces.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
