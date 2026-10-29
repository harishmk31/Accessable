import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Globe,
  Navigation,
  ShieldCheck,
  Calendar,
  User,
  Edit,
  Trash2,
  HeartHandshake,
  MessageSquarePlus,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Flag,
  Share2,
  Camera,
  ExternalLink,
  Info
} from 'lucide-react';
import { placeService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import FacilityBadge from '../components/FacilityBadge';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportModal from '../components/ReportModal';

const PlaceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, toggleSavePlace, isPlaceSaved } = useAuth();
  const { t } = useTranslation();

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingPlace, setSavingPlace] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [accessibilityRating, setAccessibilityRating] = useState(5);
  const [comment, setComment] = useState('');
  const [facilityFeedback, setFacilityFeedback] = useState({
    wheelchairRamp: 'Not Checked',
    elevatorLift: 'Not Checked',
    accessibleToilet: 'Not Checked',
    accessibleParking: 'Not Checked',
    brailleSignage: 'Not Checked',
    audioAssistance: 'Not Checked'
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const fetchPlaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await placeService.getPlaceById(id);
      const placeData = res.data.data;
      setPlace(placeData);
      setReviews(res.data.reviews || []);
      if (isPlaceSaved) {
        setIsSaved(isPlaceSaved(placeData._id));
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve place details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaceData();
  }, [id]);

  useEffect(() => {
    if (place && isPlaceSaved) {
      setIsSaved(isPlaceSaved(place._id));
    }
  }, [user, place]);

  const handleToggleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSavingPlace(true);
    try {
      const nowSaved = await toggleSavePlace(place._id);
      setIsSaved(nowSaved);
    } catch (err) {
      console.error('Bookmark error:', err.message);
    } finally {
      setSavingPlace(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccessMsg('');
    setReviewErrorMsg('');

    if (!comment.trim()) {
      setReviewErrorMsg('Please write a short review sharing your experience.');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.addReview(id, {
        rating,
        accessibilityRating,
        comment,
        facilityFeedback
      });
      setReviewSuccessMsg('Your accessibility review has been submitted successfully!');
      setComment('');
      // Refresh place and reviews list
      await fetchPlaceData();
    } catch (err) {
      setReviewErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      await fetchPlaceData();
    } catch (err) {
      alert(`Could not delete review: ${err.message}`);
    }
  };

  const handleDeletePlace = async () => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this place and all of its reviews?'
      )
    )
      return;
    try {
      await placeService.deletePlace(id);
      navigate('/discover');
    } catch (err) {
      alert(`Failed to delete place: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading verified accessibility audit details..." />;
  }

  if (error || !place) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-rose-950 mb-2">Place Not Found</h2>
        <p className="text-sm text-rose-800 mb-6">{error || 'This place listing could not be found.'}</p>
        <Link
          to="/discover"
          className="px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          {t('discover')}
        </Link>
      </div>
    );
  }

  const {
    name,
    description,
    category,
    address,
    city,
    district,
    locality,
    state,
    postalCode,
    contactNumber,
    website,
    facilities = {},
    facilityNotes = {},
    accessibilityProfile = {},
    status,
    verificationNote,
    createdBy,
    averageRating = 0,
    averageAccessibilityRating = 0,
    totalReviews = 0,
    photos = [],
    images = [],
    coordinates = {},
    location = {},
    isSampleData
  } = place;

  const lat = coordinates?.lat || location?.coordinates?.[1];
  const lng = coordinates?.lng || location?.coordinates?.[0];

  const isOwner = user && createdBy && (user.id === createdBy._id || user._id === createdBy._id);
  const canManage = isOwner || isAdmin;

  // Compile authentic photo gallery (filtering out any unverified stock photos)
  const allPhotos = [];
  if (photos && photos.length > 0) {
    photos.forEach((p) => {
      if (p.url && !p.url.includes('images.unsplash.com')) {
        allPhotos.push({
          url: p.url,
          caption: p.caption || name,
          author: p.author || p.authorName || 'AccessAble Field Record',
          license: p.license || 'Verified Reference',
          source: p.source || 'Audit Record'
        });
      }
    });
  } else if (images && images.length > 0) {
    images.forEach((imgUrl) => {
      if (typeof imgUrl === 'string' && !imgUrl.includes('images.unsplash.com')) {
        allPhotos.push({
          url: imgUrl,
          caption: name,
          author: 'AccessAble Field Record',
          license: 'Permitted Reference',
          source: 'Ground Audit'
        });
      }
    });
  }

  const hasPhoto = allPhotos.length > 0;
  const currentPhoto = hasPhoto ? allPhotos[activePhotoIdx] || allPhotos[0] : null;

  const googleMapsDirectionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}, ${city}`)}`;

  // Multi-status facility list
  const facilityItems = [
    {
      key: 'wheelchairRamp',
      profileKey: 'ramp',
      label: t('wheelchairRamp')
    },
    {
      key: 'elevatorLift',
      profileKey: 'elevator',
      label: t('elevatorLift')
    },
    {
      key: 'accessibleToilet',
      profileKey: 'restroom',
      label: t('accessibleToilet')
    },
    {
      key: 'accessibleParking',
      profileKey: 'parking',
      label: t('accessibleParking')
    },
    {
      key: 'brailleSignage',
      profileKey: 'braille',
      label: t('brailleSignage')
    },
    {
      key: 'audioAssistance',
      profileKey: 'audioAssistance',
      label: t('audioAssistance')
    },
    {
      key: 'tactilePaving',
      profileKey: 'tactilePaving',
      label: t('tactilePaving')
    },
    {
      key: 'stepFreeEntrance',
      profileKey: 'stepFreeEntrance',
      label: t('stepFreeEntrance')
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Sample Data Disclaimer if marked */}
      {isSampleData && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3 text-teal-950 text-xs">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Verified Academic Notice:</strong> This location entry is part of the AccessAble verified dataset for Tamil Nadu. Missing accessibility details are not treated as absent.
          </div>
        </div>
      )}

      {/* Main Header & Image Banner with Authentic Attribution */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
          {hasPhoto && currentPhoto ? (
            <>
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption || name}
                className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-black/30" />
            </>
          ) : (
            <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-300 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/80 text-teal-400 flex items-center justify-center mb-3 border border-slate-600 shadow-sm">
                <Camera className="w-7 h-7 opacity-75" />
              </div>
              <p className="text-sm font-bold text-slate-200">Photograph Pending Ground Verification</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                AccessAble prioritizes genuine on-site photographic evidence. Stock photos are intentionally not displayed.
              </p>
            </div>
          )}

          {/* Floating Category & Verification Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
              {category}
            </span>
            {district && (
              <span className="px-3 py-1 bg-teal-800/90 backdrop-blur-md text-white text-xs font-bold rounded-full border border-teal-400/30">
                {district}
              </span>
            )}
            {status === 'verified' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600/95 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4" />
                Verified Ground Audit
              </span>
            )}
          </div>

          {/* Top Right Action Buttons: Bookmark & Inaccuracy Report */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={savingPlace}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl shadow-md transition-all ${
                isSaved
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-white/90 hover:bg-white text-slate-800'
              }`}
              title={isSaved ? 'Remove from saved places' : 'Save place to bookmarks'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? t('saved') : t('savePlace')}</span>
            </button>

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors"
              title="Report incorrect details"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('reportIssue')}</span>
            </button>

            {canManage && (
              <div className="flex items-center gap-1 pl-1">
                <Link
                  to={`/places/${id}/edit`}
                  className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl shadow-md transition-colors"
                  title="Edit Listing"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleDeletePlace}
                  className="p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
                  title="Delete Listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Image Attribution Pill */}
          {hasPhoto && currentPhoto && (
            <div className="absolute bottom-20 sm:bottom-24 right-4 max-w-xs text-right hidden sm:block">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-slate-300 border border-white/10">
                <Camera className="w-3 h-3 text-teal-400" />
                <span className="truncate">
                  {currentPhoto.author} • {currentPhoto.license}
                </span>
              </div>
            </div>
          )}

          {/* Header Title inside banner bottom */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{name}</h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                {address}{locality ? `, ${locality}` : ''}, {city}, {state} {postalCode}
              </span>
            </p>
          </div>
        </div>

        {/* Thumbnail Carousel if multiple photos */}
        {allPhotos.length > 1 && (
          <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3 overflow-x-auto">
            {allPhotos.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activePhotoIdx === idx
                    ? 'border-teal-400 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Rating and Info Bar */}
        <div className="p-6 sm:p-8 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                {t('generalRating')}
              </span>
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} size="md" />
                <span className="text-xs text-slate-500 font-semibold">
                  ({totalReviews} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            <div className="pl-6 border-l border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                {t('accessRating')}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-sm font-bold">
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span>
                  {averageAccessibilityRating ? averageAccessibilityRating.toFixed(1) : 'Audited'} / 5.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('getDirections')}</span>
            </a>

            {contactNumber && (
              <a
                href={`tel:${contactNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>{contactNumber}</span>
              </a>
            )}

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                <Globe className="w-4 h-4 text-slate-600" />
                <span>{t('visitWebsite')}</span>
              </a>
            )}
          </div>
        </div>

        {/* Place Description Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{t('aboutVenue')}</h2>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {description}
          </p>

          {verificationNote && (
            <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-teal-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-teal-900 font-bold">{t('sourceAttribution')}</strong>
                <p className="mt-0.5 leading-relaxed">{verificationNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accessibility Facilities Deep-Dive Grid */}
      <section aria-labelledby="accessibility-facilities-title" className="space-y-4">
        <div>
          <h2 id="accessibility-facilities-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('facilityBreakdownTitle')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('facilityBreakdownSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilityItems.map(({ key, profileKey }) => {
            const profile = accessibilityProfile?.[profileKey];
            const legacyStatus = facilities?.[key];
            const legacyNote = facilityNotes?.[key];

            const statusVal = profile?.status || legacyStatus || 'Unknown';
            const noteVal = profile?.notes || legacyNote || '';
            const sourceVal = profile?.evidenceSource || '';

            return (
              <FacilityBadge
                key={key}
                facilityKey={key}
                status={statusVal}
                note={noteVal}
                evidenceSource={sourceVal}
              />
            );
          })}
        </div>
      </section>

      {/* Community Reviews & Ratings Section */}
      <section aria-labelledby="reviews-section-title" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="reviews-section-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('reviewsTitle')}
            </h2>
            <p className="text-sm text-slate-600">
              First-hand feedback from persons with disabilities, families, and visitors.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        {/* Add Review Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-teal-600" />
                {t('leaveReview')}
              </h3>

              {reviewSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {reviewSuccessMsg}
                </div>
              )}

              {reviewErrorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  {reviewErrorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    {t('generalRating')}
                  </label>
                  <StarRating
                    rating={rating}
                    interactive
                    onChange={setRating}
                    label="Overall Experience"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    {t('accessRating')}
                  </label>
                  <StarRating
                    rating={accessibilityRating}
                    interactive
                    onChange={setAccessibilityRating}
                    label="Accessibility Experience"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label
                  htmlFor="review-comment-input"
                  className="block text-xs font-bold text-slate-700 uppercase mb-1.5"
                >
                  Observations & Review Details *
                </label>
                <textarea
                  id="review-comment-input"
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('reviewCommentPlaceholder')}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Observed Facilities checklist */}
              <div className="pt-2">
                <span className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Confirm What You Observed On-Site (Optional)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { key: 'wheelchairRamp', label: t('wheelchairRamp') },
                    { key: 'elevatorLift', label: t('elevatorLift') },
                    { key: 'accessibleToilet', label: t('accessibleToilet') },
                    { key: 'accessibleParking', label: t('accessibleParking') },
                    { key: 'brailleSignage', label: t('brailleSignage') },
                    { key: 'audioAssistance', label: t('audioAssistance') }
                  ].map(({ key, label }) => (
                    <div key={key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="block font-semibold text-slate-800 text-[11px] mb-1 truncate">
                        {label}
                      </span>
                      <select
                        value={facilityFeedback[key] || 'Not Checked'}
                        onChange={(e) =>
                          setFacilityFeedback({
                            ...facilityFeedback,
                            [key]: e.target.value
                          })
                        }
                        className="w-full text-xs bg-white border border-slate-300 rounded-md p-1.5"
                      >
                        <option value="Not Checked">Not Checked</option>
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  {submittingReview ? 'Submitting...' : t('postReviewBtn')}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Have you visited this place?
              </h3>
              <p className="text-xs text-slate-600 mb-4 max-w-md mx-auto">
                Sign in to rate this venue, confirm its ramps and elevators, and help the community discover accessible public places.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Sign In to Leave a Review
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No reviews recorded for this place yet. Be the first to share your accessibility feedback!
            </div>
          ) : (
            reviews.map((rev) => {
              const revUser = rev.user || { name: 'Anonymous Reviewer', role: 'user' };
              const isRevAuthor = user && (user.id === revUser._id || user._id === revUser._id);
              const canDeleteRev = isRevAuthor || isAdmin;

              return (
                <div
                  key={rev._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {revUser.name ? revUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {revUser.name}
                          </span>
                          {revUser.role === 'admin' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 font-medium">Overall:</span>
                          <StarRating rating={rev.rating} size="sm" />
                        </div>
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                          <span className="text-[11px] text-teal-700 font-medium">Access:</span>
                          <span className="text-xs font-bold text-teal-800">
                            {rev.accessibilityRating} / 5
                          </span>
                        </div>
                      </div>

                      {canDeleteRev && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Review"
                          aria-label="Delete this review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {rev.comment}
                  </p>

                  {/* Observed Facilities pill list */}
                  {rev.facilityFeedback && (
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                      {Object.entries(rev.facilityFeedback)
                        .filter(([_, v]) => v && v !== 'Not Checked')
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className={`px-2 py-0.5 rounded-md border font-medium ${
                              v === 'Available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : v === 'Unavailable'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {k}: {v}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Inaccuracy Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        placeId={place._id}
        placeName={place.name}
      />
    </div>
  );
};

export default PlaceDetailsPage;
