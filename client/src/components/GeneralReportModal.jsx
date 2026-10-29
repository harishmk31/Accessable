import React, { useState, useEffect, useRef } from 'react';
import { X, Flag, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

const GeneralReportModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const modalRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [issueCategory, setIssueCategory] = useState('incorrect_accessibility');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError('');
      setDescription('');
      setEvidence('');
      // Load top places for quick selection
      placeService.getPlaces({ limit: 50 })
        .then((res) => {
          const list = res.data.data || [];
          setPlaces(list);
          if (list.length > 0 && !selectedPlaceId) {
            setSelectedPlaceId(list[0]._id);
          }
        })
        .catch((err) => console.warn('Could not load places list:', err.message));
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setReporterName(user.name || '');
      setReporterEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPlaceId) {
      setError('Please select a place to report.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide at least 10 characters explaining the inaccuracy.');
      return;
    }

    try {
      setSubmitting(true);
      await placeService.submitReport(selectedPlaceId, {
        issueCategory,
        description: description.trim(),
        evidence: evidence.trim(),
        reporterName: reporterName.trim() || undefined,
        reporterEmail: reporterEmail.trim() || undefined
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-heading"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="report-modal-heading" className="text-base font-bold text-slate-900">
                Report an Accessibility Issue
              </h2>
              <p className="text-[11px] text-slate-500">Maintain evidentiary accuracy for mobility planning</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            aria-label="Close report modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Report Submitted Successfully</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for keeping AccessAble reliable. Our audit moderation queue will review this feedback.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="report-place-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Venue
              </label>
              <select
                id="report-place-select"
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl p-2.5 focus:border-teal-500 focus:outline-none"
                required
              >
                {places.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.locality ? `${p.locality}, ` : ''}{p.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issue-category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issue Category
              </label>
              <select
                id="issue-category"
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl p-2.5 focus:border-teal-500 focus:outline-none"
              >
                <option value="incorrect_accessibility">Accessibility facility condition changed or incorrect</option>
                <option value="venue_permanently_closed">Venue permanently closed</option>
                <option value="wrong_address_location">Incorrect address or GPS pin location</option>
                <option value="contact_hours_wrong">Incorrect contact number or timings</option>
                <option value="other">Other factual discrepancy</option>
              </select>
            </div>

            <div>
              <label htmlFor="issue-desc" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description of Issue
              </label>
              <textarea
                id="issue-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Ramp slope is blocked for tile renovation, elevator is currently undergoing maintenance..."
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl p-2.5 focus:border-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="issue-evidence" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Optional Supporting Evidence / Source
              </label>
              <input
                id="issue-evidence"
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="e.g. Personal visit on Oct 28 or official notice link"
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl p-2.5 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GeneralReportModal;
