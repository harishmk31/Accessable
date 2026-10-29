import React, { createContext, useContext, useState, useEffect } from 'react';

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
    directoryTitle: 'Tamil Nadu Accessibility Directory',
    directorySubtitle: 'Discover audited venues with verified wheelchair ramps, elevators, tactile signage, and barrier-free access.',
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
    statusUserReported: 'Pending Verification',

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
      'AccessAble prioritizes genuine, independently verified accessibility audits in Coimbatore and Tamil Nadu. Missing data is never assumed to be unavailable.'
  },

  ta: {
    // Navigation
    home: 'முகப்பு',
    discover: 'இடங்களைக் கண்டறிக',
    nearMe: 'என் அருகில் உள்ளவை',
    listPlace: 'புதிய இடம் சேர்',
    savedPlaces: 'சேமிக்கப்பட்டவை',
    adminDashboard: 'நிர்வாக பலகை',
    accessibilityGuide: 'அணுகல்தன்மை வழிகாட்டி',
    signIn: 'உள்நுழைக',
    register: 'பதிவு செய்க',
    signOut: 'வெளியேறு',
    myAccount: 'என் கணக்கு',
    admin: 'நிர்வாகி',
    member: 'உறுப்பினர்',

    // Hero & Search
    heroTitle: 'தமிழ்நாட்டின் மாற்றுத்திறனாளி அணுகக்கூடிய இடங்கள்',
    heroSubtitle:
      'கோயம்புத்தூர் மற்றும் தமிழ்நாடு முழுவதும் உள்ள மருத்துவமனைகள், கல்லூரிகள், பேருந்து மற்றும் ரயில் நிலையங்களின் சரிபார்க்கப்பட்ட அணுகல்தன்மை தகவல்கள்.',
    findNearMeBtn: 'என் அருகில் உள்ள அணுகக்கூடிய இடங்கள்',
    searchPlaceholder: 'மருத்துவமனை, கல்லூரி, பகுதி (எ.கா. ஆர்.எஸ் புரம், காந்திபுரம்), ஊர் அல்லது பெயர் தேடுக...',
    explorePlaces: 'தேடுக',
    coimbatoreFocus: 'கோயம்புத்தூர் பகுதிகள்',
    tamilNaduDestinations: 'தமிழ்நாடு மாவட்டங்கள்',
    regionalHub: 'தமிழ்நாடு மண்டல வழிகாட்டி',
    westernTN: 'மேற்கு தமிழ்நாடு',
    northernTN: 'வடக்கு தமிழ்நாடு',
    centralTN: 'மத்திய தமிழ்நாடு',
    southernTN: 'தெற்கு தமிழ்நாடு',
    otherDestinations: 'பிற இடங்கள்',
    regionLabel: 'மண்டலம்',
    allRegions: 'அனைத்து மண்டலங்களும்',
    coverageStats: 'மாநில கவரேஜ்',

    // Discovery & Filters
    directoryTitle: 'தமிழ்நாடு அணுகல்தன்மை அடைவு',
    directorySubtitle: 'சக்கர நாற்காலி சாய்தளங்கள், மின்தூக்கிகள் மற்றும் தொடுவழிகளுடன் கூடிய இடங்களைக் கண்டறியுங்கள்.',
    filters: 'வடிகட்டிகள்',
    resetFilters: 'மீட்டமைக்க',
    sortResultsBy: 'வரிசைப்படுத்து',
    sortNewest: 'அண்மையில் சரிபார்க்கப்பட்டவை',
    sortDistance: 'மிக அருகில் உள்ளவை',
    sortAccessibility: 'உயர்ந்த அணுகல்தன்மை மதிப்பீடு',
    sortRating: 'உயர்ந்த பொது மதிப்பீடு',
    sortName: 'பெயர் (அ-ஃ)',
    categoryLabel: 'பிரிவு',
    districtLabel: 'மாவட்டம்',
    localityLabel: 'கோயம்புத்தூர் பகுதி',
    distanceLabel: 'அதிகபட்ச தூரம்',
    allCategories: 'அனைத்து பிரிவுகளும்',
    allDistricts: 'அனைத்து மாவட்டங்களும்',
    allLocalities: 'அனைத்து பகுதிகளும்',
    anyDistance: 'எந்த தூரமும்',
    facilitiesFilterTitle: 'அணுகல்தன்மை வசதிகள்',
    minAccessibilityScore: 'குறைந்தபட்ச அணுகல்தன்மை மதிப்பீடு',
    viewModeList: 'பட்டியல் காட்சி',
    viewModeMap: 'வரைபடக் காட்சி',
    viewModeSplit: 'இருபக்கக் காட்சி',
    foundPlaces: 'கண்டறியப்பட்டவை',
    placesCount: 'இடங்கள்',
    noPlacesTitle: 'பொருத்தமான இடங்கள் இல்லை',
    noPlacesDesc: 'தேடல் தூரத்தை அதிகரிக்கவும் அல்லது வடிகட்டிகளை மாற்றவும்.',

    // Facilities & Statuses
    wheelchairRamp: 'சக்கர நாற்காலி சாய்தளம்',
    elevatorLift: 'மின்தூக்கி (லிப்ட்)',
    accessibleToilet: 'அணுகக்கூடிய கழிப்பறை',
    accessibleParking: 'அணுகக்கூடிய வாகன நிறுத்துமிடம்',
    brailleSignage: 'பிரெய்லி தகவல் பலகை',
    audioAssistance: 'ஒலி உதவி அறிவிப்பு',
    tactilePaving: 'தொடு உணர்வு நடைபாதை',
    stepFreeEntrance: 'படியில்லா நுழைவு',
    seatingRestArea: 'ஓய்வு இருக்கைகள்',

    statusAvailable: 'சரிபார்க்கப்பட்டு உள்ளது',
    statusUnavailable: 'கிடைக்கவில்லை',
    statusUnknown: 'சரிபார்க்கப்படவில்லை',
    statusConflicting: 'முரண்பட்ட தகவல்கள்',
    statusUserReported: 'சரிபார்ப்பு நிலுவையில்',

    // Place Details
    getDirections: 'வழிசெலுத்தல் (வரைபடம்)',
    callVenue: 'அழைக்க',
    visitWebsite: 'இணையதளம்',
    savePlace: 'சேமிக்க',
    saved: 'சேமிக்கப்பட்டது',
    reportIssue: 'தவறான தகவலைத் தெரிவிக்க',
    lastVerifiedOn: 'கடைசியாக சரிபார்க்கப்பட்ட நாள்',
    sourceAttribution: 'தரவு மூலம் & சான்றுகள்',
    verifiedAudit: 'நேரடி தணிக்கை மூலம் சரிபார்க்கப்பட்டது',
    aboutVenue: 'இடம் பற்றிய விவரம்',
    facilityBreakdownTitle: 'அணுகல்தன்மை வசதிகள் விவரம்',
    facilityBreakdownSubtitle: 'ஆதாரங்களுடன் கூடிய உண்மை நிலை.',
    reviewsTitle: 'சமூக மதிப்புரைகள் & கருத்துகள்',
    leaveReview: 'உங்கள் அனுபவத்தைப் பகிரவும்',
    generalRating: 'பொது மதிப்பீடு',
    accessRating: 'அணுகல்தன்மை மதிப்பீடு',
    reviewCommentPlaceholder: 'சாய்தளம், கதவு அகலம், கழிப்பறை கைப்பிடிகள் பற்றிய விவரங்களை எழுதவும்...',
    postReviewBtn: 'மதிப்புரையை இடுக',

    // Report Inaccuracy Modal
    reportTitle: 'தவறான தகவலைத் தெரிவிக்க',
    reportSubtitle: 'மாற்றுத்திறனாளிகளுக்கான நம்பகமான தரவைப் பராமரிக்க எங்களுக்கு உதவுங்கள்.',
    issueCategoryLabel: 'எந்தத் தகவல் தவறானது?',
    issueIncorrectAccess: 'அணுகல்தன்மை வசதி தவறாக உள்ளது அல்லது மாறியுள்ளது',
    issueClosed: 'இந்த இடம் நிரந்தரமாக மூடப்பட்டுள்ளது',
    issueAddress: 'தவறான முகவரி அல்லது இடம்',
    issueContact: 'தவறான தொலைபேசி எண் அல்லது நேரம்',
    issueOther: 'பிற தகவல் பிழை',
    descriptionLabel: 'விவரங்களை விளக்குக',
    descriptionPlaceholder: 'எ.கா., பிரதான நுழைவாயிலில் சாய்தளம் தற்போது பழுதுபார்க்கப்படுகிறது...',
    evidenceLabel: 'கூடுதல் ஆதாரம் (இணைய இணைப்பு)',
    submitReportBtn: 'அறிக்கையை அனுப்புக',
    cancel: 'ரத்து செய்',

    // Footer
    footerDisclaimerTitle: 'கல்வித் திட்டம் & தரவுப் பொறுப்புத் துறப்பு',
    footerDisclaimerText:
      'AccessAble கோயம்புத்தூர் மற்றும் தமிழ்நாட்டின் உண்மையான அணுகல்தன்மை தணிக்கைகளுக்கு முன்னுரிமை அளிக்கிறது.'
  },

  hi: {
    // Navigation
    home: 'होम',
    discover: 'स्थान खोजें',
    nearMe: 'मेरे पास के स्थान',
    listPlace: 'स्थान जोड़ें',
    savedPlaces: 'सहेजे गए स्थान',
    adminDashboard: 'एडमिन डैशबोर्ड',
    accessibilityGuide: 'सुलभता गाइड',
    signIn: 'साइन इन',
    register: 'पंजीकरण',
    signOut: 'साइन आउट',
    myAccount: 'मेरा खाता',
    admin: 'प्रशासक',
    member: 'सदस्य',

    // Hero & Search
    heroTitle: 'तमिलनाडु में सुलभ सार्वजनिक स्थान खोजें',
    heroSubtitle:
      'कोयंबटूर और पूरे तमिलनाडु में अस्पतालों, परिसरों, स्टेशनों, कैफे और पार्कों के लिए सत्यापित दिव्यांगजन सुलभता जानकारी।',
    findNearMeBtn: 'मेरे पास सुलभ स्थान खोजें',
    searchPlaceholder: 'अस्पताल, कॉलेज, क्षेत्र (उदा. आर.एस. पुरम, गांधीपुरम), शहर या नाम खोजें...',
    explorePlaces: 'खोजें',
    coimbatoreFocus: 'कोयंबटूर के प्रमुख क्षेत्र',
    tamilNaduDestinations: 'तमिलनाडु के जिले',
    regionalHub: 'तमिलनाडु क्षेत्रीय केंद्र',
    westernTN: 'पश्चिमी तमिलनाडु',
    northernTN: 'उत्तरी तमिलनाडु',
    centralTN: 'मध्य तमिलनाडु',
    southernTN: 'दक्षिणी तमिलनाडु',
    otherDestinations: 'अन्य गंतव्य',
    regionLabel: 'क्षेत्र',
    allRegions: 'सभी क्षेत्र',
    coverageStats: 'राज्यव्यापी कवरेज',

    // Discovery & Filters
    directoryTitle: 'तमिलनाडु सुलभता निर्देशिका',
    directorySubtitle: 'व्हीलचेयर रैंप, लिफ्ट और स्पर्शनीय साइनेज वाले सत्यापित स्थानों की खोज करें।',
    filters: 'फ़िल्टर',
    resetFilters: 'रीसेट',
    sortResultsBy: 'क्रमबद्ध करें',
    sortNewest: 'हाल ही में सत्यापित',
    sortDistance: 'सबसे नजदीक',
    sortAccessibility: 'सर्वोत्तम सुलभता रेटिंग',
    sortRating: 'सर्वोच्च रेटिंग',
    sortName: 'नाम (A-Z)',
    categoryLabel: 'श्रेणी',
    districtLabel: 'ज़िला',
    localityLabel: 'कोयंबटूर क्षेत्र',
    distanceLabel: 'अधिकतम दूरी',
    allCategories: 'सभी श्रेणियां',
    allDistricts: 'सभी ज़िले',
    allLocalities: 'सभी क्षेत्र',
    anyDistance: 'कोई भी दूरी',
    facilitiesFilterTitle: 'सुलभता सुविधाएं',
    minAccessibilityScore: 'न्यूनतम सुलभता स्कोर',
    viewModeList: 'सूची दृश्य',
    viewModeMap: 'मानचित्र दृश्य',
    viewModeSplit: 'विभाजित दृश्य',
    foundPlaces: 'मिले',
    placesCount: 'स्थान',
    noPlacesTitle: 'कोई स्थान नहीं मिला',
    noPlacesDesc: 'कृपया दूरी बढ़ाएं या सुलभता फ़िल्टर समायोजित करें।',

    // Facilities & Statuses
    wheelchairRamp: 'व्हीलचेयर रैंप',
    elevatorLift: 'लिफ्ट / एलेवेटर',
    accessibleToilet: 'दिव्यांगजन शौचालय',
    accessibleParking: 'सुलभ पार्किंग',
    brailleSignage: 'ब्रेल साइनेज',
    audioAssistance: 'ऑडियो सहायता',
    tactilePaving: 'स्पर्शनीय फुटपाथ',
    stepFreeEntrance: 'सीढ़ी-रहित प्रवेश',
    seatingRestArea: 'विश्राम बैठने की जगह',

    statusAvailable: 'सत्यापित उपलब्ध',
    statusUnavailable: 'सत्यापित अनुपलब्ध',
    statusUnknown: 'अज्ञात / जाँचा नहीं गया',
    statusConflicting: 'परस्पर विरोधी रिपोर्ट',
    statusUserReported: 'सत्यापन लंबित',

    // Place Details
    getDirections: 'दिशा-निर्देश प्राप्त करें',
    callVenue: 'कॉल करें',
    visitWebsite: 'वेबसाइट',
    savePlace: 'सहेजें',
    saved: 'सहेजा गया',
    reportIssue: 'गलत जानकारी की रिपोर्ट करें',
    lastVerifiedOn: 'अंतिम सत्यापन तिथि',
    sourceAttribution: 'डेटा स्रोत एवं साक्ष्य',
    verifiedAudit: 'सत्यापित ऑन-साइट ऑडिट',
    aboutVenue: 'स्थान के बारे में',
    facilityBreakdownTitle: 'सुलभता सुविधाओं का विवरण',
    facilityBreakdownSubtitle: 'साक्ष्य-आधारित बहु-स्थिति सुलभता स्थिति।',
    reviewsTitle: 'समीक्षाएं एवं सुलभता प्रतिक्रिया',
    leaveReview: 'अपना अनुभव साझा करें',
    generalRating: 'सामान्य रेटिंग',
    accessRating: 'सुलभता रेटिंग',
    reviewCommentPlaceholder: 'रैंप ढलान, दरवाजे की चौड़ाई और शौचालय ग्रैब बार का विवरण दें...',
    postReviewBtn: 'समीक्षा पोस्ट करें',

    // Report Inaccuracy Modal
    reportTitle: 'गलत जानकारी की रिपोर्ट करें',
    reportSubtitle: 'दिव्यांगजनों के लिए विश्वसनीय डेटा बनाए रखने में हमारी सहायता करें।',
    issueCategoryLabel: 'क्या गलत है?',
    issueIncorrectAccess: 'सुलभता सुविधा गलत या बदल गई है',
    issueClosed: 'स्थान स्थायी रूप से बंद है',
    issueAddress: 'गलत पता या स्थिति',
    issueContact: 'गलत फोन नंबर या समय',
    issueOther: 'अन्य अशुद्धि',
    descriptionLabel: 'कृपया विवरण बताएं',
    descriptionPlaceholder: 'उदा. मुख्य प्रवेश द्वार पर रैंप मरम्मत के लिए बंद है...',
    evidenceLabel: 'वैकल्पिक साक्ष्य (लिंक या स्रोत)',
    submitReportBtn: 'रिपोर्ट सबमिट करें',
    cancel: 'रद्द करें',

    // Footer
    footerDisclaimerTitle: 'सत्यापन एवं शैक्षणिक परियोजना सूचना',
    footerDisclaimerText:
      'AccessAble कोयंबटूर और तमिलनाडु में साक्ष्य-आधारित सुलभता ऑडिट को प्राथमिकता देता है।'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('accessable_lang') || 'en');

  const changeLanguage = (newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLang(newLang);
      localStorage.setItem('accessable_lang', newLang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
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
