import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Search,
  Filter,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  ArrowLeft,
  X
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { placeService } from '../services/api';
import FacilityBadge from '../components/FacilityBadge';
import PlacePhoto from '../components/PlacePhoto';
import LoadingSpinner from '../components/LoadingSpinner';

// Leaflet fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Create colored marker icons based on accessibility tier
const createTierIcon = (tier) => {
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
  } else if (tier === 'Insufficient Data') {
    color = '#64748b'; // slate gray
    emoji = '❓';
  }

  return L.divIcon({
    className: 'custom-tier-marker',
    html: `<div style="background-color: ${color}; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 2px solid white;"><span style="transform: rotate(45deg); font-size: 14px;">${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });
};

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function AccessibilityMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [coverageNotice, setCoverageNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]); // Coimbatore default
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [filterRampOnly, setFilterRampOnly] = useState(searchParams.get('wheelchairRamp') === 'Available');
  const [filterLiftOnly, setFilterLiftOnly] = useState(searchParams.get('elevatorLift') === 'Available');
  const [filterToiletOnly, setFilterToiletOnly] = useState(searchParams.get('accessibleToilet') === 'Available');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch places
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const params = {
          q: searchQuery || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          wheelchairRamp: filterRampOnly ? 'Available' : undefined,
          elevatorLift: filterLiftOnly ? 'Available' : undefined,
          accessibleToilet: filterToiletOnly ? 'Available' : undefined
        };
        const res = await placeService.getMapPlaces(params);
        if (res.data?.success) {
          setPlaces(res.data.data);
          setCoverageNotice(res.data.coverageNotice || '');
          // If query has results, center to first result
          if (res.data.data.length > 0) {
            const first = res.data.data[0];
            const lat = first.coordinates?.lat || first.location?.coordinates?.[1];
            const lng = first.coordinates?.lng || first.location?.coordinates?.[0];
            if (lat && lng) setMapCenter([lat, lng]);
          }
        }
      } catch (err) {
        console.error('Error fetching map places:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [searchQuery, selectedCategory, filterRampOnly, filterLiftOnly, filterToiletOnly]);

  // Request user GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
      },
      (err) => {
        alert('Could not get your location: ' + err.message);
      }
    );
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    const lat = place.coordinates?.lat || place.location?.coordinates?.[1];
    const lng = place.coordinates?.lng || place.location?.coordinates?.[0];
    if (lat && lng) {
      setMapCenter([lat, lng]);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Top filter toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 z-10 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Link
            to="/discover"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Back to Directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter map places..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterRampOnly(!filterRampOnly)}
            className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
              filterRampOnly
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ♿ Ramp Required
          </button>
          <button
            type="button"
            onClick={() => setFilterLiftOnly(!filterLiftOnly)}
            className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
              filterLiftOnly
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🛗 Elevator / Lift
          </button>
          <button
            type="button"
            onClick={() => setFilterToiletOnly(!filterToiletOnly)}
            className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
              filterToiletOnly
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🚻 Accessible Restroom
          </button>
          <button
            type="button"
            onClick={handleLocateMe}
            className="px-3 py-1.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition flex items-center gap-1 shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Locate Me</span>
          </button>
        </div>

        {/* Map legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> High (70+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Moderate (40-69)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Limited (1-39)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Insufficient Data
          </span>
        </div>
      </div>

      {/* Main split area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left side list drawer */}
        <div
          className={`${
            sidebarOpen ? 'w-80 sm:w-96' : 'w-0'
          } transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden z-20`}
        >
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {places.length} Mapped Places
              </span>
              {coverageNotice && (
                <p className="text-[10px] text-slate-400 mt-0.5">{coverageNotice}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-600 sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-2">
            {loading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : places.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No places match the active map filters.
              </div>
            ) : (
              places.map((place) => {
                const isSelected = selectedPlace?._id === place._id;
                return (
                  <div
                    key={place._id}
                    onClick={() => handlePlaceSelect(place)}
                    className={`p-3 rounded-xl cursor-pointer transition border text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-300 dark:border-primary-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {place.name}
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                        place.accessibilityTier === 'Insufficient Data'
                          ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {place.accessibilityTier === 'Insufficient Data' || place.accessibilityScore === null ? 'Insufficient Data' : `${place.accessibilityScore}/100`}
                      </span>
                    </div>

                    <p className="text-slate-500 line-clamp-1 text-[11px]">
                      {place.address}, {place.city}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {place.facilities?.wheelchairRamp === 'Available' && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-medium">
                          ♿ Ramp
                        </span>
                      )}
                      {place.facilities?.elevatorLift === 'Available' && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded text-[10px] font-medium">
                          🛗 Lift
                        </span>
                      )}
                      {place.facilities?.accessibleToilet === 'Available' && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded text-[10px] font-medium">
                          🚻 Toilet
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map canvas */}
        <div className="flex-1 h-full relative z-0">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-[400] px-3 py-2 bg-white dark:bg-slate-900 shadow-md rounded-xl text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 border border-slate-200 dark:border-slate-800"
            >
              <Layers className="w-4 h-4" />
              <span>Show Venue List</span>
            </button>
          )}

          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter center={mapCenter} />

            {/* User GPS location pin and radius */}
            {userLocation && (
              <>
                <Marker
                  position={userLocation}
                  icon={L.divIcon({
                    className: 'user-loc-pin',
                    html: '<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                  })}
                >
                  <Popup>
                    <div className="text-xs font-semibold">Your Current GPS Location</div>
                  </Popup>
                </Marker>
                <Circle
                  center={userLocation}
                  radius={5000}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }}
                />
              </>
            )}

            {/* Venue markers */}
            {(() => {
              const coordCounts = {};
              return places.map((place) => {
                let lat = place.coordinates?.lat || place.location?.coordinates?.[1];
                let lng = place.coordinates?.lng || place.location?.coordinates?.[0];
                if (!lat || !lng) return null;

                // Deterministic jitter for overlapping pins
                const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
                const count = coordCounts[coordKey] || 0;
                coordCounts[coordKey] = count + 1;
                if (count > 0) {
                  const angle = (count * 2 * Math.PI) / 8;
                  const offset = 0.00035; // ~35 meters
                  lat += Math.sin(angle) * offset;
                  lng += Math.cos(angle) * offset;
                }

                const tier = place.accessibilityTier || 'Insufficient Data';

                return (
                  <Marker
                    key={place._id}
                    position={[lat, lng]}
                    icon={createTierIcon(tier)}
                    eventHandlers={{
                      click: () => setSelectedPlace(place)
                    }}
                  >
                    <Popup className="custom-accessible-popup" maxWidth={300}>
                      <div className="p-1 space-y-2 text-slate-900">
                        <div className="font-bold text-sm leading-tight">{place.name}</div>
                        <div className="text-[11px] text-slate-600">
                          {place.address}, {place.city}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 font-medium">
                          <span>Accessibility Score:</span>
                          <strong className={tier === 'Insufficient Data' ? 'text-slate-600' : 'text-primary-700'}>
                            {tier === 'Insufficient Data' || place.accessibilityScore === null ? 'Score Unavailable' : `${place.accessibilityScore}/100`}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Link
                            to={`/places/${place._id}`}
                            className="flex-1 py-1 px-2.5 rounded bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold text-center"
                          >
                            View Audit Details
                          </Link>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Get Directions"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              });
            })()}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
