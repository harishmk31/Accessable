import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Train,
  ShoppingBag,
  Trees,
  Landmark,
  UtensilsCrossed,
  CameraOff,
  MapPin,
  Camera
} from 'lucide-react';

const getCategoryIcon = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('hospital') || cat.includes('health') || cat.includes('clinic')) return Building2;
  if (cat.includes('college') || cat.includes('university') || cat.includes('school')) return GraduationCap;
  if (cat.includes('transit') || cat.includes('station') || cat.includes('bus') || cat.includes('rail')) return Train;
  if (cat.includes('mall') || cat.includes('shop')) return ShoppingBag;
  if (cat.includes('park') || cat.includes('garden') || cat.includes('beach')) return Trees;
  if (cat.includes('monument') || cat.includes('attraction') || cat.includes('temple') || cat.includes('heritage')) return Landmark;
  if (cat.includes('restaurant') || cat.includes('cafe') || cat.includes('food')) return UtensilsCrossed;
  return MapPin;
};

/**
 * PlacePhoto Component
 * Displays a confirmed photograph of the exact location when available,
 * or falls back to a neutral, dignified placeholder ("Photo unavailable").
 * NEVER displays unrelated stock photos.
 */
const PlacePhoto = ({
  photos = [],
  images = [],
  placeName = '',
  category = '',
  className = 'w-full h-48',
  showAttribution = true,
  aspectRatio = null
}) => {
  const [imgError, setImgError] = useState(false);

  // Filter out any known generic stock photo URLs
  const candidateUrl = (() => {
    if (photos && photos.length > 0 && photos[0]?.url) {
      const url = photos[0].url;
      if (url.includes('images.unsplash.com')) return null; // strip generic unsplash
      return url;
    }
    if (images && images.length > 0 && typeof images[0] === 'string') {
      const url = images[0];
      if (url.includes('images.unsplash.com')) return null;
      return url;
    }
    return null;
  })();

  const photoMeta = photos && photos.length > 0 ? photos[0] : null;
  const CategoryIcon = getCategoryIcon(category);

  // Route Wikimedia Commons photos through backend proxy to avoid 403 hotlink blocks
  const displayUrl = (() => {
    if (!candidateUrl) return null;
    if (candidateUrl.startsWith('https://upload.wikimedia.org/')) {
      return `/api/places/photo-proxy?url=${encodeURIComponent(candidateUrl)}`;
    }
    return candidateUrl;
  })();

  // If no confirmed photo or image load failed, render neutral placeholder
  if (!candidateUrl || imgError) {
    return (
      <div
        className={`relative bg-slate-100 border border-slate-200/60 flex flex-col items-center justify-center text-slate-400 overflow-hidden select-none ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
        role="img"
        aria-label={`Photo unavailable for ${placeName || 'this venue'}`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center mb-2 shadow-2xs">
          <CategoryIcon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="text-center px-4">
          <span className="text-xs font-semibold text-slate-600 block leading-tight">
            Photo unavailable
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {category || 'Verified Directory Venue'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-slate-900 overflow-hidden group ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        src={displayUrl}
        alt={`Exterior view of ${placeName || 'the venue'}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />

      {/* Subtle bottom gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10 pointer-events-none" />

      {/* Real Photo Attribution badge */}
      {showAttribution && (photoMeta?.author || photoMeta?.authorName || photoMeta?.attribution) && (
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/85 text-slate-200 text-[10px] font-medium backdrop-blur-xs border border-white/10">
            <Camera className="w-3 h-3 text-teal-400" />
            <span className="truncate max-w-[160px]">
              {photoMeta.author || photoMeta.authorName || photoMeta.attribution?.split('/')?.[2]?.trim() || 'Wikimedia Contributor'}
            </span>
            {(photoMeta.license || photoMeta.attribution?.split('/')?.[1]?.trim()) && (
              <span className="text-slate-400 text-[9px] uppercase">
                ({photoMeta.license || photoMeta.attribution?.split('/')?.[1]?.trim()})
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default PlacePhoto;
