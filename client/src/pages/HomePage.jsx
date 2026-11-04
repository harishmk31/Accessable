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
  Map,
  PlusCircle,
  Sparkles,
  Eye,
  FileCheck2,
  AlertCircle,
  UtensilsCrossed,
  Briefcase
} from 'lucide-react';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import PlaceCard from '../components/PlaceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const FACILITY_SHORTCUTS = [
  { label: 'Wheelchair Ramp', icon: '♿', param: 'wheelchairRamp' },
  { label: 'Elevator / Lift', icon: '🛗', param: 'elevatorLift' },
  { label: 'Accessible Restroom', icon: '🚻', param: 'accessibleToilet' },
  { label: 'Accessible Parking', icon: '🅿️', param: 'accessibleParking' },
  { label: 'Braille Signage', icon: '⠃⠗', param: 'brailleSignage' },
  { label: 'Audio Assistance', icon: '🔊', param: 'audioAssistance' }
];

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
  { label: 'Restaurants', cat: 'Restaurant/Cafe', icon: UtensilsCrossed },
  { label: 'Offices', cat: 'Office/Government', icon: Briefcase },
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
      {/* 1. Purposeful Accessibility Discovery Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden border border-slate-700/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Discover Accessible Public Places Across Tamil Nadu
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            AccessAble helps people with disabilities, seniors, and caregivers find accessible public places across Tamil Nadu—including hospitals, colleges, offices, transit hubs, and restaurants. Accessibility facilities are cataloged based on available data; places with unconfirmed facilities are clearly marked.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md hover:shadow-teal-500/25 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
              aria-label="Find Accessible Places"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Find Accessible Places</span>
            </Link>

            <Link
              to="/places/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-xl transition-all backdrop-blur-xs focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              aria-label="Register a Place"
            >
              <PlusCircle className="w-4 h-4 text-teal-300" />
              <span>Register a Place</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. Instant Search Bar & Facility Shortcut Filter Row */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4" aria-label="Search and filter places">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hospitals, colleges, railway stations, malls, or localities (e.g. RS Puram, Peelamedu, Gandhipuram)..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20"
              aria-label="Search places by name or locality"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 shrink-0 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Facility Filter Shortcuts */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Filter by facility:
            </span>
            <Link to="/discover" className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline">
              View all filters &rarr;
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FACILITY_SHORTCUTS.map(({ label, icon, param }) => (
              <Link
                key={param}
                to={`/discover?${param}=true`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold transition-colors"
                aria-label={`Filter places with ${label}`}
              >
                <span className="text-sm" aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Browse by category:
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
        </div>
      </section>

      {/* 3. Real Application Data Summary Cards */}
      <section aria-labelledby="summary-cards-heading">
        <h2 id="summary-cards-heading" className="sr-only">Platform Statistics Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Places Listed */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Cataloged Places</span>
              <Building2 className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {coverage ? coverage.totalPlaces : (loading ? '...' : recentPlaces.length)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Tamil Nadu directory records
            </div>
          </div>

          {/* Card 2: Cities/Districts Covered */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Districts Covered</span>
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {coverage ? (coverage.districtsCoveredCount || coverage.totalDistricts || 30) : (loading ? '...' : '30')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              30 administrative zones
            </div>
          </div>

          {/* Card 3: Places with Verified Accessibility */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Step-Free Ramps</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {coverage ? (coverage.facilities?.wheelchairRampsAvailable ?? 0) : (loading ? '...' : 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Confirmed ramp access
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
                <span>Accessible Restrooms</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-700">
                {coverage ? (coverage.facilities?.accessibleToiletsAvailable ?? 0) : (loading ? '...' : 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Confirmed accessible washrooms
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Three-Pillar Verification Methodology Section */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4" aria-labelledby="methodology-heading">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Evaluation Methodology
          </div>
          <h2 id="methodology-heading" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            How Physical Accessibility Is Evaluated
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            AccessAble catalogs public places and accessibility features across Tamil Nadu using structured evaluation, transparent status tracking, and computer-vision assisted verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Pillar 1 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              1. Physical Audits & Field Data
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Documents ramp slopes, doorway clearances, step-free access, and elevator suitability where ground audit data has been recorded.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              2. Transparent Status Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Facilities are labeled as <span className="font-semibold text-emerald-700">Available</span>, <span className="font-semibold text-amber-700">Reported</span>, or <span className="font-semibold text-slate-500">Unknown</span> so visitors know what has been confirmed.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              3. Image & Computer Vision Analysis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Venue entrance photos are analyzed with explainable heuristics and vision models to identify ramps, steps, and visible barrier-free features.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Practical Locality Exploration: Coimbatore & Regional Hubs */}
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
              Recently Added Places
            </h2>
            <p className="text-xs text-slate-500">
              Directory records across Tamil Nadu with documented accessibility features
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
