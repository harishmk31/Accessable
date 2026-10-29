import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Star,
  MapPin,
  Building2,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { reviewService } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import StarRating from '../components/StarRating';
import FacilityBadge from '../components/FacilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const ReviewsPage = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await reviewService.getRecentReviews();
        setReviews(res.data.data || []);
      } catch (err) {
        console.error('Error loading reviews:', err.message);
        setError('Unable to load community reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const categories = ['All', 'Hospital', 'Transit/Station', 'College/University', 'Shopping/Mall', 'Tourist Attraction'];

  const filteredReviews = filterCategory === 'All'
    ? reviews
    : reviews.filter((r) => r.place?.category === filterCategory);

  const avgAccessScore = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.accessibilityRating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>User Verified Audits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Accessibility Reviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          First-hand community feedback on ramp gradients, door clearances, grab bars, audio assistance, and barrier-free access conditions across Tamil Nadu venues.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Community Reviews</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{reviews.length}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Moderated feedback</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Average Access Score</span>
          <span className="text-2xl font-black text-teal-700 mt-0.5 block">{avgAccessScore} / 5.0</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Based on lived mobility</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-medium block">Evidentiary Standard</span>
          <span className="text-sm font-bold text-slate-900 mt-1 block">5-Status Verification</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Zero fabricated claims</span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterCategory === cat
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reviews Content */}
      {loading ? (
        <LoadingSpinner message="Loading community accessibility reviews..." />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
          {error}
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          title="No reviews found"
          message="No accessibility reviews match the selected filter. Be the first to share your accessibility experience."
          actionText="Browse Places"
          actionLink="/discover"
        />
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const place = rev.place;
            return (
              <article
                key={rev._id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header: Place name & reviewer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    {place ? (
                      <Link
                        to={`/places/${place._id}`}
                        className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{place.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                      </Link>
                    ) : (
                      <span className="text-base font-bold text-slate-900">Verified Place</span>
                    )}

                    {place && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {place.locality ? `${place.locality}, ` : ''}{place.city}, {place.district}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {place.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{rev.user?.name || 'Community Member'}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Rating bars */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">General:</span>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Accessibility:</span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                      {rev.accessibilityRating} / 5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  "{rev.comment}"
                </p>

                {/* Facility Feedback Pills */}
                {rev.facilityFeedback && (
                  <div className="pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Reported Conditions
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {Object.entries(rev.facilityFeedback).map(([key, val]) => {
                        if (val === 'Not Checked' || !val) return null;
                        const isAvailable = val === 'Available';
                        const isUnavailable = val === 'Unavailable';
                        return (
                          <span
                            key={key}
                            className={`px-2 py-0.5 rounded-md font-semibold border ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isUnavailable
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {key.replace(/([A-Z])/g, ' $1').trim()}: {val}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
