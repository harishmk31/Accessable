import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle2, Flag } from 'lucide-react';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

const ReportModal = ({ isOpen, onClose, placeId, placeName }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const modalRef = useRef(null);

  const [issueCategory, setIssueCategory] = useState('incorrect_accessibility');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide at least 10 characters explaining the inaccuracy.');
      return;
    }

    try {
      setSubmitting(true);
      await placeService.submitReport(placeId, {
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
      aria-labelledby="report-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-base font-bold text-slate-900">
                {t('reportTitle')}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{placeName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Close report modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Report Received</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Thank you for contributing to reliable accessibility information. Our auditing team will verify and update this record.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="issue-category" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('issueCategoryLabel')} *
              </label>
              <select
                id="issue-category"
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
              >
                <option value="incorrect_accessibility">{t('issueIncorrectAccess')}</option>
                <option value="closed_permanently">{t('issueClosed')}</option>
                <option value="wrong_address">{t('issueAddress')}</option>
                <option value="wrong_contact_or_hours">{t('issueContact')}</option>
                <option value="other">{t('issueOther')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="issue-description" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('descriptionLabel')} *
              </label>
              <textarea
                id="issue-description"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="issue-evidence" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('evidenceLabel')}
              </label>
              <input
                id="issue-evidence"
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="e.g. Photo link, official website announcement, or date observed..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label htmlFor="reporter-name" className="block text-xs font-semibold text-slate-600 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  id="reporter-name"
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Anonymous or your name"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label htmlFor="reporter-email" className="block text-xs font-semibold text-slate-600 mb-1">
                  Email for Updates (Optional)
                </label>
                <input
                  id="reporter-email"
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {submitting ? 'Submitting...' : t('submitReportBtn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
