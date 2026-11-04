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
  Lock,
  Camera,
  Upload,
  Loader2,
  ShieldAlert,
  MapPin,
  Sparkles
} from 'lucide-react';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CoordinatePickerMap from '../components/CoordinatePickerMap';

const CATEGORIES = [
  'Hospital',
  'College/University',
  'Restaurant/Cafe',
  'Office/Government',
  'Transit/Station',
  'Shopping/Mall',
  'Parks & Gardens',
  'Tourist Attractions & Monuments',
  'Temples & Cultural Venues',
  'Beaches & Waterfronts',
  'Hotels & Accommodation',
  'Libraries & Community Facilities',
  'Public Restrooms & Facilities',
  'Other'
];

const FACILITY_DEFINITIONS = [
  {
    key: 'wheelchairRamp',
    label: 'Wheelchair Ramp',
    description: 'Ramped entrance with gentle incline (e.g. 1:12 slope), handrails, and non-slip surface.'
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
  },
  {
    key: 'stepFreeEntrance',
    label: 'Step-Free Entrance & Doorways',
    description: 'Threshold less than 15mm bevel, wide automatic or push-button entry doors.'
  },
  {
    key: 'seatingRestArea',
    label: 'Rest Areas & Accessible Seating',
    description: 'Seating benches with backrests and armrests for visitors with mobility exhaustion.'
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
    latitude: 11.0168,
    longitude: 76.9558,
    contactNumber: '',
    website: '',
    image: '',
    facilities: {
      wheelchairRamp: 'Unknown',
      elevatorLift: 'Unknown',
      accessibleToilet: 'Unknown',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown',
      stepFreeEntrance: 'Unknown',
      seatingRestArea: 'Unknown'
    },
    facilityNotes: {
      wheelchairRamp: '',
      elevatorLift: '',
      accessibleToilet: '',
      accessibleParking: '',
      brailleSignage: '',
      audioAssistance: '',
      stepFreeEntrance: '',
      seatingRestArea: ''
    }
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center">
        <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
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

  // Check duplicate place name within the city
  const checkDuplicateName = async () => {
    if (!formData.name.trim() || !formData.city.trim()) return;
    setCheckingDuplicate(true);
    try {
      const res = await placeService.checkDuplicate(formData.name.trim(), formData.city.trim());
      if (res.data?.isDuplicate) {
        setDuplicateWarning(res.data.existingPlace);
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.warn('Duplicate check error:', err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Genuine photo file upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    try {
      const uploadData = new FormData();
      uploadData.append('photo', file);
      uploadData.append('caption', formData.name ? `${formData.name} Entrance` : 'Place Photograph');
      uploadData.append('attribution', user.name || 'AccessAble Contributor');

      const res = await placeService.uploadPhoto(uploadData);
      if (res.data?.success) {
        const photoInfo = res.data.data;
        setPhotoPreview(photoInfo.url);
        setFormData((prev) => ({
          ...prev,
          image: photoInfo.url,
          photos: [
            {
              url: photoInfo.url,
              caption: photoInfo.caption,
              attribution: photoInfo.attribution,
              isVerified: true
            }
          ]
        }));
      }
    } catch (err) {
      setError('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
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
        images: formData.image ? [formData.image.trim()] : [],
        photos: formData.photos || (formData.image ? [{ url: formData.image, caption: formData.name, attribution: user.name }] : [])
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
      setError(err.message || 'Error listing place. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Register a Public Place Listing
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Contribute genuine accessibility information for hospitals, campuses, stations, and public spaces in Coimbatore and throughout Tamil Nadu.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information Section */}
          <section className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Basic Place Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Place Name *
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={checkDuplicateName}
                    placeholder="e.g. PSG Institute of Medical Sciences"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                  {checkingDuplicate && (
                    <div className="absolute right-3 top-3.5">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Duplicate warning */}
                {duplicateWarning && (
                  <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Duplicate Alert:</strong> A venue named "{duplicateWarning.name}" already exists in {duplicateWarning.city} ({duplicateWarning.address}). Please verify before submitting.
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
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
              <label htmlFor="description" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Description & Overview *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the venue, general layout, public purpose, entrance accessibility highlights..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </section>

          {/* Location & Map Section */}
          <section className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              2. Address & Location Coordinates
            </h2>

            <div>
              <label htmlFor="address" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Street Address *
              </label>
              <input
                id="address"
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Post Box No. 1674, Avanashi Road"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="locality" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Area / Locality
                </label>
                <input
                  id="locality"
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="e.g. Peelamedu, RS Puram, Gandhipuram"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
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
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={checkDuplicateName}
                  placeholder="e.g. Coimbatore"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 641004"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Interactive Coordinate Picker Map */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Interactive Location Coordinate Picker
              </label>
              <CoordinatePickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(lat, lng) =>
                  setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                }
              />
            </div>
          </section>

          {/* Genuine Photography Upload Section */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              3. Authentic Place Photography
            </h2>
            <p className="text-xs text-slate-500">
              Attach genuine photographs showing entrances, ramps, or restrooms. Stock photos are prohibited.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 dark:bg-slate-800/40 text-center">
                  {uploadingPhoto ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      <span className="text-xs font-medium text-slate-600">Uploading photo...</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-teal-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Upload Photo from Device
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        JPEG, PNG, WEBP (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </label>
              </div>

              {photoPreview ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 relative h-36 flex items-center justify-center">
                  <img src={photoPreview} alt="Uploaded venue preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded backdrop-blur-sm">
                    Verified Upload
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50">
                  Or enter photo URL:
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.org/photo.jpg"
                    className="w-full mt-2 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Accessibility Facilities Audit Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Multi-Domain Accessibility Facilities Audit
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent 3-state categorization: Available, Unavailable, or Unknown. Document specific measurements (e.g. ramp slope, door width) in the notes.
              </p>
            </div>

            <div className="space-y-5">
              {FACILITY_DEFINITIONS.map(({ key, label, description }) => {
                const currentStatus = formData.facilities[key] || 'Unknown';

                return (
                  <div
                    key={key}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">{label}</span>
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
                            className={`py-2 px-3 rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                              isSelected
                                ? `${color} shadow-xs border-transparent`
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                            aria-pressed={isSelected}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.facilityNotes[key] || ''}
                        onChange={(e) => handleFacilityNote(key, e.target.value)}
                        placeholder={`Audit details for ${label} (e.g., slope gradient, door width, floor location)...`}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <Link
              to="/discover"
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
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
