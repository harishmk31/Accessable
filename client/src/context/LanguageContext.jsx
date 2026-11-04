import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Navigation
    home: 'Home',
    discover: 'Discover Places',
    nearMe: 'Places Near Me',
    listPlace: 'List a Place',
    savedPlaces: 'Saved Places',
    adminDashboard: 'Admin Dashboard',
    accessibilityGuide: 'Accessibility Guide',
    signIn: 'Sign In',
    register: 'Register',
    signOut: 'Sign Out',
    myAccount: 'My Account',
    admin: 'Administrator',
    member: 'Member',

    // Hero & Search
    heroTitle: 'Discover Accessible Public Places in Tamil Nadu',
    heroSubtitle:
      'Verified, evidence-based accessibility information for hospitals, campuses, transit hubs, cafes, parks, and monuments in Coimbatore and across Tamil Nadu.',
    findNearMeBtn: 'Find Accessible Places Near Me',
    searchPlaceholder: 'Search by hospital, college, area (e.g. RS Puram, Gandhipuram), city, or name...',
    explorePlaces: 'Search Directory',
    coimbatoreFocus: 'Explore Coimbatore Areas',
    tamilNaduDestinations: 'Tamil Nadu Destinations',
    regionalHub: 'Tamil Nadu Regional Hub',
    westernTN: 'Western Tamil Nadu',
    northernTN: 'Northern Tamil Nadu',
    centralTN: 'Central Tamil Nadu',
    southernTN: 'Southern Tamil Nadu',
    otherDestinations: 'Other Destinations',
    regionLabel: 'Region',
    allRegions: 'All Regions',
    coverageStats: 'Statewide Coverage',

    // Discovery & Filters
    directoryTitle: 'Explore Places',
    directorySubtitle: 'Discover audited public places across Coimbatore and Tamil Nadu with verified wheelchair ramps, elevators, and accessible facilities.',
    viewDetails: 'View Details',
    filters: 'Filters',
    resetFilters: 'Reset',
    sortResultsBy: 'Sort Results By',
    sortNewest: 'Recently Verified',
    sortDistance: 'Nearest to Me',
    sortAccessibility: 'Highest Accessibility Score',
    sortRating: 'Highest Rating',
    sortName: 'Name (A-Z)',
    categoryLabel: 'Venue Category',
    districtLabel: 'District / Region',
    localityLabel: 'Coimbatore Area',
    distanceLabel: 'Maximum Distance',
    allCategories: 'All Categories',
    allDistricts: 'All Districts',
    allLocalities: 'All Areas',
    anyDistance: 'Any Distance',
    facilitiesFilterTitle: 'Accessibility Facilities',
    minAccessibilityScore: 'Minimum Accessibility Score',
    viewModeList: 'List View',
    viewModeMap: 'Interactive Map',
    viewModeSplit: 'Split View',
    foundPlaces: 'Found',
    placesCount: 'places',
    noPlacesTitle: 'No accessible places found',
    noPlacesDesc: 'Try expanding your distance radius or adjusting the selected accessibility filters.',

    // Facilities & Statuses
    wheelchairRamp: 'Wheelchair Ramp',
    elevatorLift: 'Elevator / Lift',
    accessibleToilet: 'Accessible Restroom',
    accessibleParking: 'Accessible Parking',
    brailleSignage: 'Braille Signage',
    audioAssistance: 'Audio Assistance',
    tactilePaving: 'Tactile Paving',
    stepFreeEntrance: 'Step-Free Entrance',
    seatingRestArea: 'Seating & Rest Areas',

    statusAvailable: 'Verified Available',
    statusUnavailable: 'Verified Unavailable',
    statusUnknown: 'Unknown / Not Checked',
    statusConflicting: 'Conflicting Reports',
    statusUserReported: 'Reported, not verified',

    // Place Details
    getDirections: 'Get Directions',
    callVenue: 'Call Venue',
    visitWebsite: 'Visit Website',
    savePlace: 'Save Place',
    saved: 'Saved',
    reportIssue: 'Report Inaccurate Info',
    lastVerifiedOn: 'Last verified on',
    sourceAttribution: 'Data Source & Evidence',
    verifiedAudit: 'AccessAble Verified Field Audit',
    aboutVenue: 'About this Venue',
    facilityBreakdownTitle: 'Audited Accessibility Facilities',
    facilityBreakdownSubtitle: 'Verified conditions under strict multi-status evidentiary tracking.',
    reviewsTitle: 'Community Reviews & Accessibility Feedback',
    leaveReview: 'Share Your Accessibility Experience',
    generalRating: 'General Rating',
    accessRating: 'Accessibility Rating',
    reviewCommentPlaceholder: 'Describe ramp gradient, door clearance, grab handles, or staff assistance...',
    postReviewBtn: 'Post Accessibility Review',

    // Report Inaccuracy Modal
    reportTitle: 'Report Inaccurate Information',
    reportSubtitle: 'Help maintain reliable accessibility data for persons with disabilities.',
    issueCategoryLabel: 'What is inaccurate?',
    issueIncorrectAccess: 'Accessibility feature is incorrect or changed',
    issueClosed: 'Venue is permanently closed',
    issueAddress: 'Wrong address or location',
    issueContact: 'Wrong phone number or opening hours',
    issueOther: 'Other inaccuracy',
    descriptionLabel: 'Please explain the issue in detail',
    descriptionPlaceholder: 'e.g., The ramp at the main entrance is currently closed for renovation...',
    evidenceLabel: 'Optional supporting evidence (source or link)',
    submitReportBtn: 'Submit Report',
    cancel: 'Cancel',

    // Footer
    footerDisclaimerTitle: 'Verification & Academic Project Notice',
    footerDisclaimerText:
      'AccessAble prioritizes genuine, independently verified accessibility audits in Coimbatore and Tamil Nadu. Missing data is never assumed to be unavailable.',

    // Advanced Features
    voiceAssistant: 'Voice Navigator',
    voiceListening: 'Listening for voice command...',
    voiceSpeakHelp: 'Try: "Find hospitals with ramp", "Search Peelamedu", or "Show nearby"',
    aiAssessment: 'AI Accessibility Assessment',
    aiAssessmentSubtitle: 'Evidence-based algorithmic audit of accessibility features and barrier risks',
    visionScanner: 'Photo Accessibility Scanner',
    visionScannerSubtitle: 'AI Computer Vision feature detection for ramps, lifts, and signage',
    dedicatedMap: 'Dedicated Accessibility Map',
    scoreBreakdown: 'Accessibility Score Calculation',
    insufficientData: 'Insufficient Data'
  }
};

export const LanguageProvider = ({ children }) => {
  const lang = 'en';

  const changeLanguage = () => {};

  const t = (key) => {
    return TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useTranslation;
