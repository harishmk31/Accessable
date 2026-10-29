import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Accessibility,
  Search,
  ShieldCheck,
  Building2,
  GraduationCap,
  UtensilsCrossed,
  Train,
  Landmark,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  XCircle,
  HeartHandshake
} from 'lucide-react';
import { placeService } from '../services/api';
import PlaceCard from '../components/PlaceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const categories = [
    { label: 'Hospitals & Health', cat: 'Hospital', icon: Building2 },
    { label: 'Colleges & Universities', cat: 'College/University', icon: GraduationCap },
    { label: 'Restaurants & Cafes', cat: 'Restaurant/Cafe', icon: UtensilsCrossed },
    { label: 'Transit & Metro', cat: 'Transit/Station', icon: Train },
    { label: 'Offices & Government', cat: 'Office/Government', icon: Landmark },
    { label: 'Shopping & Malls', cat: 'Shopping/Mall', icon: ShoppingBag }
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
            <span>Inclusive Mobility & Universal Accessibility</span>
          </div>

          <h1
            id="hero-title"
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Discover Public Places Built For{' '}
            <span className="text-teal-400 underline decoration-teal-500/60 decoration-wavy">
              Everyone
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find hospitals, colleges, transit hubs, cafes, and offices audited for wheelchair ramps, elevators, accessible restrooms, tactile braille signage, and assistive audio.
          </p>

          {/* Search Box Form */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
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
                placeholder="Search hospital, college, metro, or city..."
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <span>Explore Places</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-slate-300 text-xs border-t border-white/10">
            <div>
              <div className="text-2xl font-black text-white">6 Facilities</div>
              <div className="text-slate-400">Audited in Every Place</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">3-State Logic</div>
              <div className="text-slate-400">Available / Unavailable / Unknown</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">100% Verified</div>
              <div className="text-slate-400">Community & Admin Moderated</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">Dual Ratings</div>
              <div className="text-slate-400">General + Accessibility Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="categories-heading">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 id="categories-heading" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Browse by Place Category
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Select a public place type to view its accessibility compliance records.
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

      {/* The 3-State Truth Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Core Design Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Why AccessAble Uses 3-State Facility Modeling
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Most platforms make a dangerous assumption: if accessibility information is missing, they label the facility as unavailable. AccessAble enforces strict 3-state data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-950 text-base mb-1">Available</h3>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Explicitly verified on-site or confirmed by community audits with functional grab bars, ramps, or elevators in working order.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] font-semibold text-emerald-800">
                Guarantees usable barrier-free access.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-rose-950 text-base mb-1">Unavailable</h3>
                <p className="text-xs text-rose-900 leading-relaxed">
                  Physically confirmed to lack the facility (e.g. stairs-only entrance, out-of-order lift, or restrooms without turning radii).
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
                <h3 className="font-bold text-amber-950 text-base mb-1">Unknown / Unverified</h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Data has not yet been audited. We never assume missing data means unavailable, alerting visitors to call or verify ahead.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] font-semibold text-amber-800">
                Ethical data representation without false assumptions.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Places Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="featured-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 id="featured-heading" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top-Rated Accessible Places
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Reviewed public venues with comprehensive accessibility provisions.
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

      {/* Call to Action for Community Contributions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-teal-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Know an Accessible Public Venue?
            </h2>
            <p className="text-sm text-teal-100 leading-relaxed">
              Help make your city more inclusive. Submit a hospital, campus, library, or cafe and document its ramps, elevators, and assistive accommodations.
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
              Search Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
