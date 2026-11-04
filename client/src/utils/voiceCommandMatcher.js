/**
 * Voice Command Matcher for AccessAble
 * 
 * Supports natural English and Tamil speech commands for:
 * - Accessibility searching (hospitals, restaurants, colleges)
 * - Accessibility facility filtering (wheelchair ramps, lifts, accessible toilets)
 * - Map navigation and nearby geolocation discovery
 * - Reading place accessibility information aloud
 * - Navigation history (go back) and voice controls (stop)
 */

const VOICE_ACTIONS = {
  DISCOVER_ACCESSIBLE: 'DISCOVER_ACCESSIBLE',
  SEARCH_HOSPITALS: 'SEARCH_HOSPITALS',
  SEARCH_RESTAURANTS: 'SEARCH_RESTAURANTS',
  FILTER_WHEELCHAIR: 'FILTER_WHEELCHAIR',
  FILTER_TOILETS: 'FILTER_TOILETS',
  FILTER_LIFTS: 'FILTER_LIFTS',
  SHOW_NEARBY: 'SHOW_NEARBY',
  OPEN_MAP: 'OPEN_MAP',
  READ_PLACE_DETAILS: 'READ_PLACE_DETAILS',
  NAVIGATE_BACK: 'NAVIGATE_BACK',
  STOP: 'STOP',
  GENERAL_SEARCH: 'GENERAL_SEARCH'
};

/**
 * Matches raw spoken transcript against supported English and Tamil intents
 * 
 * @param {string} rawTranscript - Spoken text from speech recognizer
 * @param {string} language - 'en' or 'ta'
 * @returns {object} { action, targetUrl, messageEn, messageTa, query }
 */
function matchVoiceCommand(rawTranscript, language = 'en') {
  if (!rawTranscript || typeof rawTranscript !== 'string') {
    return {
      action: null,
      messageEn: 'No speech recognized. Please speak a command.',
      messageTa: 'குரல் கண்டறியப்படவில்லை. தயவுசெய்து மீண்டும் கட்டளையிடவும்.'
    };
  }

  const text = rawTranscript.toLowerCase().trim();

  // 1. STOP LISTENING / CANCEL
  if (
    text.includes('stop listening') ||
    text.includes('stop recognition') ||
    text === 'stop' ||
    text === 'cancel' ||
    text.includes('நிறுத்து') ||
    text.includes('குரல் தேடலை நிறுத்து') ||
    text.includes('கேட்பதை நிறுத்து') ||
    text.includes('பேச்சை நிறுத்து')
  ) {
    return {
      action: VOICE_ACTIONS.STOP,
      messageEn: 'Voice listening stopped.',
      messageTa: 'குரல் கேட்பது நிறுத்தப்பட்டது.'
    };
  }

  // 2. GO BACK / RETURN
  if (
    text.includes('go back') ||
    text.includes('back page') ||
    text === 'back' ||
    text.includes('return') ||
    text.includes('previous page') ||
    text.includes('பின்னே செல்') ||
    text.includes('பின்னால் செல்') ||
    text.includes('பின்செல்') ||
    text.includes('திரும்பு') ||
    text.includes('முந்தைய பக்கம்')
  ) {
    return {
      action: VOICE_ACTIONS.NAVIGATE_BACK,
      messageEn: 'Navigating back to previous page.',
      messageTa: 'முந்தைய பக்கத்திற்கு செல்கிறது.'
    };
  }

  // 3. READ THIS PLACE'S ACCESSIBILITY INFORMATION
  if (
    text.includes("read this place's accessibility") ||
    text.includes('read accessibility') ||
    text.includes('read accessibility info') ||
    text.includes('read this place') ||
    text.includes('read details') ||
    text.includes('read info') ||
    text.includes('speak details') ||
    text.includes('இந்த இடத்தின் அணுகல்தன்மை தகவலைப் படி') ||
    text.includes('இந்த இடத்தின் தகவலைப் படி') ||
    text.includes('தகவலைப் படி') ||
    text.includes('விவரங்களை வாசி') ||
    text.includes('தகவலை வாசி') ||
    text.includes('அணுகல்தன்மை விவரங்கள்') ||
    text === 'வாசி' ||
    text === 'படி'
  ) {
    return {
      action: VOICE_ACTIONS.READ_PLACE_DETAILS,
      messageEn: 'Reading accessibility information for this venue...',
      messageTa: 'இந்த இடத்தின் அணுகல்தன்மை தகவலை வாசிக்கிறது...'
    };
  }

  // 4. SHOW NEARBY PLACES
  if (
    text.includes('nearby') ||
    text.includes('near me') ||
    text.includes('places near me') ||
    text.includes('show nearby') ||
    text.includes('அருகில்') ||
    text.includes('என் அருகில்') ||
    text.includes('அருகிலுள்ள இடங்கள்') ||
    text.includes('பக்கத்தில்') ||
    text.includes('பக்கத்திலுள்ள இடங்கள்')
  ) {
    return {
      action: VOICE_ACTIONS.SHOW_NEARBY,
      targetUrl: '/discover?sortBy=distance',
      messageEn: 'Finding accessible places nearest to your location.',
      messageTa: 'உங்கள் இருப்பிடத்திற்கு அருகில் உள்ள அணுகக்கூடிய இடங்களைத் தேடுகிறது.'
    };
  }

  // 5. OPEN ACCESSIBILITY MAP
  if (
    text.includes('open map') ||
    text.includes('show map') ||
    text.includes('accessibility map') ||
    text.includes('map view') ||
    text.includes('view map') ||
    text.includes('வரைபடம்') ||
    text.includes('வரைபடத்தை திற') ||
    text.includes('வரைபடத்தை காட்டு') ||
    text.includes('மேப்') ||
    text.includes('மேப்பை திற')
  ) {
    return {
      action: VOICE_ACTIONS.OPEN_MAP,
      targetUrl: '/accessibility-map',
      messageEn: 'Opening full interactive accessibility map of Tamil Nadu.',
      messageTa: 'தமிழ்நாட்டின் ஊடாடும் அணுகல்தன்மை வரைபடத்தைத் திறக்கிறது.'
    };
  }

  // 6. SEARCH HOSPITALS
  if (
    text.includes('search hospitals') ||
    text.includes('find hospitals') ||
    text.includes('show hospitals') ||
    text.includes('hospitals') ||
    text.includes('hospital') ||
    text.includes('clinic') ||
    text.includes('medical center') ||
    text.includes('மருத்துவமனை') ||
    text.includes('மருத்துவமனைகள்') ||
    text.includes('மருத்துவமனைகளைத் தேடு') ||
    text.includes('ஆஸ்பத்திரி') ||
    text.includes('மருத்துவமனை தேடு')
  ) {
    return {
      action: VOICE_ACTIONS.SEARCH_HOSPITALS,
      targetUrl: '/discover?category=Hospital',
      messageEn: 'Searching for accessible hospitals and healthcare centers.',
      messageTa: 'அணுகக்கூடிய மருத்துவமனைகளைத் தேடுகிறது.'
    };
  }

  // 7. SEARCH RESTAURANTS
  if (
    text.includes('search restaurants') ||
    text.includes('find restaurants') ||
    text.includes('restaurants') ||
    text.includes('restaurant') ||
    text.includes('cafes') ||
    text.includes('cafe') ||
    text.includes('hotel') ||
    text.includes('dining') ||
    text.includes('உணவகம்') ||
    text.includes('உணவகங்கள்') ||
    text.includes('உணவகங்களைத் தேடு') ||
    text.includes('ஹோட்டல்') ||
    text.includes('சாப்பாடு')
  ) {
    return {
      action: VOICE_ACTIONS.SEARCH_RESTAURANTS,
      targetUrl: '/discover?category=Restaurant/Cafe',
      messageEn: 'Searching for accessible restaurants and dining cafes.',
      messageTa: 'அணுகக்கூடிய உணவகங்கள் மற்றும் உணவுக்கூடங்களைத் தேடுகிறது.'
    };
  }

  // 8. SHOW WHEELCHAIR-ACCESSIBLE PLACES / RAMPS
  if (
    text.includes('wheelchair-accessible') ||
    text.includes('wheelchair accessible') ||
    text.includes('wheelchair places') ||
    text.includes('places with ramps') ||
    text.includes('wheelchair ramp') ||
    text.includes('ramp access') ||
    text.includes('step-free') ||
    text.includes('ramp') ||
    text.includes('wheelchair') ||
    text.includes('சக்கர நாற்காலி') ||
    text.includes('சாய்தளம்') ||
    text.includes('சாய்தளம் உள்ள இடங்கள்') ||
    text.includes('வீல்சேர்') ||
    text.includes('சக்கர நாற்காலி அணுகல்') ||
    text.includes('சாய்தள வசதி')
  ) {
    return {
      action: VOICE_ACTIONS.FILTER_WHEELCHAIR,
      targetUrl: '/discover?wheelchairRamp=Available',
      messageEn: 'Filtering places with verified wheelchair ramps and step-free access.',
      messageTa: 'சாய்தளம் மற்றும் சக்கர நாற்காலி வசதியுள்ள இடங்களை வடிகட்டுகிறது.'
    };
  }

  // 9. SHOW PLACES WITH ACCESSIBLE TOILETS
  if (
    text.includes('accessible toilets') ||
    text.includes('accessible toilet') ||
    text.includes('accessible restroom') ||
    text.includes('places with toilets') ||
    text.includes('handicap toilet') ||
    text.includes('accessible washroom') ||
    text.includes('washroom') ||
    text.includes('restroom') ||
    text.includes('toilet') ||
    text.includes('கழிப்பறை') ||
    text.includes('கழிப்பறை வசதி') ||
    text.includes('டாய்லெட்') ||
    text.includes('அணுகக்கூடிய கழிப்பறை') ||
    text.includes('கழிவறை') ||
    text.includes('கழிவறை வசதி')
  ) {
    return {
      action: VOICE_ACTIONS.FILTER_TOILETS,
      targetUrl: '/discover?accessibleToilet=Available',
      messageEn: 'Filtering places equipped with verified accessible restrooms.',
      messageTa: 'அணுகக்கூடிய கழிப்பறை வசதியுள்ள இடங்களை வடிகட்டுகிறது.'
    };
  }

  // 10. SHOW PLACES WITH LIFTS / ELEVATORS
  if (
    text.includes('show places with lifts') ||
    text.includes('places with lifts') ||
    text.includes('places with elevators') ||
    text.includes('show places with elevators') ||
    text.includes('elevators') ||
    text.includes('elevator') ||
    text.includes('lifts') ||
    text.includes('lift access') ||
    text.includes('மின்தூக்கி') ||
    text.includes('லிப்ட்') ||
    text.includes('லிப்ட் வசதி') ||
    text.includes('மின்தூக்கி வசதி') ||
    text.includes('லிப்ட் உள்ள இடங்கள்')
  ) {
    return {
      action: VOICE_ACTIONS.FILTER_LIFTS,
      targetUrl: '/discover?elevatorLift=Available',
      messageEn: 'Filtering places equipped with operational elevators and lifts.',
      messageTa: 'மின்தூக்கி அல்லது லிப்ட் வசதியுள்ள இடங்களை வடிகட்டுகிறது.'
    };
  }

  // 11. FIND ACCESSIBLE PLACES (GENERAL EXPLORE)
  if (
    text.includes('find accessible places') ||
    text.includes('accessible places') ||
    text.includes('explore places') ||
    text.includes('discover places') ||
    text.includes('all places') ||
    text.includes('அணுகக்கூடிய இடங்கள்') ||
    text.includes('இடங்களை தேடு') ||
    text.includes('இடங்களைக் கண்டுபிடி') ||
    text.includes('அணுகக்கூடிய இடங்களைக் கண்டுபிடி')
  ) {
    return {
      action: VOICE_ACTIONS.DISCOVER_ACCESSIBLE,
      targetUrl: '/discover',
      messageEn: 'Opening public directory of accessible places.',
      messageTa: 'அணுகக்கூடிய இடங்களின் முழு அடைவைத் திறக்கிறது.'
    };
  }

  // 12. GENERAL SEARCH QUERY
  let query = text
    .replace(/^(search for|search|find|show me|look for|open|take me to|navigate to)\s+/i, '')
    .replace(/(தேடு|கண்டுபிடி|காட்டு|திற)$/i, '')
    .trim();

  if (query) {
    return {
      action: VOICE_ACTIONS.GENERAL_SEARCH,
      query,
      targetUrl: `/discover?q=${encodeURIComponent(query)}`,
      messageEn: `Searching directory for "${query}".`,
      messageTa: `"${query}" குறித்த இடங்களைத் தேடுகிறது.`
    };
  }

  return {
    action: VOICE_ACTIONS.DISCOVER_ACCESSIBLE,
    targetUrl: '/discover',
    messageEn: 'Discovering accessible places across Tamil Nadu.',
    messageTa: 'தமிழ்நாடு முழுவதும் அணுகக்கூடிய இடங்களைத் தேடுகிறது.'
  };
}

/**
 * Generates an accurate, spoken accessibility summary for a place.
 * Strictly adheres to accessibility truth: Unknown facilities are NEVER described as accessible.
 * 
 * @param {object} place - Place object from API
 * @param {string} language - 'en' or 'ta'
 * @returns {string} Human-sounding text suitable for SpeechSynthesis
 */
function formatAccessibilitySpeechText(place, language = 'en') {
  if (!place) {
    return language === 'ta'
      ? 'குறிப்பிட்ட இடத்தின் தகவலைப் படிக்க, முதலில் ஒரு இடத்தின் விவரப் பக்கத்தைத் திறக்கவும்.'
      : 'Please open a specific place details page first to hear its accessibility information.';
  }

  const f = place.facilities || {};
  const name = place.name || 'Venue';
  const city = place.city || '';

  if (language === 'ta') {
    const rampText =
      f.wheelchairRamp === 'Available'
        ? 'சாய்தள வசதி உள்ளது.'
        : f.wheelchairRamp === 'Unavailable'
        ? 'சாய்தள வசதி இல்லை, படிக்கட்டுகள் உள்ளன.'
        : 'சாய்தள வசதி குறித்து உறுதிப்படுத்தப்படவில்லை.';

    const liftText =
      f.elevatorLift === 'Available'
        ? 'மின்தூக்கி அல்லது லிப்ட் வசதி உள்ளது.'
        : f.elevatorLift === 'Unavailable'
        ? 'லிப்ட் வசதி இல்லை.'
        : 'லிப்ட் வசதி குறித்து விவரம் இல்லை.';

    const toiletText =
      f.accessibleToilet === 'Available'
        ? 'அணுகக்கூடிய கழிப்பறை வசதி உள்ளது.'
        : f.accessibleToilet === 'Unavailable'
        ? 'கழிப்பறை சக்கர நாற்காலிக்கு ஏற்றது அல்ல.'
        : 'கழிப்பறை வசதி உறுதிப்படுத்தப்படவில்லை.';

    const parkingText =
      f.accessibleParking === 'Available'
        ? 'பிரத்யேக வாகன நிறுத்துமிடம் உள்ளது.'
        : f.accessibleParking === 'Unavailable'
        ? 'பிரத்யேக பார்க்கிங் இல்லை.'
        : 'பார்க்கிங் வசதி உறுதிப்படுத்தப்படவில்லை.';

    const brailleText =
      f.brailleSignage === 'Available'
        ? 'பிரெய்லி மற்றும் தொட்டுணரும் பலகைகள் உள்ளன.'
        : f.brailleSignage === 'Unavailable'
        ? 'பிரெய்லி பலகைகள் இல்லை.'
        : 'பிரெய்லி விவரம் உறுதிப்படுத்தப்படவில்லை.';

    const audioText =
      f.audioAssistance === 'Available'
        ? 'ஆடியோ உதவி அல்லது குரல் அறிவிப்பு வசதி உள்ளது.'
        : f.audioAssistance === 'Unavailable'
        ? 'ஆடியோ உதவி இல்லை.'
        : 'ஆடியோ உதவி உறுதிப்படுத்தப்படவில்லை.';

    return `${name} (${city}) அணுகல்தன்மை அறிக்கை: ${rampText} ${liftText} ${toiletText} ${parkingText} ${brailleText} ${audioText} அறிக்கை முடிவுற்றது.`;
  }

  const rampText =
    f.wheelchairRamp === 'Available'
      ? 'Wheelchair ramp is available.'
      : f.wheelchairRamp === 'Unavailable'
      ? 'Wheelchair ramp is unavailable; entrance requires steps.'
      : 'Wheelchair ramp status is unknown and awaiting physical verification.';

  const liftText =
    f.elevatorLift === 'Available'
      ? 'Elevator or lift is available.'
      : f.elevatorLift === 'Unavailable'
      ? 'Elevator is unavailable.'
      : 'Elevator status is unconfirmed.';

  const toiletText =
    f.accessibleToilet === 'Available'
      ? 'Accessible restroom is available.'
      : f.accessibleToilet === 'Unavailable'
      ? 'Accessible restroom is unavailable.'
      : 'Restroom accessibility is unknown.';

  const parkingText =
    f.accessibleParking === 'Available'
      ? 'Designated accessible parking is available.'
      : f.accessibleParking === 'Unavailable'
      ? 'Accessible parking is unavailable.'
      : 'Parking accessibility is unconfirmed.';

  const brailleText =
    f.brailleSignage === 'Available'
      ? 'Tactile and Braille signage is available.'
      : f.brailleSignage === 'Unavailable'
      ? 'Braille signage is unavailable.'
      : 'Braille signage is unverified.';

  const audioText =
    f.audioAssistance === 'Available'
      ? 'Audio assistance and announcements are available.'
      : f.audioAssistance === 'Unavailable'
      ? 'Audio assistance is unavailable.'
      : 'Audio assistance is unverified.';

  return `Accessibility report for ${name} in ${city}. ${rampText} ${liftText} ${toiletText} ${parkingText} ${brailleText} ${audioText} End of accessibility report.`;
}

// ES module exports for Vite & Node.js ESM import
export {
  VOICE_ACTIONS,
  matchVoiceCommand,
  formatAccessibilitySpeechText
};

export default matchVoiceCommand;

// CommonJS compatibility if loaded in CJS environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VOICE_ACTIONS,
    matchVoiceCommand,
    formatAccessibilitySpeechText
  };
}
