/**
 * Geospatial Utilities for AccessAble
 * Calculates accurate distances using the Haversine formula.
 * Provides coordinate centers for Coimbatore localities and Tamil Nadu districts.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two points in kilometers
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Known regional centers for Coimbatore and Tamil Nadu
const REGIONAL_CENTERS = {
  // Coimbatore Localities
  'coimbatore-central': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Central' },
  'gandhipuram': { lat: 11.0183, lng: 76.9654, name: 'Gandhipuram, Coimbatore' },
  'rs-puram': { lat: 11.0094, lng: 76.9463, name: 'RS Puram, Coimbatore' },
  'peelamedu': { lat: 11.0286, lng: 77.0121, name: 'Peelamedu, Coimbatore' },
  'saibaba-colony': { lat: 11.0315, lng: 76.9452, name: 'Saibaba Colony, Coimbatore' },
  'town-hall': { lat: 10.9972, lng: 76.9625, name: 'Town Hall, Coimbatore' },
  'race-course': { lat: 11.0016, lng: 76.9749, name: 'Race Course, Coimbatore' },
  'avinashi-road': { lat: 11.0261, lng: 77.0042, name: 'Avinashi Road, Coimbatore' },
  'vadavalli': { lat: 11.0229, lng: 76.9037, name: 'Vadavalli, Coimbatore' },
  'pollachi-road': { lat: 10.9419, lng: 76.9742, name: 'Pollachi Road, Coimbatore' },

  // Tamil Nadu Districts & Major Destinations
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore District' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  'madurai': { lat: 9.9252, lng: 78.1198, name: 'Madurai' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli' },
  'salem': { lat: 11.6643, lng: 78.146, name: 'Salem' },
  'tiruppur': { lat: 11.1085, lng: 77.3411, name: 'Tiruppur' },
  'erode': { lat: 11.341, lng: 77.7172, name: 'Erode' },
  'thanjavur': { lat: 10.787, lng: 79.1378, name: 'Thanjavur' },
  'tirunelveli': { lat: 8.7139, lng: 77.7567, name: 'Tirunelveli' },
  'vellore': { lat: 12.9165, lng: 79.1325, name: 'Vellore' },
  'ooty': { lat: 11.4102, lng: 76.695, name: 'Ooty (Udhagamandalam)' },
  'kodaikanal': { lat: 10.2381, lng: 77.4892, name: 'Kodaikanal' },
  'kanyakumari': { lat: 8.0883, lng: 77.5385, name: 'Kanyakumari' },
  'thoothukudi': { lat: 8.7642, lng: 78.1348, name: 'Thoothukudi' },
  'dindigul': { lat: 10.3673, lng: 77.9803, name: 'Dindigul' },
  'karur': { lat: 10.9601, lng: 78.0766, name: 'Karur' },
  'nilgiris': { lat: 11.4102, lng: 76.695, name: 'Nilgiris District' }
};

module.exports = {
  calculateDistanceKm,
  REGIONAL_CENTERS
};
