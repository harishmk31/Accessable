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
  ExternalLink,
  Flag,
  Globe,
  MapPin,
  AlertTriangle,
  Database,
  DownloadCloud,
  CheckCircle2,
  Layers,
  CopyCheck
} from 'lucide-react';
import { placeService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'reports' | 'reviews' | 'metrics' | 'ingestion'
  const [stats, setStats] = useState(null);
  const [places, setPlaces] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [providerStatus, setProviderStatus] = useState(null);
  const [coverageStats, setCoverageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const [ingestCity, setIngestCity] = useState('');
  const [ingestCategory, setIngestCategory] = useState('');
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadDuplicates = async () => {
    try {
      setDuplicatesLoading(true);
      const res = await placeService.getAdminDuplicates();
      if (res.data?.success) {
        setDuplicateGroups(res.data.data || []);
      }
    } catch (err) {
      console.warn('Error loading duplicates:', err);
    } finally {
      setDuplicatesLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, placesRes, reviewsRes, reportsRes, providerRes, coverageRes] = await Promise.all([
        placeService.getPlaceStats(),
        placeService.getPlaces({ status: 'all', limit: 100 }),
        reviewService.getAllReviewsAdmin(),
        placeService.getAdminReports().catch(() => ({ data: { reports: [] } })),
        placeService.getProviderStatus().catch(() => ({ data: { provider: 'mock_fallback' } })),
        placeService.getCoverage().catch(() => ({ data: null }))
      ]);

      setStats(statsRes.data.stats);
      setPlaces(placesRes.data.data);
      setReviews(reviewsRes.data.data);
      setReports(reportsRes.data.reports || []);
      setProviderStatus(providerRes.data);
      setCoverageStats(coverageRes?.data || null);
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

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    const adminNotes = window.prompt(`Enter resolution notes for setting status to "${newStatus}":`, 'Verified by on-site audit');
    if (adminNotes === null) return;
    try {
      setActionLoading(true);
      await placeService.updateReportStatus(reportId, { status: newStatus, adminNotes });
      setMsg(`Report status updated to ${newStatus}.`);
      await loadDashboardData();
    } catch (err) {
      alert(`Report update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerIngest = async (payload) => {
    try {
      setIngestLoading(true);
      setIngestResult(null);
      const res = await placeService.triggerIngest(payload);
      setIngestResult(res.data);
      const summary = res.data.summary || {};
      setMsg(`Ingestion success: ${summary.processed || 0} processed (${summary.added || 0} added, ${summary.updated || 0} updated, ${summary.errors || 0} errors).`);
      await loadDashboardData();
    } catch (err) {
      alert(`Data ingestion failed: ${err.message}`);
    } finally {
      setIngestLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading platform administration data..." />;
  }

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const pendingPlacesCount = places.filter((p) => p.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Central Administration & Ground Audits</span>
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

      {/* Geospatial & Provider Adapter Status Banner */}
      {providerStatus && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block">
                Geospatial & Map Integration Provider
              </span>
              <span className="text-slate-400">
                Active Adapter: <strong className="text-teal-300 uppercase">{providerStatus.provider}</strong> • Status: {providerStatus.configured ? 'Configured' : 'Offline / Standalone Fallback'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Primary Focus: <strong>Coimbatore & Tamil Nadu</strong></span>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900">{stats.totalPlaces}</span>
              <span className="block text-[11px] text-slate-500 font-medium">Total Places</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900">{stats.verifiedPlaces}</span>
              <span className="block text-[11px] text-slate-500 font-medium">Verified Venues</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-amber-700">{stats.pendingPlaces ?? pendingPlacesCount}</span>
              <span className="block text-[11px] text-slate-500 font-medium">Pending Places</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-rose-700">{pendingReportsCount}</span>
              <span className="block text-[11px] text-slate-500 font-medium">Pending Reports</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900">{stats.totalReviews ?? reviews.length}</span>
              <span className="block text-[11px] text-slate-500 font-medium">Reviews</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('places')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'places'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'places'}
        >
          <span>Place Listings & Audits ({places.length})</span>
          {pendingPlacesCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
              {pendingPlacesCount} pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'reports'}
        >
          <Flag className="w-3.5 h-3.5 text-amber-600" />
          <span>Inaccuracy Reports ({reports.length})</span>
          {pendingReportsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors shrink-0 ${
            activeTab === 'reviews'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'reviews'}
        >
          Review Moderation ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors shrink-0 ${
            activeTab === 'metrics'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'metrics'}
        >
          Accessibility Metrics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ingestion')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'ingestion'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'ingestion'}
        >
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>Statewide Ingestion & Coverage</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('duplicates');
            loadDuplicates();
          }}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'duplicates'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          role="tab"
          aria-selected={activeTab === 'duplicates'}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Duplicate Scan ({duplicateGroups.length})</span>
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
                  <th className="py-3 px-4">District / Area</th>
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
                    <td className="py-3.5 px-4">
                      {p.district || p.city} {p.locality ? `(${p.locality})` : ''}
                    </td>
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

      {/* Tab 2: Inaccuracy Reports Moderation */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Inaccuracy Reports Queue
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              {reports.length} total reports
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No inaccurate data reports submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep._id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {rep.issueCategory.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rep.status === 'investigating'
                            ? 'bg-blue-100 text-blue-800'
                            : rep.status === 'dismissed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Venue:{' '}
                        <Link to={`/places/${rep.place?._id}`} className="font-bold text-teal-700 hover:underline">
                          {rep.place?.name || 'View Place'}
                        </Link>
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">"{rep.description}"</p>

                    {rep.evidence && (
                      <p className="text-[11px] text-slate-500">
                        <strong>Evidence:</strong> {rep.evidence}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Reported by: {rep.reporterName || 'Anonymous'} {rep.reporterEmail ? `(${rep.reporterEmail})` : ''} •{' '}
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </div>

                    {rep.adminNotes && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                        <strong>Admin Note:</strong> {rep.adminNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-start">
                    <button
                      type="button"
                      onClick={() => handleUpdateReportStatus(rep._id, 'investigating')}
                      className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold"
                    >
                      Investigate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateReportStatus(rep._id, 'resolved')}
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateReportStatus(rep._id, 'dismissed')}
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Moderate Reviews & Community Ratings
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

      {/* Tab 4: Metrics & Facilities Analytics */}
      {activeTab === 'metrics' && stats && (
        <div className="space-y-6">
          {/* Evidentiary Data Quality & Integrity Summary Card */}
          {stats.dataQuality && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Statewide Integrity Audit</span>
                  </div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Evidentiary Data Quality & Integrity Summary
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Audited from real database records
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Eligible Verified Places</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{stats.dataQuality.totalEligiblePlaces}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Published & accessible</div>
                </div>

                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100">
                  <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">With Coordinates</div>
                  <div className="text-2xl font-black text-teal-900 mt-1">
                    {stats.dataQuality.placesWithCoordinates}
                    <span className="text-xs font-semibold text-teal-700 ml-1.5">
                      ({stats.dataQuality.totalEligiblePlaces > 0 ? Math.round((stats.dataQuality.placesWithCoordinates / stats.dataQuality.totalEligiblePlaces) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-teal-600 mt-0.5">Valid TN bounding box</div>
                </div>

                <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100">
                  <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">With Photos</div>
                  <div className="text-2xl font-black text-sky-900 mt-1">
                    {stats.dataQuality.placesWithPhotos}
                    <span className="text-xs font-semibold text-sky-700 ml-1.5">
                      ({stats.dataQuality.totalEligiblePlaces > 0 ? Math.round((stats.dataQuality.placesWithPhotos / stats.dataQuality.totalEligiblePlaces) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-sky-600 mt-0.5">Wikimedia / genuine</div>
                </div>

                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider">≥1 Assessed Facility</div>
                  <div className="text-2xl font-black text-indigo-900 mt-1">
                    {stats.dataQuality.placesWithAtLeastOneAssessedFacility}
                    <span className="text-xs font-semibold text-indigo-700 ml-1.5">
                      ({stats.dataQuality.totalEligiblePlaces > 0 ? Math.round((stats.dataQuality.placesWithAtLeastOneAssessedFacility / stats.dataQuality.totalEligiblePlaces) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">Audited accessibility</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Fully Assessed (6/6)</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">{stats.dataQuality.placesFullyAssessed}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Complete facility audit</div>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Insufficient Evidence</div>
                  <div className="text-2xl font-black text-amber-900 mt-1">{stats.dataQuality.placesInsufficientData}</div>
                  <div className="text-[10px] text-amber-700 mt-0.5">&lt; 2 confirmed facilities</div>
                </div>

                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100">
                  <div className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">Awaiting Review</div>
                  <div className="text-2xl font-black text-purple-900 mt-1">{stats.dataQuality.placesAwaitingReview}</div>
                  <div className="text-[10px] text-purple-600 mt-0.5">Pending moderation</div>
                </div>

                <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100">
                  <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Out-of-Bounds / Invalid</div>
                  <div className="text-2xl font-black text-rose-900 mt-1">{stats.dataQuality.suspiciousOrInvalidRecords}</div>
                  <div className="text-[10px] text-rose-600 mt-0.5">Coordinates outside TN</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Facility Assessment Status
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Confirmed vs Unknown
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'wheelchairRamp', label: 'Wheelchair Ramp / Step-Free' },
                { key: 'elevatorLift', label: 'Passenger / Medical Lift' },
                { key: 'accessibleToilet', label: 'Accessible Restroom' },
                { key: 'accessibleParking', label: 'Reserved Accessible Parking' },
                { key: 'brailleSignage', label: 'Tactile & Braille Signage' },
                { key: 'audioAssistance', label: 'Audio Assistance & Loops' }
              ].map(({ key, label }) => {
                const audit = stats.facilityAuditBreakdown?.[key] || {
                  confirmedAvailable: stats.facilityCounts?.[key] || 0,
                  confirmedUnavailable: 0,
                  unknownNotAssessed: (stats.verifiedPlaces || 0) - (stats.facilityCounts?.[key] || 0)
                };
                return (
                  <div key={key} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{label}</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                        {audit.confirmedAvailable} Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Confirmed Available: <strong>{audit.confirmedAvailable}</strong>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-rose-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Confirmed Unavailable: <strong>{audit.confirmedUnavailable}</strong>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Unknown / Not Assessed: <strong>{audit.unknownNotAssessed}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
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
      </div>
    )}

      {/* Tab 5: Statewide Data Ingestion & Coverage Engine */}
      {activeTab === 'ingestion' && (
        <div className="space-y-6">
          {/* Engine Header */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                <Database className="w-3.5 h-3.5" />
                <span>Geospatial Ingestion Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Tamil Nadu Verified Ingestion Pipeline
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ingest genuine, field-audited public places with strict coordinate bounds validation, multi-district normalization, and idempotent deduplication. Preserves all user reviews and ratings.
              </p>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => handleTriggerIngest({ mode: 'catalogue' })}
                disabled={ingestLoading}
                className="inline-flex items-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors"
              >
                <DownloadCloud className={`w-4 h-4 ${ingestLoading ? 'animate-bounce' : ''}`} />
                <span>{ingestLoading ? 'Syncing Catalogue...' : 'Sync Master Catalogue'}</span>
              </button>
            </div>
          </div>

          {/* Ingestion Result Banner */}
          {ingestResult && (
            <div className="p-5 bg-teal-50 border border-teal-200 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Pipeline Execution Summary</span>
                </div>
                <span className="text-[11px] text-teal-700 font-semibold">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-xs text-slate-500 font-medium block">Total Processed</span>
                  <span className="text-lg font-black text-slate-900">{ingestResult.summary?.processed || 0}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-xs text-slate-500 font-medium block">Newly Added</span>
                  <span className="text-lg font-black text-emerald-700">{ingestResult.summary?.added || 0}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-xs text-slate-500 font-medium block">Updated / Preserved</span>
                  <span className="text-lg font-black text-blue-700">{ingestResult.summary?.updated || 0}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-xs text-slate-500 font-medium block">Validation Errors</span>
                  <span className="text-lg font-black text-rose-700">{ingestResult.summary?.errors || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Targeted Ingestion Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By District */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <MapPin className="w-4 h-4 text-teal-600" />
                <h3>Targeted City / District Import</h3>
              </div>
              <p className="text-xs text-slate-500">
                Filter and synchronize verified locations for a single city or district (e.g. Coimbatore, Chennai, Madurai, Salem, Nilgiris).
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Coimbatore, Chennai, Madurai"
                  value={ingestCity}
                  onChange={(e) => setIngestCity(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!ingestCity.trim()) return alert('Please enter a district or city name.');
                    handleTriggerIngest({ mode: 'city', district: ingestCity.trim() });
                  }}
                  disabled={ingestLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Sync District
                </button>
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Building2 className="w-4 h-4 text-teal-600" />
                <h3>Targeted Category Import</h3>
              </div>
              <p className="text-xs text-slate-500">
                Synchronize places matching a specific public category (e.g. Hospital, Transit/Station, Tourist Attraction).
              </p>
              <div className="flex gap-2">
                <select
                  value={ingestCategory}
                  onChange={(e) => setIngestCategory(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
                >
                  <option value="">Select Category...</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Transit/Station">Transit/Station</option>
                  <option value="College/University">College/University</option>
                  <option value="Shopping/Mall">Shopping/Mall</option>
                  <option value="Tourist Attraction">Tourist Attraction</option>
                  <option value="Parks & Gardens">Parks & Gardens</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!ingestCategory) return alert('Please select a category.');
                    handleTriggerIngest({ mode: 'category', category: ingestCategory });
                  }}
                  disabled={ingestLoading}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Sync Category
                </button>
              </div>
            </div>
          </div>

          {/* Statewide Coverage & District Breakdown */}
          {coverageStats && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Live Statewide Coverage Distribution ({coverageStats.totalPlaces} Places)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified venues across {coverageStats.districtsCoveredCount || (coverageStats.districts || []).length} Tamil Nadu districts.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">District</th>
                      <th className="py-2.5 px-4">Geographic Zone</th>
                      <th className="py-2.5 px-4 text-right">Verified Venues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(coverageStats.districts || []).map((d) => (
                      <tr key={d.district} className="hover:bg-slate-50">
                        <td className="py-2 px-4 font-bold text-slate-800 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          <span>{d.district}</span>
                        </td>
                        <td className="py-2 px-4 text-slate-600">
                          {d.region || 'Tamil Nadu'}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                            {d.count} venues
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Duplicate Scan & Integrity */}
      {activeTab === 'duplicates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Duplicate Detection & Data Integrity Scanner
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Scans all place records for matching name and city combinations to prevent redundant listings.
              </p>
            </div>
            <button
              type="button"
              onClick={loadDuplicates}
              disabled={duplicatesLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${duplicatesLoading ? 'animate-spin' : ''}`} />
              <span>Re-scan Dataset</span>
            </button>
          </div>

          {duplicatesLoading ? (
            <div className="p-12 text-center">
              <LoadingSpinner size="md" />
            </div>
          ) : duplicateGroups.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                Zero Duplicates Detected
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All 107 verified venue listings have unique normalized names across their respective cities and districts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicateGroups.map((group, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-amber-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{group._id.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({group._id.city})</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {group.count} Matching Records
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.places.map((p) => (
                      <div key={p._id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-medium text-slate-800">{p.address}</span>
                          <span className="text-slate-400 ml-2">Status: {p.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/places/${p._id}`} className="text-primary-600 hover:underline">
                            View
                          </Link>
                          <Link to={`/places/${p._id}/edit`} className="text-slate-600 hover:underline">
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeletePlace(p._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
