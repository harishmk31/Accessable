import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Navigation, ShieldCheck } from 'lucide-react';

// Fix leaflet default marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Create colored marker icons based on accessibility tier
const createTierIcon = (tier = 'Insufficient Data') => {
  let color = '#64748b'; // slate (Insufficient Data)
  let emoji = '❓';

  if (tier === 'High Accessibility') {
    color = '#10b981'; // emerald green
    emoji = '♿';
  } else if (tier === 'Moderate Accessibility') {
    color = '#2563eb'; // blue
    emoji = '🏢';
  } else if (tier === 'Limited Accessibility') {
    color = '#ef4444'; // red
    emoji = '⚠️';
  }

  return L.divIcon({
    className: 'custom-tier-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        cursor: pointer;
      ">
        <span style="transform: rotate(45deg); font-size: 13px;">${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  });
};

const userLocationIcon = L.divIcon({
  className: 'user-map-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; inset: 0; border-radius: 50%; background-color: #3b82f6; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 18px; height: 18px; margin: 3px; border-radius: 50%; background-color: #2563eb; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Component to dynamically adjust map view when bounds change
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

const InteractiveMap = ({
  places = [],
  userLocation = null,
  radiusKm = null,
  selectedPlaceId = null,
  onPlaceSelect = null,
  height = '500px',
  defaultZoom = 12
}) => {
  // Coimbatore central default
  const defaultCenter = [11.0168, 76.9558];

  // Filter places to only those with valid geographic coordinates inside Tamil Nadu (lat 8.0-13.6, lng 76.0-80.6)
  const validPlaces = places.filter((p) => {
    const lat = p.coordinates?.lat || p.location?.coordinates?.[1];
    const lng = p.coordinates?.lng || p.location?.coordinates?.[0];
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= 8.0 &&
      lat <= 13.6 &&
      lng >= 76.0 &&
      lng <= 80.6
    );
  });

  const firstPlaceCoords =
    validPlaces.length > 0
      ? [
          validPlaces[0].coordinates?.lat || validPlaces[0].location?.coordinates?.[1],
          validPlaces[0].coordinates?.lng || validPlaces[0].location?.coordinates?.[0]
        ]
      : null;

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : firstPlaceCoords || defaultCenter;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs z-0">
      {/* Top Banner showing truthful mapped count */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs font-semibold text-slate-800 flex items-center gap-2">
        <span>
          {validPlaces.length} of {places.length} places mapped in Tamil Nadu
        </span>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <MapRecenter center={mapCenter} zoom={defaultZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* User Location Marker & Radius Circle */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="text-xs font-bold text-slate-800 p-1">
                  📍 Your Detected Location
                </div>
              </Popup>
            </Marker>

            {radiusKm && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#087F8C',
                  fillColor: '#087F8C',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
            )}
          </>
        )}

        {/* Place Markers */}
        {validPlaces.map((place) => {
          const lat = place.coordinates?.lat || place.location?.coordinates?.[1];
          const lng = place.coordinates?.lng || place.location?.coordinates?.[0];

          const candidatePhoto = place.photos?.[0]?.url || place.images?.[0] || '';
          const hasValidPhoto = candidatePhoto && !candidatePhoto.includes('images.unsplash.com');

          return (
            <Marker
              key={place._id}
              position={[lat, lng]}
              icon={createTierIcon(place.accessibilityTier)}
              eventHandlers={{
                click: () => {
                  if (onPlaceSelect) onPlaceSelect(place);
                }
              }}
            >
              <Popup className="accessable-map-popup" minWidth={240} maxWidth={280}>
                <div className="p-1 space-y-2">
                  <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400">
                    {hasValidPhoto ? (
                      <img
                        src={candidatePhoto}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-[11px] font-semibold text-slate-500 block">Photo unavailable</span>
                        <span className="text-[9px] text-slate-400 block">{place.category}</span>
                      </div>
                    )}
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                      {place.category}
                    </span>
                    {place.status === 'verified' && (
                      <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-600/90 text-white text-[10px] font-bold rounded-md">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {place.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {place.locality ? `${place.locality}, ` : ''}{place.city}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium">
                    Accessibility: <strong className="text-teal-700">{place.accessibilityTier || 'Insufficient Data'}</strong>
                  </div>

                  {place.distanceKm !== undefined && (
                    <div className="text-[11px] font-semibold text-teal-700">
                      📍 {place.distanceKm} km away from you
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <Link
                      to={`/places/${place._id}`}
                      className="flex-1 py-1 px-2 bg-teal-600 hover:bg-teal-700 text-white text-center text-xs font-bold rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                      title="Get Directions on Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-teal-700" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-slate-200 text-[10px] text-slate-600 shadow-xs flex items-center gap-2.5">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> High (70+)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Moderate (40-69)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Limited (1-39)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Insufficient Data
        </span>
      </div>
    </div>
  );
};

export default InteractiveMap;
