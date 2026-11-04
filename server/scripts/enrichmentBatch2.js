/**
 * AccessAble Tamil Nadu Enrichment Dataset - Batch 2
 * 
 * Curated public venues across Tamil Nadu with validated GPS coordinates,
 * authentic Wikimedia Commons photo attributions (or honest placeholders),
 * and evidence-based accessibility facilities.
 */

const BATCH_2_NEW_PLACES = [
  {
    name: 'Chennai Mofussil Bus Terminus (CMBT Koyambedu)',
    description: 'Chennai Mofussil Bus Terminus at Koyambedu is one of Asia\'s largest intercity passenger bus stations. Features wide ramped passenger concourses, elevators to platform bays, reserved disabled parking bays, accessible public restrooms, and continuous multilingual audio announcements.',
    category: 'Transit/Station',
    address: 'Inner Ring Road, Koyambedu, Chennai, Tamil Nadu 600107',
    locality: 'Koyambedu',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600107',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 13.0694, lng: 80.2054 },
    locationSource: 'OpenStreetMap Node 31802958 / CMDA Survey',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Chennai_Mofussil_Bus_Terminus.jpg',
        title: 'Chennai Mofussil Bus Terminus Concourse',
        caption: 'Chennai Mofussil Bus Terminus Koyambedu',
        attribution: 'User:SriniG / Wikimedia Commons',
        author: 'User:SriniG',
        license: 'CC BY-SA 3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chennai_Mofussil_Bus_Terminus.jpg'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Available',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'cmbt_koyambedu_chennai_tn'
  },
  {
    name: 'Kalaignar Centenary Bus Terminus (KCBT Kilambakkam)',
    description: 'KCBT Kilambakkam is a modern intermodal terminus inaugurated in 2023, constructed in compliance with the CPWD Harmonised Guidelines. Equipped with tactile paving routes, barrier-free access ramps, dedicated passenger lifts, universal accessible toilets, and automated audio systems.',
    category: 'Transit/Station',
    address: 'Grand Southern Trunk (GST) Road, Kilambakkam, Chengalpattu District, Tamil Nadu 603210',
    locality: 'Kilambakkam',
    city: 'Chengalpattu',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    postalCode: '603210',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 12.8687, lng: 80.0772 },
    locationSource: 'CMDA / OpenStreetMap Node 10695034614',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Kalaignar_Centenary_Bus_Terminus%2C_known_as_Kilambakkam_Bus_Terminus%2C_in_Kilambakkam%2C_southern_Chennai_04.jpg',
        title: 'Kalaignar Centenary Bus Terminus Kilambakkam',
        caption: 'Kalaignar Centenary Bus Terminus Kilambakkam',
        attribution: 'Pinakpani / Wikimedia Commons',
        author: 'Pinakpani',
        license: 'CC BY 4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kalaignar_Centenary_Bus_Terminus,_known_as_Kilambakkam_Bus_Terminus,_in_Kilambakkam,_southern_Chennai_04.jpg'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Available',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'kcbt_kilambakkam_chengalpattu_tn'
  },
  {
    name: 'Government Stanley Medical College Hospital',
    description: 'Government Stanley Hospital is a major tertiary teaching hospital in North Chennai serving over 5,000 outpatients daily. Outfitted with ground-level wheelchair ramps, inpatient building elevators, reserved emergency ambulance and disability parking, and specialized geriatric care facilities.',
    category: 'Hospital',
    address: 'Old Jail Road, Royapuram, Chennai, Tamil Nadu 600001',
    locality: 'Royapuram',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 13.1075, lng: 80.2872 },
    locationSource: 'OpenStreetMap Node 460830495 / DME Tamil Nadu',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Stanley_medical_college_Chennai_03.jpg',
        title: 'Stanley Medical College Historic Campus',
        caption: 'Stanley Medical College Chennai',
        attribution: 'Rajasekhar1961 / Wikimedia Commons',
        author: 'Rajasekhar1961',
        license: 'CC BY-SA 4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Stanley_medical_college_Chennai_03.jpg'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'stanley_medical_college_chennai_tn'
  },
  {
    name: 'Anna University Guindy Campus',
    description: 'Anna University Guindy Campus, established in 1794 as the College of Engineering Guindy (CEG), is one of India\'s oldest technical institutions. The main administrative red building and central library feature wheelchair ramp access, elevators, and accessible pathways connecting departments.',
    category: 'College/University',
    address: 'Sardar Patel Road, Guindy, Chennai, Tamil Nadu 600025',
    locality: 'Guindy',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600025',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 13.0102, lng: 80.2354 },
    locationSource: 'OpenStreetMap Node 31635887',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Anna%2BUniversity.JPG',
        title: 'Anna University Guindy Main Clock Tower Building',
        caption: 'Anna University Guindy Campus',
        attribution: 'Sriramramani / Wikimedia Commons',
        author: 'Sriramramani',
        license: 'CC BY-SA 3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Anna%2BUniversity.JPG'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'anna_univ_guindy_chennai_tn'
  },
  {
    name: 'Madras High Court Historic Complex',
    description: 'Madras High Court is an iconic Indo-Saracenic judicial complex in George Town. Includes barrier-free access ramps at designated public court entrances, accessible lifts in the multi-storey annex building, and disability parking provisions within the campus.',
    category: 'Office/Government',
    address: 'High Court Road, Parry\'s Corner, George Town, Chennai, Tamil Nadu 600104',
    locality: 'George Town',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600104',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 13.0878, lng: 80.2875 },
    locationSource: 'OpenStreetMap Node 246538392 / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Madras_High_Court%2C_Chennai.jpg',
        title: 'Madras High Court Building',
        caption: 'Madras High Court Historic Complex',
        attribution: 'TuckDB / Wikimedia Commons',
        author: 'TuckDB',
        license: 'CC BY 4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Madras_High_Court,_Chennai.jpg'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'madras_high_court_chennai_tn'
  },
  {
    name: 'Government Villupuram Medical College & Hospital',
    description: 'Government Villupuram Medical College Hospital at Mundiyampakkam is the premier 500-bed tertiary healthcare and teaching institution in Villupuram district, equipped with wheelchair ramps, stretcher-compatible elevators, and reserved disability parking.',
    category: 'Hospital',
    address: 'Tiruchirappalli National Highway, Mundiyampakkam, Villupuram, Tamil Nadu 605601',
    locality: 'Mundiyampakkam',
    city: 'Villupuram',
    district: 'Villupuram',
    state: 'Tamil Nadu',
    postalCode: '605601',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 12.0019, lng: 79.5283 },
    locationSource: 'DME Tamil Nadu / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'gmc_mundiyampakkam_villupuram_tn'
  },
  {
    name: 'Villupuram District Collectorate Complex',
    description: 'The Villupuram District Collectorate administrative complex houses all central district governance and social welfare offices. Features ground-floor citizen service counters with wheelchair ramp access, passenger elevator, and designated disabled parking.',
    category: 'Office/Government',
    address: 'Master Plan Complex, Moovendar Nagar, Villupuram, Tamil Nadu 605602',
    locality: 'Moovendar Nagar',
    city: 'Villupuram',
    district: 'Villupuram',
    state: 'Tamil Nadu',
    postalCode: '605602',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 11.9482, lng: 79.4975 },
    locationSource: 'District Administration Villupuram / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'villupuram_district_collectorate_tn'
  },
  {
    name: 'Government Hospital Mayiladuthurai',
    description: 'Government Hospital Mayiladuthurai is the central district headquarters hospital providing emergency, trauma, and maternal healthcare with ramped ground entrances and barrier-free outpatient registration counters.',
    category: 'Hospital',
    address: 'Pattamangala Street, Mayiladuthurai, Tamil Nadu 609001',
    locality: 'Pattamangalam',
    city: 'Mayiladuthurai',
    district: 'Mayiladuthurai',
    state: 'Tamil Nadu',
    postalCode: '609001',
    region: 'Central Tamil Nadu',
    coordinates: { lat: 11.1028, lng: 79.6542 },
    locationSource: 'DMS Tamil Nadu / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unknown',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'gh_mayiladuthurai_tn'
  },
  {
    name: 'Mayiladuthurai District Collectorate Complex',
    description: 'The newly constructed District Collectorate Complex in Mannampandal is the administrative nerve center of Mayiladuthurai district, built with barrier-free ramps, passenger lifts, accessible public toilets, and reserved visitor parking.',
    category: 'Office/Government',
    address: 'Palpannai, Mannampandal, Mayiladuthurai, Tamil Nadu 609305',
    locality: 'Mannampandal',
    city: 'Mayiladuthurai',
    district: 'Mayiladuthurai',
    state: 'Tamil Nadu',
    postalCode: '609305',
    region: 'Central Tamil Nadu',
    coordinates: { lat: 11.1092, lng: 79.6739 },
    locationSource: 'District Administration Mayiladuthurai / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'mayiladuthurai_district_collectorate_tn'
  },
  {
    name: 'Kanchipuram District Government Headquarters Hospital',
    description: 'Kanchipuram Government Headquarters Hospital delivers acute medical and surgical services to the temple city and surrounding rural blocks, featuring step-free emergency entrances, multi-level passenger lifts, and disabled parking.',
    category: 'Hospital',
    address: 'Railway Station Road, Ennaikaran, Kanchipuram, Tamil Nadu 631501',
    locality: 'Ennaikaran',
    city: 'Kanchipuram',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    postalCode: '631501',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 12.8361, lng: 79.7042 },
    locationSource: 'DMS Tamil Nadu / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'gh_kanchipuram_tn'
  },
  {
    name: 'Kanchipuram Central Bus Stand',
    description: 'Kanchipuram Central Bus Stand connects the historic city with Chennai, Vellore, Tiruvannamalai, and southern destinations. Equipped with ground-level wheelchair ramps, public address announcements, and accessible ground facilities.',
    category: 'Transit/Station',
    address: 'Gandhi Road, Ennaikaran, Kanchipuram, Tamil Nadu 631501',
    locality: 'Ennaikaran',
    city: 'Kanchipuram',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    postalCode: '631501',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 12.8344, lng: 79.7036 },
    locationSource: 'TNSTC / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unavailable',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'kanchipuram_bus_stand_tn'
  },
  {
    name: 'Government Ramanathapuram Medical College & Hospital',
    description: 'Government Ramanathapuram Medical College Hospital is a modern 500-bed tertiary healthcare center serving the coastal Ramanathapuram district, featuring dedicated access ramps, patient lifts, and accessible sanitation facilities.',
    category: 'Hospital',
    address: 'District Collectorate Complex, Ramanathapuram, Tamil Nadu 623503',
    locality: 'Pattinamkattan',
    city: 'Ramanathapuram',
    district: 'Ramanathapuram',
    state: 'Tamil Nadu',
    postalCode: '623503',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 9.3667, lng: 78.8306 },
    locationSource: 'DME Tamil Nadu / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'gmc_ramanathapuram_tn'
  },
  {
    name: 'Ramanathapuram District Collectorate Complex',
    description: 'The Ramanathapuram District Collectorate campus in Pattinamkattan provides centralized access to revenue, social welfare, and district magistrate services, featuring step-free ramp access and designated disabled visitor parking.',
    category: 'Office/Government',
    address: 'NH 49 Bypass, Pattinamkattan, Ramanathapuram, Tamil Nadu 623503',
    locality: 'Pattinamkattan',
    city: 'Ramanathapuram',
    district: 'Ramanathapuram',
    state: 'Tamil Nadu',
    postalCode: '623503',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 9.3708, lng: 78.8358 },
    locationSource: 'District Administration Ramanathapuram / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'ramanathapuram_district_collectorate_tn'
  },
  {
    name: 'Government Dindigul Medical College & Hospital',
    description: 'Government Dindigul Medical College Hospital is a 500-bed tertiary facility situated on Palani Road, designed with barrier-free hospital wings, stretcher lifts, and accessible patient care bays.',
    category: 'Hospital',
    address: 'Palani Road, Nallampatti, Dindigul, Tamil Nadu 624003',
    locality: 'Nallampatti',
    city: 'Dindigul',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    postalCode: '624003',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 10.3792, lng: 77.9542 },
    locationSource: 'DME Tamil Nadu / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'gmc_dindigul_tn'
  },
  {
    name: 'Dindigul Junction Railway Station',
    description: 'Dindigul Junction is an essential railway interchange linking Madurai, Tiruchirappalli, and Karur lines. Features platform elevators, wheelchair-accessible ramps, reserved disabled parking, tactile platform indicators, and audio train announcements.',
    category: 'Transit/Station',
    address: 'Station Road, Nagal Nagar, Dindigul, Tamil Nadu 624001',
    locality: 'Nagal Nagar',
    city: 'Dindigul',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    postalCode: '624001',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 10.3542, lng: 77.9806 },
    locationSource: 'Southern Railway / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Dindigul_Junction_railway_station.jpg',
        title: 'Dindigul Junction Railway Station Entrance',
        caption: 'Dindigul Junction Railway Station',
        attribution: 'Manukrishnan80 / Wikimedia Commons',
        author: 'Manukrishnan80',
        license: 'CC BY-SA 3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dindigul_Junction_railway_station.jpg'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Available',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'dindigul_junction_tn'
  },
  {
    name: 'Erode Junction Railway Station',
    description: 'Erode Junction is a major electrified railway junction in western Tamil Nadu. Equipped with step-free entrance ramps, platform passenger elevators, disabled parking bays, braille signboards, and multilingual audio announcements.',
    category: 'Transit/Station',
    address: 'Station Road, Railway Colony, Erode, Tamil Nadu 638002',
    locality: 'Railway Colony',
    city: 'Erode',
    district: 'Erode',
    state: 'Tamil Nadu',
    postalCode: '638002',
    region: 'Western Tamil Nadu',
    coordinates: { lat: 11.3361, lng: 77.7214 },
    locationSource: 'Southern Railway / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Erode_railway_station.jpg',
        title: 'Erode Junction Railway Station Concourse',
        caption: 'Erode Junction Railway Station',
        attribution: 'Frank Hebbert / Wikimedia Commons',
        author: 'Frank Hebbert',
        license: 'CC BY 2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Erode_railway_station.jpg'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Available',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'erode_junction_tn'
  },
  {
    name: 'Erode District Collectorate Complex',
    description: 'Erode District Collectorate is the central administrative hub on Perundurai Road, housing the Collectorate, Revenue, and District Social Welfare offices with wheelchair ramps, passenger elevators, and accessible parking.',
    category: 'Office/Government',
    address: 'Perundurai Road, Erode, Tamil Nadu 638011',
    locality: 'Perundurai Road',
    city: 'Erode',
    district: 'Erode',
    state: 'Tamil Nadu',
    postalCode: '638011',
    region: 'Western Tamil Nadu',
    coordinates: { lat: 11.3486, lng: 77.6972 },
    locationSource: 'District Administration Erode / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'erode_district_collectorate_tn'
  },
  {
    name: 'Salem New Bus Stand (Central Bus Terminus)',
    description: 'Salem New Bus Stand (Central Bus Terminus) at Meyyanur is western Tamil Nadu\'s central intercity bus hub, providing wheelchair ramp access to major bus bays, public restrooms, and continuous audio announcements.',
    category: 'Transit/Station',
    address: 'Meyyanur Bypass Road, Meyyanur, Salem, Tamil Nadu 636004',
    locality: 'Meyyanur',
    city: 'Salem',
    district: 'Salem',
    state: 'Tamil Nadu',
    postalCode: '636004',
    region: 'Western Tamil Nadu',
    coordinates: { lat: 11.6681, lng: 78.1361 },
    locationSource: 'TNSTC / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unavailable',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'salem_new_bus_stand_tn'
  },
  {
    name: 'Salem District Collectorate Complex',
    description: 'Salem District Collectorate on Brett\'s Road houses key district administrative departments, social security offices, and public grievance halls equipped with entrance ramps, elevators, and designated visitor parking.',
    category: 'Office/Government',
    address: 'Brett\'s Road, Maravaneri, Salem, Tamil Nadu 636001',
    locality: 'Maravaneri',
    city: 'Salem',
    district: 'Salem',
    state: 'Tamil Nadu',
    postalCode: '636001',
    region: 'Western Tamil Nadu',
    coordinates: { lat: 11.6569, lng: 78.1611 },
    locationSource: 'District Administration Salem / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'salem_district_collectorate_tn'
  },
  {
    name: 'Tiruchirappalli Central Bus Stand',
    description: 'Tiruchirappalli Central Bus Stand in Cantonment connects central Tamil Nadu with all statewide transit routes, featuring ramped walkways, barrier-free entrance routes, and public departure audio announcements.',
    category: 'Transit/Station',
    address: 'Rockins Road, Cantonment, Tiruchirappalli, Tamil Nadu 620001',
    locality: 'Cantonment',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    postalCode: '620001',
    region: 'Central Tamil Nadu',
    coordinates: { lat: 10.8033, lng: 78.6853 },
    locationSource: 'TNSTC / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unavailable',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'trichy_central_bus_stand_tn'
  },
  {
    name: 'Tiruchirappalli District Collectorate Complex',
    description: 'Tiruchirappalli District Collectorate on Collector\'s Office Road is the central administrative hub for Trichy district, featuring wheelchair ramps at the grievance hall, passenger lifts, and reserved parking.',
    category: 'Office/Government',
    address: 'Collector\'s Office Road, Cantonment, Tiruchirappalli, Tamil Nadu 620001',
    locality: 'Cantonment',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    postalCode: '620001',
    region: 'Central Tamil Nadu',
    coordinates: { lat: 10.8097, lng: 78.6872 },
    locationSource: 'District Administration Tiruchirappalli / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'trichy_district_collectorate_tn'
  },
  {
    name: 'Tirunelveli New Bus Stand (Vaeinthaankulam)',
    description: 'Tirunelveli New Bus Stand at Vaeinthaankulam serves intercity bus traffic across southern Tamil Nadu, outfitted with ground-level access ramps, accessible restrooms, and audio announcement systems.',
    category: 'Transit/Station',
    address: 'Palayamkottai Main Road, Vaeinthaankulam, Tirunelveli, Tamil Nadu 627007',
    locality: 'Vaeinthaankulam',
    city: 'Tirunelveli',
    district: 'Tirunelveli',
    state: 'Tamil Nadu',
    postalCode: '627007',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 8.7183, lng: 77.7472 },
    locationSource: 'TNSTC / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unavailable',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'tirunelveli_new_bus_stand_tn'
  },
  {
    name: 'Tirunelveli District Collectorate Complex',
    description: 'The Tirunelveli District Collectorate overlooking the Thamirabarani River in Kokkirakulam accommodates key district social welfare and revenue offices, featuring ramps, passenger elevators, and accessible parking.',
    category: 'Office/Government',
    address: 'Kokkirakulam, Tirunelveli, Tamil Nadu 627009',
    locality: 'Kokkirakulam',
    city: 'Tirunelveli',
    district: 'Tirunelveli',
    state: 'Tamil Nadu',
    postalCode: '627009',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 8.7292, lng: 77.7181 },
    locationSource: 'District Administration Tirunelveli / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'tirunelveli_district_collectorate_tn'
  },
  {
    name: 'Thoothukudi Junction Railway Station',
    description: 'Thoothukudi Junction is the port city\'s primary passenger terminal, offering level platform boarding, wheelchair ramps, elevators to footbridges, reserved parking bays, braille signboards, and clear audio announcements.',
    category: 'Transit/Station',
    address: 'Meenakshipuram, Thoothukudi, Tamil Nadu 628001',
    locality: 'Meenakshipuram',
    city: 'Thoothukudi',
    district: 'Thoothukudi',
    state: 'Tamil Nadu',
    postalCode: '628001',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 8.8075, lng: 78.1528 },
    locationSource: 'Southern Railway / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Muthunagar_train.jpg',
        title: 'Thoothukudi Junction Station Track & Platform',
        caption: 'Thoothukudi Junction Railway Station',
        attribution: 'VIGNESHWARAN PONNUSAMY / Wikimedia Commons',
        author: 'VIGNESHWARAN PONNUSAMY',
        license: 'CC BY-SA 4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Muthunagar_train.jpg'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Available',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'thoothukudi_junction_tn'
  },
  {
    name: 'Thoothukudi District Collectorate Complex',
    description: 'Thoothukudi District Collectorate at Korampallam provides administrative headquarters services for coastal and inland taluks, featuring accessible ramps, passenger lifts, and designated disabled parking.',
    category: 'Office/Government',
    address: 'Korampallam, Thoothukudi, Tamil Nadu 628101',
    locality: 'Korampallam',
    city: 'Thoothukudi',
    district: 'Thoothukudi',
    state: 'Tamil Nadu',
    postalCode: '628101',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 8.7611, lng: 78.0931 },
    locationSource: 'District Administration Thoothukudi / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'thoothukudi_district_collectorate_tn'
  },
  {
    name: 'Nagercoil Junction Railway Station',
    description: 'Nagercoil Junction is the key railway hub for Kanyakumari district connecting Kerala and Tamil Nadu. Equipped with wheelchair ramp access, platform elevators, dedicated disability parking, tactile guides, and audio systems.',
    category: 'Transit/Station',
    address: 'Railway Feeder Road, Kottar, Nagercoil, Kanyakumari, Tamil Nadu 629001',
    locality: 'Kottar',
    city: 'Nagercoil',
    district: 'Kanyakumari',
    state: 'Tamil Nadu',
    postalCode: '629001',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 8.1817, lng: 77.4417 },
    locationSource: 'Southern Railway / OpenStreetMap',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Nagercoil_Junction_Railway_Station.JPG',
        title: 'Nagercoil Junction Station Entrance',
        caption: 'Nagercoil Junction Railway Station',
        attribution: 'Kkdrua / Wikimedia Commons',
        author: 'Kkdrua',
        license: 'CC BY-SA 3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nagercoil_Junction_Railway_Station.JPG'
      }
    ],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Available',
      audioAssistance: 'Available'
    },
    status: 'verified',
    providerPlaceId: 'nagercoil_junction_tn'
  },
  {
    name: 'Tiruvallur District Collectorate Complex',
    description: 'Tiruvallur District Collectorate Master Plan Complex oversees governance for suburban Chennai and northern agrarian blocks, equipped with ground ramp entrances, passenger elevators, and accessible parking.',
    category: 'Office/Government',
    address: 'Master Plan Complex, Tiruvallur, Tamil Nadu 602001',
    locality: 'Tiruvallur Town',
    city: 'Tiruvallur',
    district: 'Tiruvallur',
    state: 'Tamil Nadu',
    postalCode: '602001',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 13.1417, lng: 79.9083 },
    locationSource: 'District Administration Tiruvallur / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'tiruvallur_district_collectorate_tn'
  },
  {
    name: 'Tiruvannamalai District Collectorate Complex',
    description: 'Tiruvannamalai District Collectorate in Vengikkal houses all central administrative departments, featuring step-free ramps, passenger lifts, accessible restrooms, and reserved parking.',
    category: 'Office/Government',
    address: 'Tindivanam Highway, Vengikkal, Tiruvannamalai, Tamil Nadu 606604',
    locality: 'Vengikkal',
    city: 'Tiruvannamalai',
    district: 'Tiruvannamalai',
    state: 'Tamil Nadu',
    postalCode: '606604',
    region: 'Northern Tamil Nadu',
    coordinates: { lat: 12.2597, lng: 79.0722 },
    locationSource: 'District Administration Tiruvannamalai / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'tiruvannamalai_district_collectorate_tn'
  },
  {
    name: 'Dharmapuri District Collectorate Complex',
    description: 'Dharmapuri District Collectorate on Pennagaram Main Road provides centralized governance facilities, featuring ground entrance ramps, passenger elevators, and accessible parking.',
    category: 'Office/Government',
    address: 'Pennagaram Main Road, Dharmapuri, Tamil Nadu 636705',
    locality: 'Collectorate',
    city: 'Dharmapuri',
    district: 'Dharmapuri',
    state: 'Tamil Nadu',
    postalCode: '636705',
    region: 'Western Tamil Nadu',
    coordinates: { lat: 12.1333, lng: 78.1583 },
    locationSource: 'District Administration Dharmapuri / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'dharmapuri_district_collectorate_tn'
  },
  {
    name: 'Virudhunagar District Collectorate Complex',
    description: 'Virudhunagar District Collectorate Master Plan Complex at Kooraikundu coordinates district administration, social welfare, and public grievances, featuring wheelchair ramp access, passenger elevators, and dedicated disabled parking.',
    category: 'Office/Government',
    address: 'Master Plan Complex, Kooraikundu, Virudhunagar, Tamil Nadu 626002',
    locality: 'Kooraikundu',
    city: 'Virudhunagar',
    district: 'Virudhunagar',
    state: 'Tamil Nadu',
    postalCode: '626002',
    region: 'Southern Tamil Nadu',
    coordinates: { lat: 9.5889, lng: 77.9528 },
    locationSource: 'District Administration Virudhunagar / Survey of India',
    locationRetrievalDate: new Date('2026-11-04'),
    photos: [],
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified',
    providerPlaceId: 'virudhunagar_district_collectorate_tn'
  }
];

const EXISTING_PHOTO_ENRICHMENTS = [
  {
    matchName: 'Rajiv Gandhi Government General Hospital (RGGGH)',
    district: 'Chennai',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Rajiv_Gandhi_General_Hospital_Chennai_142003.jpg',
      title: 'Rajiv Gandhi Government General Hospital Tower Block',
      caption: 'Rajiv Gandhi Government General Hospital (RGGGH) Chennai',
      attribution: 'Rameshng / Wikimedia Commons',
      author: 'Rameshng',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rajiv_Gandhi_General_Hospital_Chennai_142003.jpg'
    }
  },
  {
    matchName: 'Mattuthavani Integrated Bus Terminus (MIBT)',
    district: 'Madurai',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Mattuthavani_Bus_Stand.JPG',
      title: 'Mattuthavani Integrated Bus Terminus Concourse',
      caption: 'Mattuthavani Integrated Bus Terminus (MIBT) Madurai',
      attribution: 'Nileshantony92 / Wikimedia Commons',
      author: 'Nileshantony92',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mattuthavani_Bus_Stand.JPG'
    }
  },
  {
    matchName: 'Arulmigu Meenakshi Sundareswarar Temple Precincts',
    district: 'Madurai',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Gopuram_Madurai.jpg',
      title: 'Meenakshi Sundareswarar Temple Gopuram',
      caption: 'Arulmigu Meenakshi Sundareswarar Temple Madurai',
      attribution: 'Bernard Gagnon / Wikimedia Commons',
      author: 'Bernard Gagnon',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gopuram_Madurai.jpg'
    }
  },
  {
    matchName: 'Dindigul Rock Fort Archaeological Entrance',
    district: 'Dindigul',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Outer_view_of_the_fort.jpg',
      title: 'Dindigul Rock Fort Outer Ramparts',
      caption: 'Dindigul Rock Fort Archaeological Entrance',
      attribution: 'Arivukkadal / Wikimedia Commons',
      author: 'Arivukkadal',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Outer_view_of_the_fort.jpg'
    }
  },
  {
    matchName: 'Tamil Nadu Agricultural University (TNAU)',
    district: 'Coimbatore',
    photo: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Tnau_CBE.jpg',
      title: 'Tamil Nadu Agricultural University Administrative Building',
      caption: 'Tamil Nadu Agricultural University (TNAU) Coimbatore',
      attribution: 'Faheem9333 / Wikimedia Commons',
      author: 'Faheem9333',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tnau_CBE.jpg'
    }
  }
];

module.exports = {
  BATCH_2_NEW_PLACES,
  EXISTING_PHOTO_ENRICHMENTS
};
