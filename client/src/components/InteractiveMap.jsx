import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Accessibility, ExternalLink, ShieldCheck } from 'lucide-react';

// Custom Accessible Marker Icon Generator
const createPlaceIcon = (category = 'Other', isVerified = true) => {
  const color = isVerified ? '#0d9488' : '#334155'; // teal-600 vs slate-700
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        cursor: pointer;
      ">
        <div style="transform: rotate(45deg); color: white; display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.93 4.93 4.24 4.24"/>
            <path d="m14.83 9.17 4.24-4.24"/>
            <path d="m14.83 14.83 4.24 4.24"/>
            <path d="m9.17 14.83-4.24 4.24"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32]
  });
};

const userLocationIcon = L.divIcon({
  className: 'user-map-marker',
  html: `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
    ">
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background-color: #3b82f6;
        opacity: 0.35;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 20px;
        height: 20px;
        margin: 2px;
        border-radius: 50%;
        background-color: #2563eb;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
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
  // Default to Coimbatore Central if no coordinates
  const defaultCenter = [11.0168, 76.9558];

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : places.length > 0 && places[0].coordinates?.lat
    ? [places[0].coordinates.lat, places[0].coordinates.lng]
    : defaultCenter;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <MapRecenter center={mapCenter} zoom={defaultZoom} />

        {/* Clean OpenStreetMap Carto tiles with high readability */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* User Location Marker & Radius Circle */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
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
                  color: '#0d9488',
                  fillColor: '#0d9488',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
            )}
          </>
        )}

        {/* Place Markers */}
        {places.map((place) => {
          const lat = place.coordinates?.lat || place.location?.coordinates?.[1];
          const lng = place.coordinates?.lng || place.location?.coordinates?.[0];

          if (!lat || !lng) return null;

          const isSelected = selectedPlaceId && selectedPlaceId === place._id;
          const candidatePhoto = (place.photos?.[0]?.url || place.images?.[0] || '');
          const hasValidPhoto = candidatePhoto && !candidatePhoto.includes('images.unsplash.com');

          return (
            <Marker
              key={place._id}
              position={[lat, lng]}
              icon={createPlaceIcon(place.category, place.status === 'verified')}
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
    </div>
  );
};

export default InteractiveMap;
