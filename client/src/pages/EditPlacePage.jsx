import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, AlertCircle, ShieldAlert, ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import CoordinatePickerMap from '../components/CoordinatePickerMap';

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
  { key: 'wheelchairRamp', label: 'Wheelchair Ramp' },
  { key: 'elevatorLift', label: 'Elevator / Lift' },
  { key: 'accessibleToilet', label: 'Accessible Restroom' },
  { key: 'accessibleParking', label: 'Accessible Parking' },
  { key: 'brailleSignage', label: 'Braille Signage & Tactile Paving' },
  { key: 'audioAssistance', label: 'Audio Assistance & Hearing Loops' }
];

const EditPlacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        const res = await placeService.getPlaceById(id);
        const p = res.data.data;

        // Check if user is owner or admin
        const isOwner = user && p.createdBy && (user.id === p.createdBy._id || user._id === p.createdBy._id);
        if (!isOwner && !isAdmin) {
          setError('You are not authorized to edit this listing.');
          setLoading(false);
          return;
        }

        const lat = p.coordinates?.lat || p.location?.coordinates?.[1] || '';
        const lng = p.coordinates?.lng || p.location?.coordinates?.[0] || '';

        setFormData({
          name: p.name || '',
          category: p.category || 'Hospital',
          description: p.description || '',
          address: p.address || '',
          locality: p.locality || '',
          district: p.district || p.city || 'Coimbatore',
          city: p.city || '',
          state: p.state || 'Tamil Nadu',
          postalCode: p.postalCode || '',
          latitude: lat ? lat.toString() : '',
          longitude: lng ? lng.toString() : '',
          contactNumber: p.contactNumber || '',
          website: p.website || '',
          image: p.photos && p.photos.length > 0 ? p.photos[0].url : p.images && p.images.length > 0 ? p.images[0] : '',
          status: p.status || 'verified',
          verificationNote: p.verificationNote || '',
          facilities: {
            wheelchairRamp: p.facilities?.wheelchairRamp || 'Unknown',
            elevatorLift: p.facilities?.elevatorLift || 'Unknown',
            accessibleToilet: p.facilities?.accessibleToilet || 'Unknown',
            accessibleParking: p.facilities?.accessibleParking || 'Unknown',
            brailleSignage: p.facilities?.brailleSignage || 'Unknown',
            audioAssistance: p.facilities?.audioAssistance || 'Unknown'
          },
          facilityNotes: {
            wheelchairRamp: p.facilityNotes?.wheelchairRamp || '',
            elevatorLift: p.facilityNotes?.elevatorLift || '',
            accessibleToilet: p.facilityNotes?.accessibleToilet || '',
            accessibleParking: p.facilityNotes?.accessibleParking || '',
            brailleSignage: p.facilityNotes?.brailleSignage || '',
            audioAssistance: p.facilityNotes?.audioAssistance || ''
          }
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch place details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id, user, isAdmin]);

  if (loading) {
    return <LoadingSpinner message="Loading place information for editing..." />;
  }

  if (error || !formData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'Unable to edit place.'}</p>
        <Link
          to={`/places/${id}`}
          className="px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Place Details
        </Link>
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

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        address: formData.address.trim(),
        locality: formData.locality.trim(),
        district: formData.district.trim() || formData.city.trim(),
        city: formData.city.trim(),
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

      if (isAdmin) {
        payload.status = formData.status;
        payload.verificationNote = formData.verificationNote.trim();
      }

      await placeService.updatePlace(id, payload);
      navigate(`/places/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update place listing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="border-b border-slate-100 pb-6 mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Edit className="w-4 h-4" />
              <span>Listing Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Edit Place: {formData.name}
            </h1>
          </div>
          <Link
            to={`/places/${id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Admin Moderation Controls if Admin */}
          {isAdmin && (
            <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  Administrator Moderation Controls
                </span>
                <span className="text-[11px] font-semibold text-purple-700">Admin Only</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-xs font-bold text-purple-950 uppercase mb-1">
                    Verification Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected / Unverified</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="verificationNote" className="block text-xs font-bold text-purple-950 uppercase mb-1">
                    Audit & Verification Note
                  </label>
                  <input
                    id="verificationNote"
                    type="text"
                    name="verificationNote"
                    value={formData.verificationNote}
                    onChange={handleChange}
                    placeholder="e.g. Audited on-site by municipal council on Oct 2026..."
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Place Name & Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Place Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
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
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
              />
            </div>
          </section>

          {/* Address */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Address & Contacts
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
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
                    placeholder="e.g. RS Puram, Peelamedu"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="district" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    District
                  </label>
                  <input
                    id="district"
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Coimbatore, Chennai"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
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
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 11.0168"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 76.9558"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Interactive Coordinate Picker Map */}
              <div className="pt-2">
                <CoordinatePickerMap
                  latitude={formData.latitude || 11.0168}
                  longitude={formData.longitude || 76.9558}
                  onChange={(lat, lng) =>
                    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                  }
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
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
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
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                />
              </div>
            </div>
          </section>

          {/* Facilities 3-State */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Accessibility Facilities Condition
            </h2>

            <div className="space-y-4">
              {FACILITY_DEFINITIONS.map(({ key, label }) => {
                const currentStatus = formData.facilities[key];

                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{label}</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Current: {currentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {['Available', 'Unavailable', 'Unknown'].map((val) => {
                        const isSelected = currentStatus === val;
                        let activeColor = 'bg-slate-800 text-white font-bold';
                        if (val === 'Available' && isSelected) activeColor = 'bg-emerald-700 text-white font-bold';
                        if (val === 'Unavailable' && isSelected) activeColor = 'bg-rose-700 text-white font-bold';
                        if (val === 'Unknown' && isSelected) activeColor = 'bg-amber-700 text-white font-bold';

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleFacilityStatus(key, val)}
                            className={`py-1.5 rounded-lg border text-center transition-all ${
                              isSelected
                                ? `${activeColor} shadow-2xs`
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                            aria-pressed={isSelected}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      value={formData.facilityNotes[key]}
                      onChange={(e) => handleFacilityNote(key, e.target.value)}
                      placeholder={`Notes for ${label}...`}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              to={`/places/${id}`}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlacePage;
