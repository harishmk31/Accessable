import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  Check,
  Ban,
  BarChart3,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { placeService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'reviews' | 'metrics'
  const [stats, setStats] = useState(null);
  const [places, setPlaces] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, placesRes, reviewsRes] = await Promise.all([
        placeService.getPlaceStats(),
        placeService.getPlaces({ status: 'all', limit: 50 }),
        reviewService.getAllReviewsAdmin()
      ]);

      setStats(statsRes.data.stats);
      setPlaces(placesRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch (err) {
      console.error('Error loading admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center">
        <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Access Required</h2>
        <p className="text-sm text-slate-600 mb-6">
          This dashboard requires administrator authorization. Please log in with the administrator demo account.
        </p>
        <Link
          to="/login"
          className="px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Sign In as Administrator
        </Link>
      </div>
    );
  }

  const handleVerifyStatus = async (placeId, status) => {
    try {
      setActionLoading(true);
      await placeService.verifyPlace(placeId, {
        status,
        verificationNote: `Updated by Admin (${user.name}) on ${new Date().toLocaleDateString()}`
      });
      setMsg(`Place status marked as ${status}.`);
      await loadDashboardData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this place?')) return;
    try {
      setActionLoading(true);
      await placeService.deletePlace(placeId);
      setMsg('Place removed successfully.');
      await loadDashboardData();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleModerateReview = async (reviewId) => {
    try {
      setActionLoading(true);
      await reviewService.toggleModerateReview(reviewId);
      await loadDashboardData();
    } catch (err) {
      alert(`Review moderation toggle failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      setActionLoading(true);
      await reviewService.deleteReview(reviewId);
      setMsg('Review deleted.');
      await loadDashboardData();
    } catch (err) {
      alert(`Failed to delete review: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading platform administration data..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Central Administration & Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admin Management Dashboard
          </h1>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{msg}</span>
          <button type="button" onClick={() => setMsg('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{stats.totalPlaces}</span>
              <span className="block text-xs text-slate-500 font-medium">Total Places</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{stats.verifiedPlaces}</span>
              <span className="block text-xs text-slate-500 font-medium">Verified Venues</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{stats.pendingPlaces}</span>
              <span className="block text-xs text-slate-500 font-medium">Pending Moderation</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{stats.totalReviews}</span>
              <span className="block text-xs text-slate-500 font-medium">User Reviews</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('places')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'places'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'places'}
        >
          Place Listings & Verification ({places.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'reviews'}
        >
          Review Moderation Queue ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'metrics'}
        >
          Accessibility Metrics Breakdown
        </button>
      </div>

      {/* Tab 1: Places Table */}
      {activeTab === 'places' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Manage Places Directory
            </h2>
            <Link
              to="/places/new"
              className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-teal-700"
            >
              + Create Listing
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Place Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {places.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link to={`/places/${p._id}`} className="hover:text-teal-700 flex items-center gap-1.5">
                        {p.name}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">{p.category}</td>
                    <td className="py-3.5 px-4">{p.city}, {p.state}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      ⭐ {p.averageRating ? p.averageRating.toFixed(1) : 'New'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {p.status !== 'verified' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyStatus(p._id, 'verified')}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md"
                          title="Verify Place"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyStatus(p._id, 'rejected')}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md"
                          title="Reject / Unpublish"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Link
                        to={`/places/${p._id}/edit`}
                        className="inline-block p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                        title="Edit Listing"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(p._id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Moderate Reviews & Community Reports
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {rev.user?.name || 'User'}
                    </span>
                    <span className="text-xs text-slate-500">
                      reviewed{' '}
                      <Link to={`/places/${rev.place?._id}`} className="font-bold text-teal-700 hover:underline">
                        {rev.place?.name || 'Place'}
                      </Link>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rev.isModerated ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rev.isModerated ? 'Approved' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                  <div className="text-[11px] text-slate-400">
                    Rating: {rev.rating}⭐ | Accessibility: {rev.accessibilityRating}⭐
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleModerateReview(rev._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      rev.isModerated
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    {rev.isModerated ? 'Hide Review' : 'Approve Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(rev._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Metrics & Facilities Analytics */}
      {activeTab === 'metrics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Verified Facilities Availability
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Wheelchair Ramps Available', count: stats.facilityCounts?.wheelchairRamp || 0 },
                { label: 'Passenger / Medical Lifts Available', count: stats.facilityCounts?.elevatorLift || 0 },
                { label: 'Accessible Restrooms Available', count: stats.facilityCounts?.accessibleToilet || 0 },
                { label: 'Reserved Accessible Parking Bays', count: stats.facilityCounts?.accessibleParking || 0 },
                { label: 'Tactile Braille Signage Installed', count: stats.facilityCounts?.brailleSignage || 0 },
                { label: 'Audio Assistance & Hearing Loops', count: stats.facilityCounts?.audioAssistance || 0 }
              ].map(({ label, count }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="font-bold text-slate-900 bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full">
                    {count} places
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Category Distribution
            </h2>
            <div className="space-y-3">
              {(stats.categoryStats || []).map((cat) => (
                <div key={cat._id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{cat._id}</span>
                  <span className="font-bold text-slate-900 bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full">
                    {cat.count} places
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
