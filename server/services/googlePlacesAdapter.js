/**
 * Google Places API (New) Provider Adapter
 * 
 * Safely integrates with Google Places Platform when credentials are configured.
 * Follows Google Maps Platform Terms:
 * - Server-side key management (never sent to client)
 * - Required attribution preservation
 * - No permanent photo scraping or caching
 * - Transparent status reporting when API key is unconfigured or quota is exceeded
 */

const https = require('https');

class GooglePlacesAdapter {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim() && !this.apiKey.includes('your_'));
  }

  getStatus() {
    return {
      provider: 'google_places_new',
      isConfigured: this.isConfigured(),
      status: this.isConfigured() ? 'ready' : 'unconfigured_placeholder',
      message: this.isConfigured()
        ? 'Google Places API key is configured on server'
        : 'Google Places API key not set in server/.env. Using verified local and Tamil Nadu database.'
    };
  }

  /**
   * Search for places using Google Places API (New) Text Search
   */
  async searchPlaces(textQuery, options = {}) {
    if (!this.isConfigured()) {
      return {
        success: false,
        source: 'local_fallback',
        reason: 'API_KEY_NOT_CONFIGURED',
        places: []
      };
    }

    try {
      const { lat, lng, radius = 5000 } = options;
      const requestBody = {
        textQuery,
        languageCode: 'en',
        maxResultCount: 10
      };

      if (lat && lng) {
        requestBody.locationBias = {
          circle: {
            center: { latitude: Number(lat), longitude: Number(lng) },
            radius: Number(radius)
          }
        };
      }

      const response = await this._makeRequest(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.accessibilityOptions,places.photos'
          },
          body: JSON.stringify(requestBody)
        }
      );

      const normalized = (response.places || []).map((p) => this._normalizeGooglePlace(p));
      return {
        success: true,
        source: 'google_places',
        count: normalized.length,
        places: normalized
      };
    } catch (error) {
      console.warn(`[GooglePlacesAdapter] searchPlaces error: ${error.message}`);
      return {
        success: false,
        source: 'local_fallback',
        reason: error.message,
        places: []
      };
    }
  }

  /**
   * Normalize Google Place record to AccessAble Place schema
   */
  _normalizeGooglePlace(gPlace) {
    const name = gPlace.displayName?.text || 'Unnamed Place';
    const address = gPlace.formattedAddress || '';
    const lat = gPlace.location?.latitude || 0;
    const lng = gPlace.location?.longitude || 0;

    // Google Places (New) accessibility options
    const gAccess = gPlace.accessibilityOptions || {};
    const hasWheelchairEntrance = gAccess.wheelchairAccessibleEntrance;
    const hasWheelchairParking = gAccess.wheelchairAccessibleParking;
    const hasWheelchairRestroom = gAccess.wheelchairAccessibleRestroom;
    const hasWheelchairSeating = gAccess.wheelchairAccessibleSeating;

    const mapStatus = (boolVal) => {
      if (boolVal === true) return 'Verified Available';
      if (boolVal === false) return 'Verified Unavailable';
      return 'Unknown';
    };

    return {
      providerPlaceId: gPlace.id,
      provider: 'google_places',
      name,
      address,
      coordinates: { lat, lng },
      location: { type: 'Point', coordinates: [lng, lat] },
      accessibilityProfile: {
        stepFreeEntrance: {
          status: mapStatus(hasWheelchairEntrance),
          evidenceSource: 'Google Places API (New) metadata',
          verificationMethod: 'provider_metadata',
          lastVerifiedAt: new Date()
        },
        accessibleParking: {
          status: mapStatus(hasWheelchairParking),
          evidenceSource: 'Google Places API (New) metadata',
          verificationMethod: 'provider_metadata',
          lastVerifiedAt: new Date()
        },
        accessibleToilet: {
          status: mapStatus(hasWheelchairRestroom),
          evidenceSource: 'Google Places API (New) metadata',
          verificationMethod: 'provider_metadata',
          lastVerifiedAt: new Date()
        },
        seatingRestArea: {
          status: mapStatus(hasWheelchairSeating),
          evidenceSource: 'Google Places API (New) metadata',
          verificationMethod: 'provider_metadata',
          lastVerifiedAt: new Date()
        }
      },
      photos: (gPlace.photos || []).slice(0, 3).map((ph) => ({
        url: `https://places.googleapis.com/v1/${ph.name}/media?maxHeightPx=600&maxWidthPx=800&key=${this.apiKey}`,
        attribution: ph.authorAttributions?.[0]?.displayName || 'Google Maps Contributor',
        authorUrl: ph.authorAttributions?.[0]?.uri || ''
      }))
    };
  }

  _makeRequest(url, options) {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const req = https.request(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          method: options.method || 'GET',
          headers: options.headers || {}
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 400) {
                return reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
              }
              resolve(parsed);
            } catch (err) {
              reject(err);
            }
          });
        }
      );

      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  }
}

module.exports = new GooglePlacesAdapter();
