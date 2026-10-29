import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Accessibility,
  Search,
  MapPin,
  Navigation,
  Building2,
  GraduationCap,
  UtensilsCrossed,
  Train,
  Landmark,
  ShoppingBag,
  Trees,
  Waves,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { placeService } from '../services/api';
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
  'Pollachi Road'
];

const TAMIL_NADU_REGIONS = [
  'Coimbatore',
  'Chennai',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tiruppur',
  'Erode',
  'Nilgiris',
  'Thanjavur',
  'Kanyakumari'
];

const HomePage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await placeService.getPlaces({ limit: 4, sortBy: 'accessibility_desc' });
        setFeaturedPlaces(res.data.data || []);
      } catch (err) {
        console.error('Failed to load featured places:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const handleNearMeClick = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      navigate('/discover');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const { latitude, longitude } = position.coords;
        navigate(`/discover?lat=${latitude}&lng=${longitude}&radius=10`);
      },
      (err) => {
        setGeoLoading(false);
        console.warn('Geolocation error:', err.message);
        // Default to Coimbatore center if GPS denied
        navigate('/discover?district=Coimbatore');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const categories = [
    { label: 'Hospitals & Health', cat: 'Hospital', icon: Building2 },
    { label: 'Colleges & Campuses', cat: 'College/University', icon: GraduationCap },
    { label: 'Parks & Waterfronts', cat: 'Parks & Gardens', icon: Trees },
    { label: 'Transit & Stations', cat: 'Transit/Station', icon: Train },
    { label: 'Shopping & Malls', cat: 'Shopping/Mall', icon: ShoppingBag },
    { label: 'Culture & Heritage', cat: 'Tourist Attraction', icon: Landmark }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-b from-teal-900 via-teal-950 to-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl"
        aria-labelledby="hero-title"
      >
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-xs">
            <Accessibility className="w-4 h-4" aria-hidden="true" />
            <span>Inclusive Mobility & Universal Accessibility • Tamil Nadu</span>
          </div>

          <h1
            id="hero-title"
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto"
          >
            {t('heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Search Box & GPS CTA */}
          <div className="max-w-2xl mx-auto space-y-3">
            <form
              onSubmit={handleHeroSearch}
              className="flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
              role="search"
              aria-label="Direct hero place search"
            >
              <div className="relative flex-1">
                <label htmlFor="hero-search-input" className="sr-only">
                  Search place name, location, or keywords
                </label>
                <Search
                  className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="hero-search-input"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <span>{t('explorePlaces')}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleNearMeClick}
                disabled={geoLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700/80 hover:bg-teal-600/90 text-white rounded-xl text-xs font-bold border border-teal-500/40 shadow-xs transition-colors backdrop-blur-xs focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                <span>{geoLoading ? 'Locating...' : t('findNearMeBtn')}</span>
              </button>
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>View Full Map & Directory</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-slate-300 text-xs border-t border-white/10">
            <div>
              <div className="text-2xl font-black text-white">110+ Venues</div>
              <div className="text-slate-400">31+ Districts in Tamil Nadu</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">5-State Logic</div>
              <div className="text-slate-400">Multi-Status Evidence Audits</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">Real Photos</div>
              <div className="text-slate-400">Attributed CC & Official Imagery</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">Tri-Lingual</div>
              <div className="text-slate-400">English • தமிழ் • हिंदी</div>
            </div>
          </div>
        </div>
      </section>

      {/* Coimbatore Localities Quick Exploration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="coimbatore-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Primary City Coverage
            </span>
            <h2 id="coimbatore-heading" className="text-2xl font-black text-slate-900 tracking-tight">
              {t('coimbatoreFocus')}
            </h2>
          </div>
          <Link
            to="/discover?district=Coimbatore"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            All Coimbatore Places <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {COIMBATORE_LOCALITIES.map((loc) => (
            <Link
              key={loc}
              to={`/discover?district=Coimbatore&locality=${encodeURIComponent(loc)}`}
              className="px-3.5 py-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-800 transition-colors shadow-2xs flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <MapPin className="w-3 h-3 text-teal-600" />
              <span>{loc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Navigation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="categories-heading">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 id="categories-heading" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Browse by Place Category
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Select a public venue type to view its accessibility compliance and physical audits.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ label, cat, icon: Icon }) => (
            <Link
              key={cat}
              to={`/discover?category=${encodeURIComponent(cat)}`}
              className="p-5 bg-white border border-slate-200 hover:border-teal-500 rounded-2xl shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 group focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white transition-colors flex items-center justify-center">
                <Icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Places Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="featured-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 id="featured-heading" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top-Rated Accessible Places in Tamil Nadu
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Field-audited public venues with comprehensive ramps, lifts, and accessible facilities.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
          >
            <span>View All Public Places</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading verified places..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        )}
      </section>

      {/* Tamil Nadu Regional Coverage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="tn-regions-heading">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Statewide Coverage
              </span>
              <h2 id="tn-regions-heading" className="text-2xl font-black mt-1">
                {t('tamilNaduDestinations')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Explore barrier-free public facilities, heritage sites, beaches, and health centers across Tamil Nadu.
              </p>
            </div>
            <Link
              to="/regions"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>Explore All 4 Regional Zones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TAMIL_NADU_REGIONS.map((region) => (
              <Link
                key={region}
                to={`/discover?district=${encodeURIComponent(region)}`}
                className="p-3 bg-slate-800/80 hover:bg-teal-800/80 border border-slate-700/80 hover:border-teal-500 rounded-xl text-center text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                {region}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The 5-State Evidence Truth Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Verification Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Why AccessAble Never Treats Missing Data as Unavailable
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Standard directory apps assume that if a ramp or lift is unrecorded, it doesn't exist. This misleads wheelchair users and discourages visits. AccessAble implements evidentiary tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-950 text-base mb-1">Verified Available</h3>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Confirmed through physical on-site audit or verified photographic proof with usable dimensions and clear entry.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] font-semibold text-emerald-800">
                Guaranteed barrier-free access.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-rose-950 text-base mb-1">Verified Unavailable</h3>
                <p className="text-xs text-rose-900 leading-relaxed">
                  Confirmed physical barrier (e.g. flight of stairs with no alternative ramp, or non-compliant narrow restroom doors).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200 text-[11px] font-semibold text-rose-800">
                Prevents stranded trips and unexpected barriers.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-amber-950 text-base mb-1">Unknown / Unaudited</h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Facility condition has not yet been audited. We clearly flag it so visitors know to call or check before traveling.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] font-semibold text-amber-800">
                Ethical and truthful representation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Contribution Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-teal-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Know an Accessible Venue in Tamil Nadu?
            </h2>
            <p className="text-sm text-teal-100 leading-relaxed">
              Help make public life accessible for everyone. Submit a hospital, campus, library, or cafe and document its ramps, elevators, and assistive accommodations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/places/new"
              className="px-6 py-3 bg-white text-teal-900 font-bold text-sm rounded-xl hover:bg-teal-50 transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Submit a Place
            </Link>
            <Link
              to="/discover"
              className="px-6 py-3 bg-teal-800 text-white font-bold text-sm rounded-xl hover:bg-teal-900 transition-colors border border-teal-600 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Explore Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
