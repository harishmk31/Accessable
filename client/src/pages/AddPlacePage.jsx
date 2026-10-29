import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Accessibility,
  ArrowUpDown,
  Car,
  Binary,
  Volume2,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Hospital',
  'College/University',
  'Restaurant/Cafe',
  'Office/Government',
  'Transit/Station',
  'Shopping/Mall',
  'Parks & Gardens',
  'Tourist Attraction',
  'Other'
];

const FACILITY_DEFINITIONS = [
  {
    key: 'wheelchairRamp',
    label: 'Wheelchair Ramp',
    description: 'Ramped entrance with gentle incline (e.g., 1:12 slope), handrails, and non-slip surface.'
  },
  {
    key: 'elevatorLift',
    label: 'Elevator / Lift',
    description: 'Elevator connecting multi-level floors with wide doors and accessible buttons.'
  },
  {
    key: 'accessibleToilet',
    label: 'Accessible Restroom',
    description: 'Spacious stall with grab rails, wide doorway (32+ inches), and roll-in basin.'
  },
  {
    key: 'accessibleParking',
    label: 'Accessible Parking',
    description: 'Designated wide disabled parking bays close to barrier-free entrances.'
  },
  {
    key: 'brailleSignage',
    label: 'Braille Signage & Tactile Paving',
    description: 'Tactile maps, floor paving guidance, or braille room nameplates.'
  },
  {
    key: 'audioAssistance',
    label: 'Audio Assistance & Hearing Loops',
    description: 'Induction audio loops, spoken announcements, or assistive audio receivers.'
  }
];

const AddPlacePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Hospital',
    description: '',
    address: '',
    locality: '',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '',
    latitude: '',
    longitude: '',
    contactNumber: '',
    website: '',
    image: '',
    facilities: {
      wheelchairRamp: 'Unknown',
      elevatorLift: 'Unknown',
      accessibleToilet: 'Unknown',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    facilityNotes: {
      wheelchairRamp: '',
      elevatorLift: '',
      accessibleToilet: '',
      accessibleParking: '',
      brailleSignage: '',
      audioAssistance: ''
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
        <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-600 mb-6">
          You must be logged in to register a new public place listing and document its accessibility.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Log In Now
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityStatus = (facilityKey, status) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facilityKey]: status
      }
    }));
  };

  const handleFacilityNote = (facilityKey, note) => {
    setFormData((prev) => ({
      ...prev,
      facilityNotes: {
        ...prev.facilityNotes,
        [facilityKey]: note
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      setError('Please provide place name, description, address, city, and state.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        address: formData.address.trim(),
        locality: formData.locality.trim(),
        city: formData.city.trim(),
        district: formData.district.trim() || formData.city.trim(),
        state: formData.state.trim() || 'Tamil Nadu',
        postalCode: formData.postalCode.trim(),
        contactNumber: formData.contactNumber.trim(),
        website: formData.website.trim(),
        facilities: formData.facilities,
        facilityNotes: formData.facilityNotes,
        images: formData.image ? [formData.image.trim()] : []
      };

      if (formData.latitude && formData.longitude) {
        payload.coordinates = {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude)
        };
      }

      const res = await placeService.createPlace(payload);
      const newPlace = res.data.data;
      navigate(`/places/${newPlace._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit place listing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="border-b border-slate-100 pb-6 mb-8">
          <div className="flex items-center gap-2.5 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>Community Accessibility Contribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register a Public Place
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Document accessibility features accurately. Never guess: if you are unsure about a facility, select <strong>Unknown</strong>.
          </p>
        </div>

        {error && (
          <div
            className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information Section */}
          <section className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Basic Place Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Place Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Memorial Multi-Specialty Hospital"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description & Overview *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the venue, general layout, public purpose, and key accessibility highlights..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </section>

          {/* Location Details */}
          <section className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Address & Location
            </h2>

            <div>
              <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Street Address *
              </label>
              <input
                id="address"
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 45 Health Avenue, Medical District"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="locality" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Area / Locality
                </label>
                <input
                  id="locality"
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="e.g. RS Puram, Gandhipuram, Peelamedu"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  District *
                </label>
                <input
                  id="district"
                  type="text"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Coimbatore, Chennai, Madurai"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Coimbatore"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  State / Region *
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 641018"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  GPS Latitude (Optional)
                </label>
                <input
                  id="latitude"
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 11.0168"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  GPS Longitude (Optional)
                </label>
                <input
                  id="longitude"
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 76.9558"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="contactNumber" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 234-5678"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Website URL
                </label>
                <input
                  id="website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.org"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Image URL
                </label>
                <input
                  id="image"
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* 3-State Accessibility Facilities Audit Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                3. Accessibility Facilities Audit (3-State Logic)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                For each facility, choose Available, Unavailable, or Unknown. Specify details (e.g. ramp slope, braille location) in the notes field.
              </p>
            </div>

            <div className="space-y-6">
              {FACILITY_DEFINITIONS.map(({ key, label, description }) => {
                const currentStatus = formData.facilities[key];

                return (
                  <div
                    key={key}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{label}</span>
                      <p className="text-xs text-slate-500">{description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { val: 'Available', color: 'bg-emerald-700 text-white font-bold' },
                        { val: 'Unavailable', color: 'bg-rose-700 text-white font-bold' },
                        { val: 'Unknown', color: 'bg-amber-700 text-white font-bold' }
                      ].map(({ val, color }) => {
                        const isSelected = currentStatus === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleFacilityStatus(key, val)}
                            className={`py-2 px-3 rounded-xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                              isSelected
                                ? `${color} shadow-xs border-transparent`
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                            aria-pressed={isSelected}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label htmlFor={`note-${key}`} className="sr-only">
                        Notes for {label}
                      </label>
                      <input
                        id={`note-${key}`}
                        type="text"
                        value={formData.facilityNotes[key]}
                        onChange={(e) => handleFacilityNote(key, e.target.value)}
                        placeholder={`Details for ${label} (e.g., location, slope, dimensions, condition)...`}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              to="/discover"
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              {submitting ? 'Submitting Place...' : 'Submit Place Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlacePage;
