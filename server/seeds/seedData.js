const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_db';
    console.log(`[Seed Script] Connecting to database: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('[Seed Script] Connected to MongoDB.');

    // Clear existing data
    await User.deleteMany({});
    await Place.deleteMany({});
    await Review.deleteMany({});
    console.log('[Seed Script] Existing records cleared.');

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Platform Administrator',
        email: 'admin@accessable.org',
        password: 'Admin@123456', // Will be hashed by User pre-save hook
        role: 'admin',
        bio: 'Accessibility Compliance Coordinator and Platform Moderator.'
      },
      {
        name: 'Alex Morgan',
        email: 'user@accessable.org',
        password: 'User@123456',
        role: 'user',
        bio: 'Wheelchair user, accessibility advocate, and inclusive design enthusiast.'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@accessable.org',
        password: 'User@123456',
        role: 'user',
        bio: 'Low-vision researcher testing tactile and audio navigation in public spaces.'
      }
    ]);

    const adminUser = users[0];
    const userAlex = users[1];
    const userPriya = users[2];

    console.log(`[Seed Script] Created ${users.length} demonstration users.`);

    // 2. Seed Places (Explicitly identified as demonstration data)
    const placesData = [
      {
        name: 'Apex Memorial Multi-Specialty Hospital',
        description:
          '[DEMO RECORD] A comprehensive medical center offering round-the-clock emergency services, tactile path indicators from the main gate, low-incline entrance ramps with anti-slip grip, and braille-equipped high-capacity medical elevators.',
        category: 'Hospital',
        address: '45 Health Avenue, Medical District',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110001',
        contactNumber: '+1 (555) 234-5678',
        website: 'https://apexmemorial-demo.org',
        coordinates: { lat: 28.6139, lng: 77.209 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        facilityNotes: {
          wheelchairRamp: 'Wide automatic ramp at Emergency and Main OPD with 1:12 slope and grab rails.',
          elevatorLift: '6 stretcher-compatible lifts equipped with voice chime, floor announcement, and braille buttons.',
          accessibleToilet: 'Dedicated accessible washrooms on all 4 floors with grab bars and emergency pull cord.',
          accessibleParking: '8 reserved wide spots adjacent to the entrance with level tarmac.',
          brailleSignage: 'Tactile floor maps at entrance and braille labels on all consultation doors.',
          audioAssistance: 'Automated bilingual audio announcements at registration and waiting zones.'
        },
        status: 'verified',
        verificationNote: 'Audited by Municipal Disability Access Committee (Demonstration Record).',
        createdBy: adminUser._id,
        isSampleData: true,
        tags: ['Healthcare', 'Emergency', 'Tactile Paving', 'Full Accessibility', '24/7'],
        images: [
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Greenwood Metropolitan College of Engineering',
        description:
          '[DEMO RECORD] Academic campus featuring lecture halls, computerized laboratories, and central library. Main administrative block and central library feature wheelchair ramps and passenger lifts.',
        category: 'College/University',
        address: '100 University Boulevard, Tech Valley',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110005',
        contactNumber: '+1 (555) 876-5432',
        website: 'https://greenwood-engineering-demo.edu',
        coordinates: { lat: 28.62, lng: 77.215 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Unavailable',
          audioAssistance: 'Unknown'
        },
        facilityNotes: {
          wheelchairRamp: 'Paved ramps leading to Academic Block A, B, and the Central Library.',
          elevatorLift: 'Modern elevator in the 5-story Engineering Building and Science Block.',
          accessibleToilet: 'Unisex wheelchair-accessible toilet located on the Ground Floor of Block A.',
          accessibleParking: '4 designated accessible vehicle stalls near the main reception roundabout.',
          brailleSignage: 'Standard visual signage currently in place; tactile braille signage has not yet been installed.',
          audioAssistance: 'Information currently unknown; pending physical verification by campus committee.'
        },
        status: 'verified',
        verificationNote: 'Verified campus access audit report (Demonstration Record).',
        createdBy: adminUser._id,
        isSampleData: true,
        tags: ['Higher Education', 'Campus', 'Wheelchair Friendly', 'Student Services'],
        images: [
          'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Symphony Artisan Cafe & Roastery',
        description:
          '[DEMO RECORD] Street-level specialty coffee shop and bakery. Completely step-free entrance with spacious wide tables accommodating motorized wheelchairs, quiet acoustic seating areas, and accessible gender-neutral washroom.',
        category: 'Restaurant/Cafe',
        address: '18 Garden Market Street',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110012',
        contactNumber: '+1 (555) 345-6789',
        website: 'https://symphonycafe-demo.com',
        coordinates: { lat: 28.632, lng: 77.22 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Unavailable',
          accessibleToilet: 'Available',
          accessibleParking: 'Unavailable',
          brailleSignage: 'Available',
          audioAssistance: 'Unknown'
        },
        facilityNotes: {
          wheelchairRamp: 'Level threshold at front door, no step transition.',
          elevatorLift: 'Not applicable / Unavailable: Entire establishment is situated entirely on single ground floor.',
          accessibleToilet: 'Spacious accessible restroom with 36-inch doorway and sturdy grab handles.',
          accessibleParking: 'Street parking only; no reserved off-street accessible spots.',
          brailleSignage: 'Braille menus available upon request from the barista counter.',
          audioAssistance: 'No assistive hearing loop installed.'
        },
        status: 'verified',
        verificationNote: 'Community verified via on-site visitor review (Demonstration Record).',
        createdBy: userAlex._id,
        isSampleData: true,
        tags: ['Dining', 'Step-Free', 'Braille Menu', 'Ground Level', 'Coffee'],
        images: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Central Intermodal Metro Station',
        description:
          '[DEMO RECORD] Rapid transit hub connecting lines 1, 3, and 7. Full compliance with Universal Accessibility Transit Guidelines: tactile paving along platforms, wide fare gates, lift to all mezzanine levels, and bilingual audio announcements.',
        category: 'Transit/Station',
        address: 'Terminal Square, Transit Plaza',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110002',
        contactNumber: '+1 (555) 998-1122',
        website: 'https://metrorapid-demo.gov',
        coordinates: { lat: 28.618, lng: 77.205 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        facilityNotes: {
          wheelchairRamp: 'Grade-separated ramp at Station Entrance Gate 2 and Gate 4.',
          elevatorLift: 'Glass elevators connecting street level, concourse, and island platforms.',
          accessibleToilet: 'Accessible washrooms located near station control room on concourse.',
          accessibleParking: 'Dedicated drop-off zone and 10 disabled parking stalls in station multi-tier garage.',
          brailleSignage: 'Braille maps at every entry kiosk and tactile guiding strips throughout.',
          audioAssistance: 'Automated bilingual announcements for incoming trains, door closings, and transfers.'
        },
        status: 'verified',
        verificationNote: 'Verified transit authority accessibility guidelines (Demonstration Record).',
        createdBy: adminUser._id,
        isSampleData: true,
        tags: ['Public Transit', 'Metro', 'Tactile Strips', 'Universal Design', 'Accessible Commute'],
        images: [
          'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Civic Administrative Complex & Citizen Service Center',
        description:
          '[DEMO RECORD] Municipal office building handling permits, certifications, and public revenue services. Includes ramp at main porch and automated elevators to all administrative wings.',
        category: 'Office/Government',
        address: '5 Civic Plaza, Old Secretariat',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110006',
        contactNumber: '+1 (555) 443-2211',
        website: 'https://civiccomplex-demo.gov',
        coordinates: { lat: 28.625, lng: 77.208 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Unavailable',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Unavailable'
        },
        facilityNotes: {
          wheelchairRamp: 'Ramp with non-slip coating leading into main reception hall.',
          elevatorLift: 'Passenger elevator in North Wing and Central Wing.',
          accessibleToilet: 'Unavailable: Restrooms currently undergo modernization work; temporary units lack grab bars.',
          accessibleParking: '2 designated parking bays in front VIP/Citizen lot.',
          brailleSignage: 'Braille signage on door nameplates and room numbers.',
          audioAssistance: 'No assistive listening device or counter loop available.'
        },
        status: 'verified',
        verificationNote: 'Audited by Public Works inspection team (Demonstration Record).',
        createdBy: adminUser._id,
        isSampleData: true,
        tags: ['Government', 'Public Service', 'Admin Office', 'Elevator Access'],
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Riverside Waterfront Community Park',
        description:
          '[DEMO RECORD] Public botanical park along the riverbank featuring 2.5 kilometers of asphalt-paved pathways, barrier-free boardwalks, picnic areas with roll-under tables, and sensory garden with aromatic herbs.',
        category: 'Park/Recreation',
        address: 'Riverside Promenade, East Riverwalk',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110020',
        contactNumber: '+1 (555) 776-9900',
        website: 'https://riversidepark-demo.org',
        coordinates: { lat: 28.605, lng: 77.23 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Unavailable',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Unavailable',
          audioAssistance: 'Unavailable'
        },
        facilityNotes: {
          wheelchairRamp: 'Gently sloped barrier-free trails with rest benches placed every 50 meters.',
          elevatorLift: 'Unavailable: Natural outdoor recreational open ground with no multi-level buildings.',
          accessibleToilet: 'Two accessible unisex facilities located near East Gate and Central Pavilion.',
          accessibleParking: '6 dedicated stalls with direct boardwalk connectivity.',
          brailleSignage: 'Tactile maps currently in procurement.',
          audioAssistance: 'Audio guide apps available online, but no on-site speaker broadcasting.'
        },
        status: 'verified',
        verificationNote: 'Parks and Recreation department certified (Demonstration Record).',
        createdBy: userAlex._id,
        isSampleData: true,
        tags: ['Outdoors', 'Sensory Garden', 'Paved Trails', 'Family Friendly', 'Accessible Restrooms'],
        images: [
          'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Grand Horizon Retail Galleria',
        description:
          '[DEMO RECORD] 4-story retail shopping center with department stores, food court, and multiplex. Features glass capsule lifts, tactile floor tracks, accessible parking at every basement level, and baby care/assisted washrooms.',
        category: 'Shopping/Mall',
        address: '250 Outer Ring Road, Commercial Sector',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110015',
        contactNumber: '+1 (555) 667-8899',
        website: 'https://grandhorizongalleria-demo.com',
        coordinates: { lat: 28.64, lng: 77.21 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        facilityNotes: {
          wheelchairRamp: 'Step-free entry via glass sliding doors at North and South entrances.',
          elevatorLift: '4 panoramic elevators with illuminated braille keys and vocal arrival notification.',
          accessibleToilet: 'Wheelchair-friendly restrooms beside main elevators on all floors.',
          accessibleParking: '12 dedicated blue-badge stalls located closest to mall basement entrances.',
          brailleSignage: 'Mall directory kiosks feature braille legends and high-contrast font.',
          audioAssistance: 'Customer service desk equipped with induction loop for hearing aid users.'
        },
        status: 'verified',
        verificationNote: 'Audited during annual commercial accessibility review (Demonstration Record).',
        createdBy: adminUser._id,
        isSampleData: true,
        tags: ['Shopping', 'Hearing Loop', 'Accessible Parking', 'Family Restroom', 'Food Court'],
        images: [
          'https://images.unsplash.com/photo-1567449303078-57ad995bd302?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Heritage District Public Library & Archives',
        description:
          '[DEMO RECORD] Historical civic building restored with modern accessibility infrastructure. Offers motorized ramp at heritage arch, low reading desks, assistive screen-reader stations, and dedicated braille collection room.',
        category: 'Other',
        address: '12 Old Court Road, Historic Quarter',
        city: 'Metropolis',
        state: 'Capital Region',
        postalCode: '110008',
        contactNumber: '+1 (555) 555-4321',
        website: 'https://heritagelibrary-demo.org',
        coordinates: { lat: 28.61, lng: 77.202 },
        facilities: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Unavailable',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        facilityNotes: {
          wheelchairRamp: 'Architectural ramp blended with sandstone entrance.',
          elevatorLift: 'Hydraulic elevator serving basement archives, ground floor, and first floor galleries.',
          accessibleToilet: 'Single accessible restroom on ground floor behind reception.',
          accessibleParking: 'No on-site parking in historical pedestrianized zone; drop-off point at street curb.',
          brailleSignage: 'Extensive braille section and braille shelf indicators.',
          audioAssistance: 'Audiobook listening room and portable FM receiver units for public lectures.'
        },
        status: 'verified',
        verificationNote: 'Verified heritage access preservation initiative (Demonstration Record).',
        createdBy: userPriya._id,
        isSampleData: true,
        tags: ['Library', 'Screen Readers', 'Braille Books', 'Quiet Study', 'Heritage'],
        images: [
          'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    const createdPlaces = await Place.insertMany(placesData);
    console.log(`[Seed Script] Created ${createdPlaces.length} demonstration places.`);

    // 3. Seed Reviews & Compute Ratings
    const reviewsData = [
      {
        place: createdPlaces[0]._id, // Apex Hospital
        user: userAlex._id,
        rating: 5,
        accessibilityRating: 5,
        comment:
          'Outstanding accessibility throughout. The ramp slope at Emergency is very gentle and manageable without push assistance. Elevators are spacious enough for large power wheelchairs with plenty of clearance.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        isModerated: true
      },
      {
        place: createdPlaces[0]._id, // Apex Hospital
        user: userPriya._id,
        rating: 5,
        accessibilityRating: 5,
        comment:
          'As someone with visual impairment, I was deeply impressed by the tactile ground path that guides all the way from the front vehicle drop-off right into the reception desk. Audio chime in elevators is crystal clear.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        isModerated: true
      },
      {
        place: createdPlaces[1]._id, // Greenwood College
        user: userAlex._id,
        rating: 4,
        accessibilityRating: 4,
        comment:
          'Ramps to the library and classrooms are well paved. However, tactile signage is still missing on the upper floor seminar rooms, so students with low vision may need assistance.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Unavailable',
          audioAssistance: 'Unknown'
        },
        isModerated: true
      },
      {
        place: createdPlaces[2]._id, // Symphony Cafe
        user: userAlex._id,
        rating: 4,
        accessibilityRating: 4,
        comment:
          'Wonderful coffee and totally level entry. The staff is welcoming and helped arrange seating so my wheelchair was comfortable without blocking the aisle. Restroom door was wide and easy to maneuver.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Unavailable',
          accessibleToilet: 'Available',
          accessibleParking: 'Unavailable',
          brailleSignage: 'Available',
          audioAssistance: 'Unknown'
        },
        isModerated: true
      },
      {
        place: createdPlaces[3]._id, // Metro Station
        user: userAlex._id,
        rating: 5,
        accessibilityRating: 5,
        comment:
          'The gold standard for urban transit accessibility. The gap between platform and train car is minimal, and elevators have dual buttons at sitting height. Station marshals are proactive and trained.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        isModerated: true
      },
      {
        place: createdPlaces[4]._id, // Civic Complex
        user: userAlex._id,
        rating: 3,
        accessibilityRating: 3,
        comment:
          'Getting inside is easy via the front ramp, but note that the regular accessible toilet is closed for plumbing repairs. Ask security for the staff accessible facility on the 1st floor.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Unavailable',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Unavailable'
        },
        isModerated: true
      },
      {
        place: createdPlaces[5]._id, // Riverside Park
        user: userAlex._id,
        rating: 5,
        accessibilityRating: 5,
        comment:
          'A breath of fresh air! Smooth boardwalks make wheelchair strolling completely effortless. Roll-under picnic tables mean people in chairs can eat together with family rather than sitting at the periphery.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Unavailable',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Unavailable',
          audioAssistance: 'Unavailable'
        },
        isModerated: true
      },
      {
        place: createdPlaces[6]._id, // Grand Horizon Mall
        user: userPriya._id,
        rating: 5,
        accessibilityRating: 5,
        comment:
          'Hearing loop at the information kiosk made conversing with support staff so much easier. Elevators chime distinct sounds for up and down directions. Highly recommend!',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Available',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        isModerated: true
      },
      {
        place: createdPlaces[7]._id, // Heritage Library
        user: userPriya._id,
        rating: 4,
        accessibilityRating: 5,
        comment:
          'Impressive dedication to accessibility in an old building. The braille room has current reference books, and the screen-reader workstations in the basement have headphones ready.',
        facilityFeedback: {
          wheelchairRamp: 'Available',
          elevatorLift: 'Available',
          accessibleToilet: 'Available',
          accessibleParking: 'Unavailable',
          brailleSignage: 'Available',
          audioAssistance: 'Available'
        },
        isModerated: true
      }
    ];

    for (const rev of reviewsData) {
      await Review.create(rev);
    }

    console.log(`[Seed Script] Created ${reviewsData.length} demonstration reviews.`);

    // Refresh average ratings for all places
    for (const pl of createdPlaces) {
      await Review.calculateAverageRatings(pl._id);
    }

    console.log('[Seed Script] Place average ratings aggregated.');
    console.log('\n======================================================');
    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY');
    console.log('======================================================');
    console.log('Demo Credentials for Project Evaluation:');
    console.log('  Admin User:');
    console.log('    Email:    admin@accessable.org');
    console.log('    Password: Admin@123456');
    console.log('    Role:     admin');
    console.log('  Student / Regular User:');
    console.log('    Email:    user@accessable.org');
    console.log('    Password: User@123456');
    console.log('    Role:     user');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Script Error] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
