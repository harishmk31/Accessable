/**
 * Geospatial Utilities for AccessAble
 * Calculates accurate distances using the Haversine formula.
 * Provides coordinate centers, bounding box validation, and regional classification
 * for Coimbatore localities and Tamil Nadu districts.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

// Tamil Nadu geographical bounding box
const TAMIL_NADU_BOUNDS = {
  minLat: 8.0,
  maxLat: 13.6,
  minLng: 76.1,
  maxLng: 80.4
};

/**
 * Validates whether GPS coordinates fall within Tamil Nadu's geographical boundary
 */
function validateCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return (
    lat >= TAMIL_NADU_BOUNDS.minLat &&
    lat <= TAMIL_NADU_BOUNDS.maxLat &&
    lng >= TAMIL_NADU_BOUNDS.minLng &&
    lng <= TAMIL_NADU_BOUNDS.maxLng
  );
}

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

/**
 * Normalizes common district and city name variants
 */
function normalizeDistrictName(rawDistrict = '') {
  if (!rawDistrict) return 'Coimbatore';
  const clean = rawDistrict.trim().toLowerCase();

  const mapping = {
    'trichy': 'Tiruchirappalli',
    'tiruchirapalli': 'Tiruchirappalli',
    'the nilgiris': 'Nilgiris',
    'nilgiris district': 'Nilgiris',
    'udhagamandalam': 'Nilgiris',
    'ooty': 'Nilgiris',
    'madura': 'Madurai',
    'tanjore': 'Thanjavur',
    'tuticorin': 'Thoothukudi',
    'nellai': 'Tirunelveli',
    'tinnevelly': 'Tirunelveli',
    'madras': 'Chennai',
    'coimbatore district': 'Coimbatore',
    'kovai': 'Coimbatore',
    'tirupathur': 'Tirupattur',
    'tirupattur district': 'Tirupattur',
    'tirupathur district': 'Tirupattur'
  };

  if (mapping[clean]) return mapping[clean];

  // Capitalize words
  return rawDistrict
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Maps Tamil Nadu districts to regional zones
 */
const REGION_MAPPING = {
  // Western Tamil Nadu
  Coimbatore: 'Western Tamil Nadu',
  Tiruppur: 'Western Tamil Nadu',
  Erode: 'Western Tamil Nadu',
  Salem: 'Western Tamil Nadu',
  Nilgiris: 'Western Tamil Nadu',
  Namakkal: 'Western Tamil Nadu',
  Karur: 'Western Tamil Nadu',
  Dharmapuri: 'Western Tamil Nadu',
  Krishnagiri: 'Western Tamil Nadu',

  // Northern Tamil Nadu
  Chennai: 'Northern Tamil Nadu',
  Vellore: 'Northern Tamil Nadu',
  Kanchipuram: 'Northern Tamil Nadu',
  Tiruvannamalai: 'Northern Tamil Nadu',
  Tiruvallur: 'Northern Tamil Nadu',
  Chengalpattu: 'Northern Tamil Nadu',
  Villupuram: 'Northern Tamil Nadu',
  Ranipet: 'Northern Tamil Nadu',
  Tirupattur: 'Northern Tamil Nadu',
  Tirupathur: 'Northern Tamil Nadu',
  Kallakurichi: 'Northern Tamil Nadu',

  // Central Tamil Nadu
  Tiruchirappalli: 'Central Tamil Nadu',
  Thanjavur: 'Central Tamil Nadu',
  Pudukkottai: 'Central Tamil Nadu',
  Ariyalur: 'Central Tamil Nadu',
  Perambalur: 'Central Tamil Nadu',
  Mayiladuthurai: 'Central Tamil Nadu',
  Nagapattinam: 'Central Tamil Nadu',
  Tiruvarur: 'Central Tamil Nadu',
  Cuddalore: 'Central Tamil Nadu',

  // Southern Tamil Nadu
  Madurai: 'Southern Tamil Nadu',
  Tirunelveli: 'Southern Tamil Nadu',
  Thoothukudi: 'Southern Tamil Nadu',
  Kanyakumari: 'Southern Tamil Nadu',
  Dindigul: 'Southern Tamil Nadu',
  Virudhunagar: 'Southern Tamil Nadu',
  Ramanathapuram: 'Southern Tamil Nadu',
  Theni: 'Southern Tamil Nadu',
  Tenkasi: 'Southern Tamil Nadu',
  Sivaganga: 'Southern Tamil Nadu'
};

function getRegionForDistrict(district) {
  const norm = normalizeDistrictName(district);
  return REGION_MAPPING[norm] || 'Western Tamil Nadu';
}

// Known regional centers for Coimbatore localities and Tamil Nadu cities/destinations
const REGIONAL_CENTERS = {
  // Coimbatore Localities
  'coimbatore-central': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Central', district: 'Coimbatore' },
  'gandhipuram': { lat: 11.0183, lng: 76.9654, name: 'Gandhipuram, Coimbatore', district: 'Coimbatore' },
  'rs-puram': { lat: 11.0094, lng: 76.9463, name: 'RS Puram, Coimbatore', district: 'Coimbatore' },
  'peelamedu': { lat: 11.0286, lng: 77.0121, name: 'Peelamedu, Coimbatore', district: 'Coimbatore' },
  'saibaba-colony': { lat: 11.0315, lng: 76.9452, name: 'Saibaba Colony, Coimbatore', district: 'Coimbatore' },
  'town-hall': { lat: 10.9972, lng: 76.9625, name: 'Town Hall, Coimbatore', district: 'Coimbatore' },
  'race-course': { lat: 11.0016, lng: 76.9749, name: 'Race Course, Coimbatore', district: 'Coimbatore' },
  'avinashi-road': { lat: 11.0261, lng: 77.0042, name: 'Avinashi Road, Coimbatore', district: 'Coimbatore' },
  'vadavalli': { lat: 11.0229, lng: 76.9037, name: 'Vadavalli, Coimbatore', district: 'Coimbatore' },
  'pollachi-road': { lat: 10.9419, lng: 76.9742, name: 'Pollachi Road, Coimbatore', district: 'Coimbatore' },

  // Western Tamil Nadu
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore District', region: 'Western Tamil Nadu' },
  'tiruppur': { lat: 11.1085, lng: 77.3411, name: 'Tiruppur', region: 'Western Tamil Nadu' },
  'erode': { lat: 11.341, lng: 77.7172, name: 'Erode', region: 'Western Tamil Nadu' },
  'salem': { lat: 11.6643, lng: 78.146, name: 'Salem', region: 'Western Tamil Nadu' },
  'ooty': { lat: 11.4102, lng: 76.695, name: 'Ooty (Udhagamandalam)', region: 'Western Tamil Nadu' },
  'coonoor': { lat: 11.353, lng: 76.7959, name: 'Coonoor', region: 'Western Tamil Nadu' },
  'pollachi': { lat: 10.6582, lng: 77.0084, name: 'Pollachi', region: 'Western Tamil Nadu' },
  'namakkal': { lat: 11.2189, lng: 78.1674, name: 'Namakkal', region: 'Western Tamil Nadu' },
  'karur': { lat: 10.9601, lng: 78.0766, name: 'Karur', region: 'Western Tamil Nadu' },
  'nilgiris': { lat: 11.4102, lng: 76.695, name: 'Nilgiris District', region: 'Western Tamil Nadu' },

  // Northern Tamil Nadu
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai', region: 'Northern Tamil Nadu' },
  'vellore': { lat: 12.9165, lng: 79.1325, name: 'Vellore', region: 'Northern Tamil Nadu' },
  'kanchipuram': { lat: 12.8342, lng: 79.7036, name: 'Kanchipuram', region: 'Northern Tamil Nadu' },
  'tiruvannamalai': { lat: 12.2253, lng: 79.0747, name: 'Tiruvannamalai', region: 'Northern Tamil Nadu' },
  'tiruvallur': { lat: 13.1432, lng: 79.9079, name: 'Tiruvallur', region: 'Northern Tamil Nadu' },
  'chengalpattu': { lat: 12.6841, lng: 79.9836, name: 'Chengalpattu', region: 'Northern Tamil Nadu' },
  'villupuram': { lat: 11.9401, lng: 79.4861, name: 'Villupuram', region: 'Northern Tamil Nadu' },
  'mahabalipuram': { lat: 12.6269, lng: 80.1927, name: 'Mahabalipuram', region: 'Northern Tamil Nadu' },

  // Central Tamil Nadu
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli', region: 'Central Tamil Nadu' },
  'thanjavur': { lat: 10.787, lng: 79.1378, name: 'Thanjavur', region: 'Central Tamil Nadu' },
  'kumbakonam': { lat: 10.9602, lng: 79.3845, name: 'Kumbakonam', region: 'Central Tamil Nadu' },
  'pudukkottai': { lat: 10.3833, lng: 78.8001, name: 'Pudukkottai', region: 'Central Tamil Nadu' },
  'ariyalur': { lat: 11.1401, lng: 79.0759, name: 'Ariyalur', region: 'Central Tamil Nadu' },
  'perambalur': { lat: 11.2342, lng: 78.8821, name: 'Perambalur', region: 'Central Tamil Nadu' },
  'mayiladuthurai': { lat: 11.1075, lng: 79.6524, name: 'Mayiladuthurai', region: 'Central Tamil Nadu' },

  // Southern Tamil Nadu
  'madurai': { lat: 9.9252, lng: 78.1198, name: 'Madurai', region: 'Southern Tamil Nadu' },
  'tirunelveli': { lat: 8.7139, lng: 77.7567, name: 'Tirunelveli', region: 'Southern Tamil Nadu' },
  'thoothukudi': { lat: 8.7642, lng: 78.1348, name: 'Thoothukudi', region: 'Southern Tamil Nadu' },
  'kanyakumari': { lat: 8.0883, lng: 77.5385, name: 'Kanyakumari', region: 'Southern Tamil Nadu' },
  'nagercoil': { lat: 8.1833, lng: 77.4119, name: 'Nagercoil', region: 'Southern Tamil Nadu' },
  'dindigul': { lat: 10.3673, lng: 77.9803, name: 'Dindigul', region: 'Southern Tamil Nadu' },
  'sivakasi': { lat: 9.4533, lng: 77.7947, name: 'Sivakasi', region: 'Southern Tamil Nadu' },
  'virudhunagar': { lat: 9.5872, lng: 77.9579, name: 'Virudhunagar', region: 'Southern Tamil Nadu' },
  'ramanathapuram': { lat: 9.3639, lng: 78.8395, name: 'Ramanathapuram', region: 'Southern Tamil Nadu' },
  'kodaikanal': { lat: 10.2381, lng: 77.4892, name: 'Kodaikanal', region: 'Southern Tamil Nadu' },
  'rameswaram': { lat: 9.2876, lng: 79.3129, name: 'Rameswaram', region: 'Southern Tamil Nadu' },
  'courtallam': { lat: 8.9317, lng: 77.2758, name: 'Courtallam', region: 'Southern Tamil Nadu' },

  // Other Destination Spots
  'velankanni': { lat: 10.6805, lng: 79.8459, name: 'Velankanni', region: 'Central Tamil Nadu' },
  'yercaud': { lat: 11.7753, lng: 78.2093, name: 'Yercaud', region: 'Western Tamil Nadu' },
  'hogenakkal': { lat: 12.1188, lng: 77.7769, name: 'Hogenakkal', region: 'Western Tamil Nadu' }
};

const OFFICIAL_38_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupattur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Villupuram', 'Virudhunagar'
];

module.exports = {
  EARTH_RADIUS_KM,
  TAMIL_NADU_BOUNDS,
  validateCoordinates,
  calculateDistanceKm,
  normalizeDistrictName,
  getRegionForDistrict,
  REGIONAL_CENTERS,
  REGION_MAPPING,
  OFFICIAL_38_DISTRICTS
};
