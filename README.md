# AccessAble — Accessibility Discovery Platform (Tamil Nadu)

**AccessAble** is an open full-stack web application designed to help persons with disabilities, elderly citizens, caregivers, and mobility advocates discover accessible public venues across **Coimbatore and Tamil Nadu, India**.

Developed for academic evaluation as a Full Stack Web Development Mini Project, the platform focuses on verifiable accessibility infrastructure (wheelchair ramps, step-free access, elevators, accessible restrooms, reserved parking, and audio/tactile signage) with transparent scoring and zero assumptions.

---

## 🎓 College Evaluation Rubric Alignment (100 Marks Total)

| Evaluation Component | Marks | Implementation in AccessAble |
| :--- | :---: | :--- |
| **1. Problem & Requirements** | **10** | Solves lack of truthful accessibility data for PwD in Tamil Nadu; addresses misleading binary assumptions by treating *Unknown* as distinct from *Unavailable*. |
| **2. React Frontend** | **20** | Responsive SPA built with React 18, Vite, React Router 6, Tailwind CSS, Lucide icons, and interactive Leaflet maps. Mobile-first design (360px to 1440px). |
| **3. Backend APIs** | **20** | RESTful Node.js + Express API with JWT authentication, role-based authorization (User vs Admin), input validation, geospatial queries, and centralized error handling. |
| **4. MongoDB Connectivity** | **15** | Mongoose ORM models (`Place`, `User`, `Review`, `Report`), Geospatial `2dsphere` indexes, text search indexes, aggregation pipelines, and pre-save hooks. |
| **5. Full-Stack Integration** | **20** | End-to-end integration: place submission with pending moderation, live review submission with rating recalculations, bookmarking, and inaccuracy reporting. |
| **6. Deployment & Documentation** | **5** | Production Vite build, configurable environment variables (`.env.example`), test database isolation guards, and deployment readiness guide. |
| **7. Demo & Viva** | **10** | Structured viva talking points, architecture walkthrough, scoring formula derivations, and step-by-step examiner demonstration script. |

---

## 📌 Problem Statement & Core Objectives

### The Problem
Most public map and venue discovery platforms either:
1. Ignore accessibility infrastructure entirely.
2. Rely on a single binary checkbox ("Wheelchair Accessible: Yes/No") without specifying entrance ramps, interior elevators, or accessible restrooms.
3. Treat unrecorded facilities as "Unavailable", giving unfair zero scores to places simply missing data.

### Project Objectives
- **Accurate Discovery**: Allow users to filter public places in Tamil Nadu by specific physical accessibility facilities.
- **Evidentiary Integrity**: Distinctly model `Available`, `Unavailable`, and `Unknown` states. Never assume missing data means a venue is inaccessible.
- **Fair Scoring**: Calculate accessibility scores dynamically using standard architectural weights, strictly excluding `Unknown` facilities from the denominator.
- **Community Participation**: Allow authenticated users to submit new places (held in `pending` status until admin review), post reviews, and report inaccuracies.
- **Demonstration Honesty**: Clearly label sample/demonstration records so they do not distort genuine community statistics.

---

## 📐 Accessibility Readiness Formula

The platform assesses six core physical accessibility facilities with weights totaling 100:

| Facility Domain | Weight | Description |
| :--- | :---: | :--- |
| **Wheelchair Ramp / Step-Free Access** | **25** | Sloped ramp (1:12 slope) or flush step-free entrance for wheeled mobility |
| **Elevator / Lift** | **20** | Working elevator with wide doors and accessible call buttons |
| **Accessible Restroom** | **20** | Wide-entry stall with grab bars and wheelchair turning space |
| **Disability-Reserved Parking** | **15** | Designated wide parking stall near entrance with clear access aisle |
| **Tactile & Braille Signage** | **10** | Tactile floor paving and Braille room/directional signage |
| **Audio Assistance** | **10** | Visual announcements paired with audible alerts or guided assistance |
| **Total Weight** | **100** | Standard Architectural Readiness Baseline |

### Mathematical Formula
$$\text{Score} = \text{round}\left( \frac{\sum \text{Weights of Confirmed Available Facilities}}{\sum \text{Weights of Assessed Facilities (Available + Unavailable)}} \times 100 \right)$$

### Rules:
1. **Unknown Facilities are Excluded**: An unrecorded facility adds 0 points to the numerator and 0 points to the denominator. It is never treated as a barrier.
2. **Minimum 2 Confirmed Facilities Required**: If fewer than 2 facilities have been audited, the place is assigned:
   - `accessibilityScore = null` (never a misleading numeric 0)
   - `accessibilityTier = 'Insufficient Data'`
   - Frontend displays: `"Score unavailable"` / `"Insufficient data"`
3. **Accessibility Tiers**:
   - **High Accessibility (70–100)**: Multiple verified physical accessibility features.
   - **Moderate Accessibility (40–69)**: Core entrance accessibility available with some gaps.
   - **Limited Accessibility (0–39)**: Significant confirmed architectural barriers present (including 0 when all assessed facilities are confirmed unavailable).
   - **Insufficient Data**: Fewer than 2 facilities confirmed (`accessibilityScore = null`).

---

## 🏗 System Architecture

```
                      +---------------------------------------+
                      |             Web Browser               |
                      |   React 18 + Vite SPA (Port 5173)     |
                      +-------------------+-------------------+
                                          |
                                          | HTTP / REST (JSON)
                                          | Bearer JWT Authorization
                                          v
                      +-------------------+-------------------+
                      |         Node.js / Express Server      |
                      |          (Port 5000 / Production)     |
                      +-------------------+-------------------+
                                          |
                 +------------------------+------------------------+
                 |                        |                        |
                 v                        v                        v
        +-----------------+      +-----------------+      +-----------------+
        | PlaceController |      | AuthController  |      | ReviewController|
        | - /api/places   |      | - /api/auth     |      | - /api/reviews  |
        | - /api/places/map      | - JWT validation|      | - Moderation    |
        +--------+--------+      +--------+--------+      +--------+--------+
                 |                        |                        |
                 +------------------------+------------------------+
                                          |
                                          v  Mongoose ODM (2dsphere + Text Index)
                      +-------------------+-------------------+
                      |               MongoDB                 |
                      |   accessable_db (Production / Real)   |
                      |   accessable_test (Isolated Testing)  |
                      +---------------------------------------+
```

---

## 🗄 MongoDB Collections & Schemas

1. **`places` Collection**:
   - `name`, `slug`, `category` (Hospital, Transit, College, Park, Shopping, Heritage, Restaurant, Office).
   - `address`, `locality`, `city`, `district`, `region` (Western, Northern, Central, Southern Tamil Nadu).
   - `location`: GeoJSON Point `[longitude, latitude]` with `2dsphere` spatial index.
   - `coordinates`: `{ lat, lng }` strictly validated within Tamil Nadu bounds (`8.0–13.6° N, 76.0–80.6° E`).
   - `facilities`: `{ wheelchairRamp, elevatorLift, accessibleToilet, accessibleParking, brailleSignage, audioAssistance }` (enum: `'Available'`, `'Unavailable'`, `'Unknown'`).
   - `accessibilityScore` (0–100) and `accessibilityTier`.
   - `status`: `'pending'` (awaiting admin review), `'verified'` (publicly discoverable), `'rejected'`.
   - `isSampleData`: Boolean flag to distinguish initial demonstration venues from live records.

2. **`reviews` Collection**:
   - `place`: ObjectId referencing `places`.
   - `user`: ObjectId referencing `users`.
   - `rating` (1–5) and `accessibilityRating` (1–5).
   - `comment`: String (min 5 chars).
   - `facilityFeedback`: User observations on specific features.
   - `isModerated`: Boolean.
   - Compound unique index on `{ place: 1, user: 1 }` prevents duplicate reviews.
   - Post-save and post-delete hooks recompute `averageRating`, `averageAccessibilityRating`, and `totalReviews` on the place.

3. **`users` Collection**:
   - `name`, `email` (unique, lowercase), `password` (bcrypt hash with 10 salt rounds).
   - `role`: `'user'` (default) or `'admin'`.
   - `savedPlaces`: Array of ObjectIds referencing bookmarked `places`.

4. **`reports` Collection**:
   - `place`: ObjectId referencing `places`.
   - `issueCategory`, `description`, `evidence`, `status` (`'pending'`, `'investigating'`, `'resolved'`, `'dismissed'`).

---

## 📡 REST API Route Summary

### Authentication (`/api/auth`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register user account (always defaults to `role: 'user'`) |
| `POST` | `/login` | Public | Authenticate user credentials and return signed JWT |
| `GET` | `/me` | Private | Retrieve logged-in user profile |
| `PUT` | `/profile` | Private | Update user name and bio |
| `POST` | `/save-place/:id` | Private | Toggle venue bookmark |
| `GET` | `/saved-places` | Private | Retrieve user's bookmarked places |

### Places (`/api/places`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | List verified places with category, district, score, and text filters |
| `GET` | `/map` | Public | Retrieve verified places with valid Tamil Nadu coordinates for map markers |
| `GET` | `/nearby` | Public | Geospatial radius search using `$geoWithin` center-sphere |
| `GET` | `/search` | Public | Keyword search across name, address, locality, and city |
| `GET` | `/categories` | Public | Aggregate category counts for verified venues |
| `GET` | `/districts` | Public | List districts and localities with verified venue counts |
| `GET` | `/regions` | Public | Regional aggregations across Tamil Nadu zones |
| `GET` | `/coverage` | Public | Statewide coverage metrics |
| `GET` | `/:id` | Public* | Retrieve venue details (*pending places accessible only to creator or admin) |
| `POST` | `/` | Private | Submit a new place (defaults to `status: 'pending'` for users) |
| `PUT` | `/:id` | Private | Edit place details (creator or admin) |
| `DELETE` | `/:id` | Private | Remove place (creator or admin) |
| `PATCH/PUT`| `/:id/verify` | Admin | Approve or reject place submission (`verified` or `rejected`) |
| `GET` | `/stats/overview` | Admin | Administrative metrics (total, verified, pending, reports) |
| `POST` | `/:id/reports` | Public | Submit inaccuracy report for a venue |
| `GET` | `/admin/reports` | Admin | Review pending inaccuracy reports |
| `PATCH` | `/admin/reports/:id`| Admin | Update report status (`investigating`, `resolved`, `dismissed`) |

### Reviews (`/api/reviews`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/recent` | Public | Paginated recent community reviews with total count |
| `GET` | `/place/:placeId` | Public | All moderated reviews for a specific venue |
| `POST` | `/place/:placeId` | Private | Submit or update venue review (recalculates venue ratings) |
| `DELETE` | `/:id` | Private | Delete review (author or admin only; recalculates averages) |
| `GET` | `/admin/all` | Admin | Review moderation list |
| `PATCH` | `/:id/moderate` | Admin | Toggle moderation status |

---

## 🔒 Security & Database Isolation Guards

To guarantee academic evaluation safety:
1. **Role Escalation Protection**: `POST /api/auth/register` strictly sets `role: 'user'` and ignores any role payload injection. Admin accounts cannot be self-created via API.
2. **Strict Test Database Isolation**: Every test file validates the resolved database name against an explicit allowlist. If the resolved URI path contains `accessable_db` or lacks `test`, execution aborts immediately before connecting:
   ```javascript
   const targetDbName = extractDatabaseName(process.env.MONGODB_URI);
   if (!targetDbName.toLowerCase().includes('test') || targetDbName === 'accessable_db') {
     throw new Error('[SECURITY GUARD] Test suite aborted: Resolved database name is not an isolated test target.');
   }
   ```
3. **No Secret Leaks**: Test URI parsing never outputs credentials, passwords, or connection tokens to stdout or logs.
4. **Pending Submission Quarantine**: Submissions created by normal users default to `status: 'pending'`. They are strictly excluded from public queries, search, nearby, category aggregates, and maps.

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Community Server running locally on `127.0.0.1:27017`

### Step 1: Clone or Navigate to Project
```powershell
cd E:\AccessAble
```

### Step 2: Configure Environment Variables
Copy example files to `.env` (default settings connect to local MongoDB):
```powershell
# Server configuration
Copy-Item server\.env.example server\.env

# Client configuration
Copy-Item client\.env.example client\.env
```

### Step 3: Install Dependencies
```powershell
# Install server dependencies
cd E:\AccessAble\server
npm install

# Install client dependencies
cd E:\AccessAble\client
npm install
```

### Step 4: Run the Application
In **Terminal 1** (Start Backend):
```powershell
cd E:\AccessAble\server
npm run dev
# Server listening on http://localhost:5000
```

In **Terminal 2** (Start Frontend):
```powershell
cd E:\AccessAble\client
npm run dev
# Vite client running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

AccessAble includes a comprehensive Node.js native test runner suite (`node --test`) covering:
- **Scoring Formula Suite**: All Unknown, All Available, All Unavailable, Mixed States with Unknown Exclusions, and Partial Evidence (< 2 facilities).
- **Security & Authorization Suite**: Role escalation rejection, 403 on unauthorized verification, 401 on unauthenticated admin endpoints.
- **Geospatial & Discovery Suite**: Tamil Nadu boundary validation, nearby radius discovery, category aggregation.
- **Review Recalculation Suite**: Real-time aggregation post-save and post-delete.

### Run Test Suite Safely (Targets `accessable_test`):
```powershell
npm test --prefix server
```
Expected output:
```
✔ Scoring Formula: All six facilities Unknown results in Insufficient Data (0/100)
✔ Scoring Formula: All six facilities Available results in High Accessibility (100/100)
✔ Scoring Formula: All six facilities Unavailable results in Limited Accessibility (0/100)
✔ Scoring Formula: Mixture of Available, Unavailable, and Unknown excludes Unknown from denominator
✔ Scoring Formula: Partial evidence (< 2 confirmed facilities) defaults to Insufficient Data (0/100)
✔ Security Guard: POST /api/auth/register prevents self-assigned admin role
✔ Security Guard: Non-admin users are rejected from admin place verification with 403
✔ POST /api/places should create a place with accessibility facilities
✔ POST /api/reviews/place/:id should add a review and update ratings
ℹ pass 39
ℹ fail 0
```

### Run Production Frontend Build:
```powershell
npm run build --prefix client
```

---

## 🎤 Demonstration Script & Viva Talking Points

When presenting this project to an examiner, demonstrate the features in this order:

### 1. The Core Differentiator: Transparent Scoring Formula
- **Action**: Navigate to any venue card or details page and click the Accessibility Score Badge (e.g. `85/100 (5/6 confirmed)`).
- **Viva Point**: *"Unlike commercial maps that use subjective user ratings or binary yes/no flags, AccessAble uses an architectural facility formula where weights sum to 100. Unknown facilities are mathematically excluded from the denominator rather than assumed unavailable. If a place has fewer than 2 confirmed facilities, we assign 'Insufficient Data' rather than a misleading zero."*

### 2. Map Truthfulness & Coordinate Validation
- **Action**: Open the Dedicated Map (`/map`) or the Map View on Discover (`/discover`).
- **Viva Point**: *"The map dynamically queries the database and displays only places with confirmed coordinates within Tamil Nadu bounds (lat 8.0 to 13.6, lng 76.0 to 80.6). The count is truthful and derived from real query results (e.g. '99 of 107 eligible places have map locations in Tamil Nadu')."*

### 3. Place Submission & Admin Moderation Workflow
- **Action**: Log in as a regular user, submit a new place at `/add-place`.
- **Observation**: Show that the venue is created with `status: 'pending'`. The submitter sees `"Awaiting Administrative Review"`, but the venue does NOT appear in public discovery, search, or map markers.
- **Action**: Log in as admin, navigate to `/admin`, approve the venue, and verify it now appears publicly.
- **Viva Point**: *"This guarantees crowd-sourced contributions are vetted before public display, preventing spam and inaccurate accessibility claims."*

### 4. Review Ratings & MongoDB Recalculations
- **Action**: Submit a review on a place with 5-star accessibility rating.
- **Viva Point**: *"The Review model uses Mongoose post-save and post-delete aggregation hooks. When a review is posted or removed, MongoDB executes an aggregation pipeline on that placeId to recalculate the exact averageRating and averageAccessibilityRating in real time."*

### 5. Computer Vision & AI Transparency
- **Action**: Open the photo scanner modal on a venue.
- **Viva Point**: *"Our vision service analyzes photographic evidence for ramps and handrails using Google Gemini Vision (with an offline architectural heuristic fallback). Crucially, visual analysis is treated as advisory and provisional—it never automatically mutates verified MongoDB records, because legal accessibility compliance (e.g. ramp slope of 1:12 or 800mm door width) cannot be certified from a 2D photograph alone."*

---

## 📋 Technology Stack Summary

- **Frontend**: React 18, Vite, React Router DOM 6, Tailwind CSS, Leaflet, React-Leaflet, Lucide React.
- **Backend**: Node.js, Express 4, JSON Web Token (JWT), bcryptjs, Multer.
- **Database**: MongoDB, Mongoose 8 (2dsphere geospatial indexing, compound indexes, aggregation pipelines).
- **Testing**: Node.js Native Test Runner (`node --test`), `node:assert/strict`.
- **Maps**: Leaflet + OpenStreetMap Carto tiles (100% free, zero external API keys required).

---

## 👥 Evaluation Team & Academic Context

- **Project Title**: AccessAble — Real-World Accessibility Discovery Platform
- **Geographic Focus**: Coimbatore & Tamil Nadu, India
- **Course**: Full Stack Web Development (Mini Project)
- **Year**: 2026
