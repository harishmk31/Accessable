# AccessAble – Accessibility Discovery Platform

**AccessAble** is a full-stack web application designed to help people with disabilities, caregivers, elderly citizens, and inclusive mobility advocates discover public places (hospitals, universities, restaurants, transit hubs, and government offices) based on audited accessibility infrastructure.

Built as an academic mini project for Full Stack Web Development, this platform implements a strict **3-State Facility Modeling Logic** (**Available**, **Unavailable**, and **Unknown**) to prevent misinformation and guarantee data integrity.

---

## 📑 Table of Contents

- [Key Features](#key-features)
- [Accessibility Compliance & 3-State Philosophy](#accessibility-compliance--3-state-philosophy)
- [Technology Stack](#technology-stack)
- [System Architecture & Folder Structure](#system-architecture--folder-structure)
- [Prerequisites](#prerequisites)
- [Installation & Quick Start](#installation--quick-start)
- [Environment Configuration](#environment-configuration)
- [Database Seeding & Demonstration Accounts](#database-seeding--demonstration-accounts)
- [Available Commands](#available-commands)
- [REST API Documentation](#rest-api-documentation)
- [Automated Testing](#automated-testing)
- [External Examiner & Project Review Guide](#external-examiner--project-review-guide)
- [Demonstration Data & Academic Disclaimer](#demonstration-data--academic-disclaimer)

---

## 🌟 Key Features

1. **Responsive Discovery & Interactive Directory**:
   - Live multi-keyword search across venue name, street address, city, state, and category.
   - Multi-faceted filtering by place category and individual accessibility features.
   - Dual rating display: General overall star rating and dedicated Accessibility Experience score.

2. **Strict 3-State Facility Tracking**:
   - Explicit modeling of six core facilities:
     1. **Wheelchair Ramps** (slope gradient, non-skid surface, grab rails)
     2. **Elevators / Lifts** (stretcher compatibility, door width, braille buttons, voice chime)
     3. **Accessible Restrooms** (door width, grab handles, roll-under basins)
     4. **Accessible Parking** (wide bays close to entrance, step-free tarmac)
     5. **Tactile Braille Signage** (braille door plates, tactile guiding floor tiles)
     6. **Assistive Audio Systems** (hearing loop induction, spoken bilingual announcements)
   - Every facility is strictly `Available`, `Unavailable`, or `Unknown`. Missing information is never treated as unavailable!

3. **User Authentication & Role-Based Access Control (RBAC)**:
   - Secure registration and login using **bcryptjs** (salted hashing) and **JSON Web Tokens (JWT)**.
   - Distinct roles: `user` (community member / student) and `admin` (moderator / compliance auditor).

4. **Venue Registration & Management**:
   - Community-driven venue registration with full address, category, contacts, and 3-state facility checklist.
   - Place editing and management permissions reserved for venue submitters or administrators.

5. **Community Reviews & Facility Verification**:
   - Authenticated users can leave reviews, star ratings, and confirm or dispute observed facilities.
   - Automated aggregation of average general rating and accessibility rating.

6. **Administrative Dashboard**:
   - Verification queue to approve, reject, or audit venue submissions.
   - Review moderation controls to hide or remove inappropriate comments.
   - Real-time accessibility facility counts and category breakdown analytics.

7. **Universal Design & WCAG 2.1 AA Standards**:
   - High-contrast visual palette with compliant text contrast ratios.
   - Skip to main content keyboard anchor (`Tab` on page load).
   - High-visibility keyboard focus rings (`outline: 3px solid #0d9488`).
   - Screen-reader friendly semantic tags and ARIA labels.

---

## ♿ Accessibility Compliance & 3-State Philosophy

In most public directories, missing accessibility information is falsely flagged as "unavailable", turning away visitors who could have accessed the venue.

AccessAble solves this with **3-State Logic**:
- 🟢 **Available**: Formally audited and confirmed to meet barrier-free standards.
- 🔴 **Unavailable**: Confirmed to have physical barriers (e.g., stairs-only entrance, non-compliant restroom).
- 🟡 **Unknown / Unverified**: Not yet audited. Informs the user to contact the venue ahead of visiting rather than assuming access is absent.

---

## 🛠 Technology Stack

### Frontend (`client/`)
- **React 18** (SPA architecture with Hooks and Context API)
- **Vite 5** (Fast ES module bundler and dev server)
- **Tailwind CSS 3** (Utility-first styling with accessible color contrast)
- **React Router DOM 6** (Declarative client routing)
- **Axios** (HTTP client with JWT interceptor and error normalization)
- **Lucide React** (Accessible SVG iconography)

### Backend (`server/`)
- **Node.js 22 & Express 4** (RESTful API architecture)
- **Mongoose 8** (Object Data Modeling for MongoDB)
- **JWT (jsonwebtoken)** (Stateless bearer token authorization)
- **bcryptjs** (Password hashing)
- **CORS & Morgan** (Cross-origin support and request logging)
- **Node.js Test Runner (`node:test`)** (Automated integration testing)

### Database
- **MongoDB** (Local instance or MongoDB Atlas cloud cluster)

---

## 📁 System Architecture & Folder Structure

```
AccessAble/
├── package.json              # Root scripts (concurrent dev runner, seed, test)
├── .gitignore                # Excludes node_modules, .env, and dist
├── README.md                 # Project documentation & presentation guide
│
├── server/                   # Backend Express Application
│   ├── .env.example          # Backend environment template
│   ├── .env                  # Local backend configuration
│   ├── package.json          # Server dependencies & test scripts
│   ├── server.js             # Express application entry point
│   ├── config/
│   │   └── db.js             # Mongoose connection handler
│   ├── models/
│   │   ├── User.js           # User schema & password hashing
│   │   ├── Place.js          # Place schema with 3-state facilities
│   │   └── Review.js         # Review schema with rating aggregation
│   ├── middleware/
│   │   ├── auth.js           # JWT verification & optionalAuth
│   │   ├── admin.js          # Role-based admin access guard
│   │   └── errorHandler.js   # Centralized error formatting
│   ├── controllers/
│   │   ├── authController.js   # Login, registration, profile
│   │   ├── placeController.js  # CRUD, filtering, verification, stats
│   │   └── reviewController.js # Add review, delete, moderation
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth endpoints
│   │   ├── placeRoutes.js    # /api/places endpoints
│   │   └── reviewRoutes.js   # /api/reviews endpoints
│   ├── seeds/
│   │   └── seedData.js       # Seed script with realistic demo data
│   └── tests/
│       └── api.test.js       # Node.js integration test suite
│
└── client/                   # Frontend React + Vite Application
    ├── .env.example          # Frontend environment template
    ├── .env                  # Local frontend configuration
    ├── package.json          # Frontend dependencies & build script
    ├── vite.config.js        # Vite config with backend API proxy
    ├── tailwind.config.js    # Accessible color tokens & layout rules
    ├── postcss.config.js     # PostCSS autoprefixer pipeline
    ├── index.html            # Semantic HTML entry point
    └── src/
        ├── main.jsx          # React DOM mounting
        ├── App.jsx           # Client router and layout shell
        ├── index.css         # Tailwind & keyboard focus indicators
        ├── context/
        │   └── AuthContext.jsx # Global user state & token storage
        ├── services/
        │   └── api.js        # Axios instance & API service functions
        ├── components/
        │   ├── Navbar.jsx    # Accessible header with role badge
        │   ├── Footer.jsx    # Accessible footer with project notes
        │   ├── FacilityBadge.jsx # 3-State badge with visual and text cues
        │   ├── PlaceCard.jsx # Venue card summary with facility chips
        │   ├── SearchBar.jsx # Accessible search with keyboard shortcuts
        │   ├── FilterDrawer.jsx # Faceted category and facility filter
        │   ├── StarRating.jsx   # Interactive & display star ratings
        │   ├── LoadingSpinner.jsx # ARIA live loading spinner
        │   ├── EmptyState.jsx     # Friendly empty results message
        │   └── AccessibilityStatementModal.jsx # WCAG guidelines modal
        └── pages/
            ├── HomePage.jsx          # Landing page with hero & quick jump
            ├── DiscoveryPage.jsx     # Full directory with filters
            ├── PlaceDetailsPage.jsx  # Detailed venue view & reviews
            ├── AddPlacePage.jsx      # Form to register a new venue
            ├── EditPlacePage.jsx     # Form to modify place & admin audit
            ├── LoginPage.jsx         # Sign in with 1-click demo buttons
            ├── RegisterPage.jsx      # Account creation form
            ├── AdminDashboardPage.jsx# Admin metrics, places & reviews
            └── NotFoundPage.jsx      # 404 page
```

---

## ⚙️ Prerequisites

Before running the application, ensure the following are installed:
1. **Node.js** (v18.x or v20.x / v22.x recommended)
2. **npm** (v9.x or v10.x)
3. **MongoDB** (Local MongoDB Community Server running on `localhost:27017` OR a free MongoDB Atlas connection URI).

---

## 🚀 Installation & Quick Start

### Step 1: Install Dependencies
Run the install command from the root folder:
```bash
npm run install:all
```
*(Or install inside both folders individually: `cd server && npm install && cd ../client && npm install`)*

### Step 2: Seed the Database
Populate the database with verified demonstration venues, test accounts, and reviews:
```bash
npm run seed
```

### Step 3: Run the Application
Start both the Express backend and React frontend concurrently:
```bash
npm run dev
```

The application will be live at:
- **Frontend (Vite UI)**: `http://localhost:5173`
- **Backend (Express API)**: `http://localhost:5000`

*(Alternatively, run them in separate terminals)*:
- Terminal 1: `npm run server` (starts backend on port 5000)
- Terminal 2: `npm run client` (starts frontend on port 5173)

---

## 🔑 Database Seeding & Demonstration Accounts

The seed script (`npm run seed`) populates verified demonstration records covering hospitals, colleges, cafes, transit stations, and public parks.

### Demonstration Accounts:
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@accessable.org` | `Admin@123456` | Verify / reject listings, moderate reviews, edit all places, access Admin Dashboard |
| **Student / Member** | `user@accessable.org` | `User@123456` | Browse venues, register places, leave reviews and ratings, edit own listings |
| **Researcher** | `priya@accessable.org` | `User@123456` | Community member profile with low-vision tactile audits |

> 💡 **Evaluation Tip**: On the **Sign In** page (`/login`), click the **"Fill Demo Admin"** or **"Fill Demo User"** button for instant one-click login during project review.

---

## 🌐 Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/accessable_db
JWT_SECRET=accessable_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=AccessAble - Accessibility Discovery Platform
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate user and receive JWT.
- `GET /api/auth/me` - Get profile for logged-in user *(Protected)*.
- `PUT /api/auth/profile` - Update profile bio and name *(Protected)*.

### Places (`/api/places`)
- `GET /api/places` - Query places with filtering & pagination:
  - `q`: Search keyword across name, address, description, city.
  - `category`: Filter by category (e.g., `Hospital`, `College/University`).
  - `wheelchairRamp`, `elevatorLift`, `accessibleToilet`, `accessibleParking`, `brailleSignage`, `audioAssistance`: Set to `Available`, `Unavailable`, or `Unknown`.
  - `minAccessibilityRating`: Filter by minimum score (e.g. `4`).
  - `sortBy`: `newest`, `accessibility_desc`, `rating_desc`, `name_asc`.
- `GET /api/places/:id` - Retrieve full place details with populated reviews.
- `POST /api/places` - Create a new venue listing *(Protected)*.
- `PUT /api/places/:id` - Update place listing *(Protected: Creator or Admin)*.
- `DELETE /api/places/:id` - Delete place listing and associated reviews *(Protected: Creator or Admin)*.
- `PATCH /api/places/:id/verify` - Update verification status (`pending`, `verified`, `rejected`) *(Admin Only)*.
- `GET /api/places/stats/overview` - Aggregate metrics for admin dashboard *(Admin Only)*.

### Reviews (`/api/reviews`)
- `GET /api/reviews/place/:placeId` - Fetch all approved reviews for a place.
- `POST /api/reviews/place/:placeId` - Submit an accessibility review and recalculate place ratings *(Protected)*.
- `DELETE /api/reviews/:id` - Delete a review *(Protected: Author or Admin)*.
- `GET /api/reviews/admin/all` - List all reviews across the platform *(Admin Only)*.
- `PATCH /api/reviews/:id/moderate` - Toggle review visibility *(Admin Only)*.

---

## 🧪 Automated Testing

Automated integration tests are implemented using the native Node.js Test Runner (`node:test`).

To run the backend test suite:
```bash
npm test
```
The automated test verifies:
- API health check (`GET /api/health`)
- User registration and token issuance (`POST /api/auth/register`)
- User authentication and role assignment (`POST /api/auth/login`)
- Place creation with 3-state facility modeling (`POST /api/places`)
- Multi-faceted category & facility filtering (`GET /api/places?category=Hospital&wheelchairRamp=Available`)
- Review submission and automatic rating recalculation (`POST /api/reviews/place/:id`)
- Role authorization security guards (`GET /api/places/stats/overview` forbids standard users with `403` and admits admins with `200`).

To test the frontend production build:
```bash
npm run build
```

---

## 🎓 External Examiner & Project Review Guide

For a live demonstration in front of an external project examiner:

1. **Start the platform**:
   ```bash
   npm run seed
   npm run dev
   ```
2. **Open the browser at `http://localhost:5173`**:
   - Showcase the **Homepage** with hero search, metric counters, and the **3-State Truth Philosophy section**.
   - Press the `Tab` key on page load to display the **Skip to main content** accessibility link.
   - Click **"Accessibility Guide"** in the header to display the WCAG compliance modal and keyboard navigation instructions.
3. **Explore the Discovery Directory (`/discover`)**:
   - Filter by **"Hospital"** and select **"Wheelchair Ramp: Available"**.
   - Show how the count updates dynamically.
   - Show the 3-state badges on each card (`Available` in green, `Unavailable` in red, `Unknown` in amber).
4. **Inspect Venue Details (`/places/:id`)**:
   - View detailed facility audit notes (e.g. ramp gradient 1:12, elevator floor chime, braille door signs).
   - Click **"Get Directions"** to demonstrate integration with Google Maps.
5. **Demonstrate Community Review Submission**:
   - Click **"Sign In to Leave a Review"** and use the **"Fill Demo User"** shortcut button.
   - Post a review with both an overall score and an accessibility score.
   - Observe how the venue's average ratings automatically recalculate.
6. **Demonstrate Administrator Powers**:
   - Log out and click **"Sign In"** -> click **"Fill Demo Admin"**.
   - Notice the purple **Admin Dashboard** navigation link appearing in the header.
   - Navigate to `/admin`:
     - Show the **Metrics Overview** (Total places, Verified, Pending, Review count).
     - Show the **Verification Queue** and change a venue's status between verified and rejected.
     - Show the **Review Moderation** tab to approve or hide comments.
     - Show the **Accessibility Facility Analytics** breakdown.

---

## ⚠️ Demonstration Data & Academic Disclaimer

All records seeded in this project are identified demonstration items created for software engineering evaluation. In production environments, accessibility data should be collected through certified municipal accessibility audits or verified crowdsourced submissions with photo evidence.
Missing data in this system is deliberately marked as `Unknown` rather than `Unavailable`.
