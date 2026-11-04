import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom pin marker icon
const customPickerIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `<div style="background-color: #2563eb; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;"><span style="transform: rotate(45deg); font-size: 16px;">📍</span></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

// Click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
    }
  });
  return null;
}

// Center updater
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function CoordinatePickerMap({
  latitude,
  longitude,
  onChange,
  height = '300px'
}) {
  const currentLat = Number(latitude) || 11.0168;
  const currentLng = Number(longitude) || 76.9558;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(
          parseFloat(pos.coords.latitude.toFixed(6)),
          parseFloat(pos.coords.longitude.toFixed(6))
        );
      },
      (err) => {
        alert('Could not retrieve your location: ' + err.message);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-primary-600" />
          Click anywhere on the map or drag the pin to set precise venue coordinates
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline font-semibold"
        >
          <Navigation className="w-3 h-3" />
          Use GPS
        </button>
      </div>

      <div
        className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0"
        style={{ height }}
      >
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onChange} />
          <MapRecenter lat={currentLat} lng={currentLng} />
          <Marker
            position={[currentLat, currentLng]}
            icon={customPickerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onChange(
                  parseFloat(position.lat.toFixed(6)),
                  parseFloat(position.lng.toFixed(6))
                );
              }
            }}
          />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
        <span>Selected Latitude: <strong>{currentLat}</strong></span>
        <span>Selected Longitude: <strong>{currentLng}</strong></span>
      </div>
    </div>
  );
}
