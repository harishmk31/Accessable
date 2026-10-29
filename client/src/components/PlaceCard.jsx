import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';
import StarRating from './StarRating';
import FacilityBadge from './FacilityBadge';

const PlaceCard = ({ place }) => {
  const {
    _id,
    name,
    description,
    category,
    address,
    city,
    state,
    facilities = {},
    facilityNotes = {},
    averageRating = 0,
    averageAccessibilityRating = 0,
    totalReviews = 0,
    images = [],
    status = 'verified'
  } = place;

  const defaultImage =
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';
  const displayImage = images && images.length > 0 ? images[0] : defaultImage;

  return (
    <article
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col focus-within:ring-2 focus-within:ring-teal-600"
      aria-labelledby={`place-heading-${_id}`}
    >
      {/* Thumbnail header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={`Exterior view of ${name}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-semibold rounded-full shadow-xs">
            {category}
          </span>
          {status === 'verified' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600/90 backdrop-blur-xs text-white text-xs font-semibold rounded-full shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Main card body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating bar */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <StarRating rating={averageRating} size="sm" label="General Rating" />
            <div
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
              title="Dedicated Accessibility Experience Rating"
            >
              <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Access: {averageAccessibilityRating ? averageAccessibilityRating.toFixed(1) : 'New'}</span>
            </div>
          </div>

          <h3
            id={`place-heading-${_id}`}
            className="text-lg font-bold text-slate-900 line-clamp-1 hover:text-teal-700 transition-colors"
          >
            <Link
              to={`/places/${_id}`}
              className="focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-xs"
            >
              {name}
            </Link>
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{address}, {city}, {state}</span>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Accessibility facility overview */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Accessibility Facilities:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <FacilityBadge
                facilityKey="wheelchairRamp"
                status={facilities.wheelchairRamp}
                compact
              />
              <FacilityBadge
                facilityKey="elevatorLift"
                status={facilities.elevatorLift}
                compact
              />
              <FacilityBadge
                facilityKey="accessibleToilet"
                status={facilities.accessibleToilet}
                compact
              />
              <FacilityBadge
                facilityKey="accessibleParking"
                status={facilities.accessibleParking}
                compact
              />
              <FacilityBadge
                facilityKey="brailleSignage"
                status={facilities.brailleSignage}
                compact
              />
              <FacilityBadge
                facilityKey="audioAssistance"
                status={facilities.audioAssistance}
                compact
              />
            </div>
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
          <Link
            to={`/places/${_id}`}
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            aria-label={`View full accessibility details for ${name}`}
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PlaceCard;
