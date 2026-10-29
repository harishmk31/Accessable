import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Heart,
  Navigation,
  ArrowRight,
  Accessibility,
  Camera
} from 'lucide-react';
import StarRating from './StarRating';
import FacilityBadge from './FacilityBadge';
import PlacePhoto from './PlacePhoto';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useTranslation } from '../context/LanguageContext';

const PlaceCard = ({ place, onBookmarkToggle = null }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const {
    _id,
    name,
    description,
    category,
    address,
    locality,
    city,
    district,
    facilities = {},
    accessibilityProfile = {},
    averageRating = 0,
    averageAccessibilityRating = 0,
    totalReviews = 0,
    photos = [],
    images = [],
    status = 'verified',
    distanceKm
  } = place;

  // Check if bookmarked
  const [isSaved, setIsSaved] = useState(
    user?.savedPlaces ? user.savedPlaces.some((sp) => (sp._id || sp) === _id) : false
  );
  const [savingBookmark, setSavingBookmark] = useState(false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to save places to your bookmarks.');
      return;
    }

    try {
      setSavingBookmark(true);
      const res = await authService.toggleSavePlace(_id);
      setIsSaved(res.data.isSaved);
      if (onBookmarkToggle) onBookmarkToggle(_id, res.data.isSaved);
    } catch (err) {
      console.warn('Could not toggle save place:', err.message);
    } finally {
      setSavingBookmark(false);
    }
  };

  const mapDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${name}, ${locality ? locality + ', ' : ''}${city}, Tamil Nadu`
  )}`;

  return (
    <article
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col focus-within:ring-2 focus-within:ring-teal-600 group"
      aria-labelledby={`place-heading-${_id}`}
    >
      {/* Thumbnail Header with Verified PlacePhoto & Badges */}
      <div className="relative w-full overflow-hidden">
        <PlacePhoto
          photos={photos}
          images={images}
          placeName={name}
          category={category}
          className="w-full h-44"
          showAttribution={true}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs pointer-events-auto">
              {category}
            </span>
            {status === 'verified' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600/95 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs pointer-events-auto">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleSaveToggle}
            disabled={savingBookmark}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors pointer-events-auto shadow-xs ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600'
            }`}
            title={isSaved ? 'Remove from bookmarks' : 'Save place'}
            aria-label={isSaved ? 'Remove from saved places' : 'Save this place'}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating bar & Distance */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <StarRating rating={averageRating} size="sm" label="General Rating" />

            {distanceKm !== undefined ? (
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                📍 {distanceKm} km away
              </span>
            ) : (
              <div
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                title="Accessibility Experience Score"
              >
                <span>Access: {averageAccessibilityRating ? averageAccessibilityRating.toFixed(1) : 'New'} / 5</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            id={`place-heading-${_id}`}
            className="text-base font-bold text-slate-900 line-clamp-1 hover:text-teal-700 transition-colors"
          >
            <Link to={`/places/${_id}`} className="focus-visible:outline-none focus-visible:underline">
              {name}
            </Link>
          </h3>

          {/* Location / Locality & District */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {locality ? <strong className="text-slate-700">{locality}, </strong> : ''}
              {city}, {district}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed">
            {description}
          </p>

          {/* Accessibility Facilities Chips */}
          <div className="border-t border-slate-100 pt-2.5">
            <div className="flex flex-wrap gap-1">
              <FacilityBadge
                facilityKey="wheelchairRamp"
                status={accessibilityProfile.ramp?.status || facilities.wheelchairRamp}
                compact
              />
              <FacilityBadge
                facilityKey="elevatorLift"
                status={accessibilityProfile.lift?.status || facilities.elevatorLift}
                compact
              />
              <FacilityBadge
                facilityKey="accessibleToilet"
                status={accessibilityProfile.accessibleToilet?.status || facilities.accessibleToilet}
                compact
              />
              <FacilityBadge
                facilityKey="accessibleParking"
                status={accessibilityProfile.accessibleParking?.status || facilities.accessibleParking}
                compact
              />
              <FacilityBadge
                facilityKey="brailleSignage"
                status={accessibilityProfile.brailleSignage?.status || facilities.brailleSignage}
                compact
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>

          <div className="flex items-center gap-1.5">
            <a
              href={mapDirectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Get Directions on Google Maps"
              aria-label={`Get directions to ${name} on Google Maps`}
            >
              <Navigation className="w-4 h-4" />
            </a>

            <Link
              to={`/places/${_id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              aria-label={`View full accessibility details for ${name}`}
            >
              <span>{t('discover')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PlaceCard;
