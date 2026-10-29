# AccessAble – Accessibility Discovery Platform (Tamil Nadu & Coimbatore)

**AccessAble** is a full-stack web application designed to help people with disabilities, wheelchair users, caregivers, elderly citizens, and inclusive mobility advocates discover real public venues across **Coimbatore and Tamil Nadu** based on audited accessibility infrastructure and multi-status evidentiary tracking.

Built as an academic mini project for Full Stack Web Development, this platform implements strict **5-Status Multi-Domain Evidentiary Facility Modeling** (**Verified Available**, **Verified Unavailable**, **Unknown / Unaudited**, **Conflicting Reports**, and **User Reported Pending Verification**) to eliminate misinformation and guarantee truthful, verified mobility planning.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Real Coimbatore & Tamil Nadu Venue Coverage](#-real-coimbatore--tamil-nadu-venue-coverage)
- [Evidentiary Accessibility & Multi-Status Logic](#-evidentiary-accessibility--multi-status-logic)
- [Interactive Map & Provider Architecture](#-interactive-map--provider-architecture)
- [Regional Languages (English, Tamil, Hindi)](#-regional-languages-english-tamil-hindi)
- [Technology Stack](#-technology-stack)
- [System Architecture & Folder Structure](#-system-architecture--folder-structure)
- [Prerequisites](#-prerequisites)
- [PowerShell Quick Start (Running Frontend & Backend)](#-powershell-quick-start-running-frontend--backend)
- [Environment Configuration](#-environment-configuration)
- [Google Maps Platform Setup Guide (Optional)](#-google-maps-platform-setup-guide-optional)
- [Database Seeding & Demonstration Accounts](#-database-seeding--demonstration-accounts)
- [REST API Documentation](#-rest-api-documentation)
- [Automated Testing](#-automated-testing)
- [External Examiner & Reviewer Evaluation Guide](#-external-examiner--reviewer-evaluation-guide)

---

## 🌟 Key Features

1. **Real Places Across Coimbatore & Tamil Nadu**:
   - Seeded with 32+ genuine establishments: major hospitals (PSG, Ganga, KMCH, CMCH), transit terminals (Coimbatore Junction, Gandhipuram Bus Stand, Chennai Central), colleges (TNAU, PSG Tech), parks (Race Course Promenade, VOC Park, Valankulam Lake), shopping centers (Brookefields, Prozone), and heritage sites (Marina Beach Accessible Wooden Ramp, Thanjavur Big Temple, Meenakshi Temple, Kanyakumari Promenade).
   - Real GPS coordinates, verified phone numbers, and operational information.

2. **Interactive Map with View Switching**:
   - Toggle between **List View**, **Full Map View**, and **Split View**.
   - Custom accessible SVG pins indicating verification status.
   - Click pins to view photos, facility summary, distance from user, and one-click Google Maps directions.

3. **Geospatial "Places Near Me" Discovery**:
   - Browser geolocation GPS detection (`navigator.geolocation`).
   - Radius filtering: 5 km, 10 km, 25 km, 50 km with GeoJSON 2dsphere indexing and Haversine distance calculations (`distanceKm`).

4. **Multi-Status Evidentiary Accessibility Profile**:
   - Tracks 8 accessibility domains: Wheelchair Ramps, Elevators/Lifts, Accessible Restrooms, Accessible Parking, Braille Signage, Audio Assistance, Tactile Paving, and Step-Free Entrances.
   - 5 structured statuses with supporting audit evidence source, verification method, and last verified timestamp.
   - Backward-compatible with 3-state fields (`Available`, `Unavailable`, `Unknown`).

5. **Saved Places (Bookmarks)**:
   - Authenticated users can save accessible venues with one click to their personal collection (`/saved`).

6. **Inaccuracy Reporting Mechanism**:
   - Users can report inaccuracies (broken ramps, out-of-order lifts, changed hours) through the venue detail modal.
   - Admin moderation tab to investigate, resolve, or dismiss reports with admin audit notes.

7. **Regional Language Support (i18n)**:
   - Full tri-lingual interface supporting **English**, **Tamil (தமிழ்)**, and **Hindi (हिंदी)**.

8. **Authentic Photography & Attribution**:
   - Displays real photos of venues with photographer and license attribution (e.g. Creative Commons / Wikimedia / Verified Field Audit).

9. **WCAG 2.1 AA Compliance**:
   - High-contrast color palette, skip-to-content links, clear focus indicators (`outline: 3px solid #0d9488`), and screen-reader accessibility labels.

---

## 📍 Real Coimbatore & Tamil Nadu Venue Coverage

The platform provides verified listings across **31 administrative districts in Tamil Nadu**, categorized into 4 geographic zones plus the Coimbatore metropolitan cluster:

- **Western Tamil Nadu (Kongu & Hills)**: Coimbatore (Gandhipuram, RS Puram, Peelamedu, Saibaba Colony, Town Hall, Race Course, Avinashi Rd, Vadavalli, Pollachi Rd), Tiruppur, Erode, Salem, Nilgiris (Ooty & Coonoor), Pollachi, Namakkal, Karur.
- **Northern Tamil Nadu (Capital & Coast)**: Chennai (Central, Egmore, T. Nagar, Adyar, Guindy, Marina, Velachery, Anna Nagar, Mylapore), Chengalpattu, Tiruvallur, Kanchipuram, Vellore, Tiruvannamalai, Villupuram, Mahabalipuram.
- **Central Tamil Nadu (Delta & Heritage)**: Tiruchirappalli (Trichy), Thanjavur, Kumbakonam, Pudukkottai, Ariyalur, Perambalur, Mayiladuthurai.
- **Southern Tamil Nadu (Cultural Gateway)**: Madurai, Tirunelveli, Thoothukudi, Kanyakumari, Nagercoil, Dindigul, Sivakasi, Virudhunagar, Ramanathapuram, Kodaikanal, Rameswaram, Courtallam.

Every listing contains real GPS coordinates within Tamil Nadu geographic bounds (`lat: 8.0 to 13.6, lng: 76.1 to 80.4`), audited barrier-free facilities, and authentic photographs.

---

## ♿ Evidentiary Accessibility & Multi-Status Logic

Most platforms make a dangerous assumption: if accessibility information is missing, they label the facility as unavailable. AccessAble enforces strict multi-status evidentiary tracking:

- 🟢 **Verified Available**: Physically confirmed barrier-free access with compliant slope, handrails, or door clearances.
- 🔴 **Verified Unavailable**: Confirmed physical barrier (e.g., flight of stairs with no alternative ramp).
- 🟡 **Unknown / Unaudited**: Condition has not yet been audited. Missing data is never treated as unavailable.
- 🟠 **Conflicting Reports**: Multiple community reports dispute current accessibility status; flagged for re-audit.
- 🔵 **User Reported Pending Verification**: Community member submitted an audit awaiting admin review.

---

## 🗺 Interactive Map & Provider Architecture

- **Default Zero-API-Key Provider**: Uses **Leaflet 1.9** with **OpenStreetMap** tiles. Runs out of the box with zero external billing or API keys required.
- **Pluggable Provider Adapter**: Includes server-side `googlePlacesAdapter.js` ready to connect to Google Places API (New) when credentials are provided in `.env`.
- **Direct Directions**: Every venue card and detail page provides a 1-click navigation link to Google Maps navigation (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`).

---

## 🌐 Regional Languages (English, Tamil, Hindi)

AccessAble includes a client-side `LanguageProvider` with language selection available from the top navigation bar on both desktop and mobile:
- **English** (en)
- **தமிழ்** (ta)
- **हिंदी** (hi)

Language preferences are persisted in `localStorage`.

---

## 🛠 Technology Stack

### Frontend (`client/`)
- **React 18** & **Vite 5** (Fast SPA bundler)
- **Tailwind CSS 3** (Accessible contrast typography and responsive layout)
- **Leaflet 1.9 & React-Leaflet 4** (Zero-cost interactive maps)
- **React Router DOM 6** (Client-side routing)
- **Axios** (HTTP communication with JWT interceptors)
- **Lucide React** (Accessible SVG iconography)

### Backend (`server/`)
- **Node.js & Express 4** (RESTful API architecture)
- **Mongoose 8** (Object Data Modeling with GeoJSON 2dsphere indexing)
- **express-rate-limit** (API rate limiting protection)
- **bcryptjs** (Salted password hashing)
- **jsonwebtoken (JWT)** (Stateless authorization)
- **Node.js Test Runner (`node:test`)** (Integration tests)

### Database
- **Local MongoDB** (`mongodb://127.0.0.1:27017/accessable_db`) or **MongoDB Atlas**.
- Automatic graceful fallback: If an Atlas connection is blocked by IP whitelisting, the backend automatically falls back to local MongoDB.

---

## 📁 System Architecture & Folder Structure

```
AccessAble/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── InteractiveMap.jsx   # Leaflet Map with custom accessible pins
│   │   │   ├── PlaceCard.jsx        # Venue card with photo attribution & bookmarks
│   │   │   ├── FacilityBadge.jsx    # 5-status accessibility badges
│   │   │   ├── FilterDrawer.jsx     # Faceted filters, TN districts & GPS triggers
│   │   │   ├── LanguageSelector.jsx # Tri-lingual switcher (EN / TA / HI)
│   │   │   ├── ReportModal.jsx      # Inaccuracy reporting modal
│   │   │   └── Navbar.jsx           # Responsive header navigation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state, login/register, bookmarks
│   │   │   └── LanguageContext.jsx  # Tri-lingual translation dictionary
│   │   ├── pages/                   # Application views
│   │   │   ├── HomePage.jsx         # Hero, GPS "Near Me", Coimbatore quick jumps
│   │   │   ├── DiscoveryPage.jsx    # List, Map, and Split view directory
│   │   │   ├── PlaceDetailsPage.jsx # Comprehensive audit breakdown, photos & reviews
│   │   │   ├── SavedPlacesPage.jsx  # Bookmarked venues
│   │   │   ├── AdminDashboardPage.jsx # Places, Reviews, and Inaccuracy Reports queue
│   │   │   ├── AddPlacePage.jsx     # Register new venue with GPS coordinates
│   │   │   └── EditPlacePage.jsx    # Update venue details
│   │   └── services/
│   │       └── api.js               # Axios API client
├── server/                          # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                    # DB connection with Atlas & local fallback
│   ├── controllers/
│   │   ├── authController.js        # Auth, profile, saved places endpoints
│   │   ├── placeController.js       # Geospatial queries, CRUD, inaccuracy reports
│   │   └── reviewController.js      # Community review submissions & moderation
│   ├── models/
│   │   ├── Place.js                 # GeoJSON coordinates, photos, accessibilityProfile
│   │   ├── Report.js                # Inaccuracy reports schema
│   │   ├── Review.js                # Ratings and facility feedback
│   │   └── User.js                  # User credentials, roles, savedPlaces
│   ├── routes/                      # Express route endpoints
│   ├── seeds/
│   │   └── seedTamilNaduPlaces.js   # 32 genuine Coimbatore & TN locations
│   ├── services/
│   │   ├── geoService.js            # Haversine distance calculator
│   │   └── googlePlacesAdapter.js   # Google Places API integration adapter
│   ├── tests/
│   │   ├── api.test.js              # Core CRUD, auth, and reviews tests
│   │   └── tamilNaduAndGeo.test.js  # Nearby, distance, inaccuracy reports tests
│   └── server.js                    # Express app entrypoint & /api/health
└── README.md
```

---

## ⚡ Prerequisites

1. **Node.js**: v18.0.0 or later (v20+ recommended).
2. **MongoDB**: Local MongoDB community service running on port 27017, or a MongoDB Atlas URI.

---

## 💻 PowerShell Quick Start (Running Frontend & Backend)

Open **PowerShell** in the project directory (`E:\AccessAble`):

### Option A: Run Both Simultaneously from Root

```powershell
# 1. Install root, backend, and frontend packages (first run only)
npm run install:all

# 2. Seed database with real Coimbatore & Tamil Nadu locations
npm run seed

# 3. Start both backend (port 5000) and frontend (port 5173)
npm run dev
```

### Option B: Run in Separate PowerShell Terminals

**Terminal 1 — Backend (Express & MongoDB):**
```powershell
cd E:\AccessAble\server
npm install
npm run seed
npm run dev
```
*Backend runs on `http://localhost:5000`.*

**Terminal 2 — Frontend (React & Vite):**
```powershell
cd E:\AccessAble\client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

Open your browser and navigate to `http://localhost:5173`.

---

## 🔧 Environment Configuration

### Backend (`server/.env`)
A template is available at `server/.env.example`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/accessable_db
JWT_SECRET=accessable_super_secret_jwt_key_2026
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173

# Optional Google Places API (New) key
GOOGLE_MAPS_API_KEY=
```

### Frontend (`client/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🔑 Google Maps Platform Setup Guide (Optional)

The application defaults to OpenStreetMap/Leaflet, so **no paid Google API key is required**. If you wish to enable official Google Maps Platform services:

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and link a billing account.
3. Enable the following APIs:
   - **Places API (New)**
   - **Maps JavaScript API**
   - **Geocoding API**
4. Create an API Key under **APIs & Services > Credentials**.
5. Restrict the API key:
   - Application restriction: HTTP referrers (e.g. `http://localhost:5173/*`)
   - API restriction: Restrict key to Places API and Maps JavaScript API only.
6. Paste the key into `server/.env`:
   ```ini
   GOOGLE_MAPS_API_KEY=AIzaSy...
   ```
7. Restart the backend server. The backend health endpoint (`GET /api/health`) will confirm the active adapter state.

---

## 👥 Database Seeding & Demonstration Accounts

Run the seeder:
```powershell
npm run seed
```

### Pre-Configured Test Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@accessable.org` | `Admin@123` | Full CRUD, review moderation, verify listings, inaccuracy report management |
| **Community Member** | `student@accessable.org` | `Student@123` | Submit venues, submit reviews, bookmark places, submit reports |

---

## 📡 REST API Documentation

### System Health
- `GET /api/health` — Returns backend uptime, DB connection readyState (`cloud` or `local`), and Google Places adapter status.

### Authentication & Bookmarks
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`).
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve authenticated user profile and saved places.
- `POST /api/auth/save-place/:id` — Toggle saving a place to bookmarks (protected).
- `GET /api/auth/saved-places` — Get full details of bookmarked venues (protected).

### Places & Geospatial Discovery
- `GET /api/places` — Query places with filtering by `q`, `category`, `region`, `district`, `locality`, `city`, `wheelchairRamp`, `elevatorLift`, `accessibleToilet`, `minRating`, `sortBy`, `page`.
- `GET /api/places/nearby` — Geospatial radius discovery (`lat`, `lng`, `radius` in km). Returns venues sorted by `distanceKm`.
- `GET /api/places/search` — Autocomplete search across names, localities, and categories.
- `GET /api/places/regions` — Returns Tamil Nadu geographic zones (Western, Northern, Central, Southern), with venue counts and covered districts.
- `GET /api/places/coverage` — Live statewide coverage statistics, district breakdown, and verified facility counts.
- `POST /api/places/ingest` — Admin trigger for scalable data ingestion pipeline (modes: `catalogue`, `city`, `category`) with safe deduplication.
- `GET /api/places/districts` — Lists all covered districts and localities in Tamil Nadu.
- `GET /api/places/categories` — Aggregate count of places by category.
- `GET /api/places/:id` — Retrieve single place details and verified community reviews.
- `POST /api/places` — Create a new venue listing (protected).
- `PUT /api/places/:id` — Update listing (owner or admin).
- `DELETE /api/places/:id` — Delete venue listing (owner or admin).
- `PATCH /api/places/:id/verify` — Admin status verification (`verified` / `rejected`).
- `GET /api/places/stats/overview` — Admin overview metrics and facility counts.

### Inaccuracy Reports
- `POST /api/places/:id/reports` — Submit an inaccuracy report for a venue (`issueCategory`, `description`, `evidence`, `reporterName`, `reporterEmail`).
- `GET /api/places/admin/reports` — Admin listing of submitted inaccuracy reports.
- `PUT /api/places/admin/reports/:reportId` — Update report status (`investigating`, `resolved`, `dismissed`) with admin notes.

### Reviews
- `GET /api/reviews/recent` — Public endpoint returning recent moderated community reviews across places.
- `POST /api/reviews/place/:id` — Post accessibility review and facility feedback (protected).
- `DELETE /api/reviews/:id` — Delete review (author or admin).
- `GET /api/reviews/admin/all` — Admin review moderation queue.
- `PUT /api/reviews/:id/moderate` — Toggle review visibility (admin).

---

## 🧪 Automated Testing

AccessAble includes automated integration test suites executed with the built-in Node.js test runner (`node:test`):

```powershell
npm test
```

Expected output:
```
✔ GET /api/health should return ok status
✔ POST /api/auth/register should register a new user and return token
✔ POST /api/auth/login should authenticate user with correct credentials
✔ POST /api/places should create a place with accessibility facilities
✔ GET /api/places should filter places by category and facility
✔ POST /api/reviews/place/:id should add a review and update ratings
✔ GET /api/places/stats/overview should restrict non-admin and permit admin
✔ GET /api/places/categories should return category aggregates
✔ GET /api/places/districts should return district and locality coverage
✔ GET /api/places/nearby should return places near Coimbatore coordinates with distanceKm
✔ GET /api/places/search should find places by locality name
✔ GET /api/places/provider/status should report Google Places provider state
✔ POST /api/places/:id/reports should submit an inaccuracy report
✔ GET /api/places/regions should return regional aggregations with place counts and districts
✔ GET /api/places/coverage should return live coverage statistics across Tamil Nadu
✔ GET /api/places?region=Western+Tamil+Nadu should filter places by region
ℹ tests 16
ℹ pass 16
ℹ fail 0
```

---

## 🎓 External Examiner & Reviewer Evaluation Guide

During project viva and code walkthroughs, evaluate the following workflow steps:

1. **Home Page & Geolocation**:
   - Open `http://localhost:5173`.
   - Click **"Find Accessible Places Near Me"** to trigger GPS location discovery.
   - Click any Coimbatore area tag (e.g., `RS Puram` or `Peelamedu`) to explore local venues.

2. **Tri-Lingual Regional Support**:
   - Click the language selector in the top navigation bar to toggle between **English**, **தமிழ் (Tamil)**, and **हिंदी (Hindi)**. Observe complete UI translation.

3. **Map & Directory Views**:
   - Navigate to `/discover`.
   - Toggle between **List View**, **Interactive Map**, and **Split View**.
   - Hover over pins on the map to see real venue cards with distance and directions.

4. **Detailed Audit & Photo Attribution**:
   - Click any place (e.g., **PSG Hospitals** or **Brookefields Mall**).
   - View real photographs and photographic attribution pills.
   - Inspect the **Accessibility Facility Breakdown** displaying verified multi-status conditions and audit sources.

5. **Inaccuracy Reporting & Bookmarking**:
   - Click the bookmark icon to save the venue; visit `/saved` to verify the collection.
   - Click **"Report Inaccurate Info"** to submit a test report.

6. **Admin Dashboard**:
   - Sign in using `admin@accessable.org` / `Admin@123`.
   - Navigate to `/admin`.
   - Review the **Inaccuracy Reports Queue**, **Place Listings**, **Review Moderation**, and **Geospatial Provider Status**.

---

## 📜 Academic Disclaimer

AccessAble was developed as an academic project demonstrating full-stack engineering, geospatial information systems, and universal design. Field audit records reflect genuine public information and ground observations for Coimbatore and Tamil Nadu venues. Missing information is never treated as unavailable.
