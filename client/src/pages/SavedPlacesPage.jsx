import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import PlaceCard from '../components/PlaceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SavedPlacesPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedPlaces = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getSavedPlaces();
      setPlaces(res.data.places || []);
    } catch (err) {
      console.error('[SavedPlaces] Error loading:', err.message);
      setError('Unable to load saved places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPlaces();
  }, [user]);

  const handleToggleSave = (placeId, nowSaved) => {
    if (!nowSaved) {
      setPlaces((prev) => prev.filter((p) => p._id !== placeId));
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
          <Bookmark className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          {t('savedPlaces')}
        </h1>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          Sign in to save and organize accessible locations across Coimbatore and Tamil Nadu for your visits.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
        >
          {t('signIn')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/discover"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('discover')}
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-teal-600 fill-teal-600" />
            {t('savedPlaces')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Your personal collection of accessible venues in Coimbatore and Tamil Nadu.
          </p>
        </div>

        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
        >
          <Compass className="w-4 h-4 text-teal-600" />
          {t('discover')}
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading your saved places..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          {error}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            No saved places yet
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            Click the bookmark icon on any verified hospital, college, park, or restaurant in Tamil Nadu to save it here for fast access.
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <Compass className="w-4 h-4" />
            Explore Coimbatore & Tamil Nadu Places
          </Link>
        </div>
      ) : (
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">
            {places.length} {places.length === 1 ? 'place' : 'places'} saved
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard
                key={place._id}
                place={place}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPlacesPage;
