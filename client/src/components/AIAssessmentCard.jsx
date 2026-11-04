import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { placeService } from '../services/api';

export default function AIAssessmentCard({ placeId, placeName }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssessment = async () => {
    if (!placeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await placeService.getAIAssessment(placeId);
      if (res.data?.success) {
        setAssessment(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to generate AI assessment at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [placeId]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              {assessment?.model === 'gemini-1.5-flash'
                ? 'AI Accessibility Assessment'
                : 'Algorithmic Accessibility Assessment'}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {assessment?.model === 'gemini-1.5-flash' ? 'Google Gemini 1.5 Flash' : 'Deterministic Audit Engine'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evidence-based algorithmic analysis of accessibility features, physical barriers, and visitor advice
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAssessment}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          title="Regenerate assessment"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Evaluating...' : 'Refresh Audit'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            Analyzing facility measurements, door widths, ramps, and community feedback...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="py-6 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-300">{error}</p>
          <button
            type="button"
            onClick={fetchAssessment}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content */}
      {assessment && !loading && (
        <div className="pt-4 space-y-5">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {assessment.summary}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Engine: <strong>{assessment.source || assessment.model}</strong></span>
              <span>•</span>
              <span>Audited: <strong>{new Date(assessment.evaluatedAt).toLocaleDateString()}</strong></span>
              {assessment.metrics && (
                <>
                  <span>•</span>
                  <span>
                    Readiness Score: <strong className="text-primary-600 dark:text-primary-400">{assessment.metrics.score}/100</strong> ({assessment.metrics.tier})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Grid: Strengths vs Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verified Strengths & Assets</span>
                <span className="text-xs ml-auto font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                  {assessment.strengths?.length || 0}
                </span>
              </div>
              {assessment.strengths && assessment.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-950 dark:text-emerald-200">{str.facility}:</strong>{' '}
                        <span>{str.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No confirmed accessibility assets found in records.</p>
              )}
            </div>

            {/* Identified Barriers */}
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20">
              <div className="flex items-center gap-2 mb-3 text-red-800 dark:text-red-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>Barriers & Accessibility Obstacles</span>
                <span className="text-xs ml-auto font-mono bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full">
                  {assessment.barriers?.length || 0}
                </span>
              </div>
              {assessment.barriers && assessment.barriers.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.barriers.map((bar, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-red-950 dark:text-red-200">{bar.facility}:</strong>{' '}
                        <span>{bar.detail}</span>
                        {bar.severity && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200">
                            {bar.severity}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  No verified critical physical barriers recorded for this venue.
                </p>
              )}
            </div>
          </div>

          {/* Actionable Recommendations for Visitors */}
          {assessment.recommendations && assessment.recommendations.length > 0 && (
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Actionable Visitor Guidance</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                {assessment.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 text-xs"
                  >
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400 block mb-0.5">
                      {rec.targetAudience || 'Visitors'}:
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{rec.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information gaps */}
          {assessment.informationGaps && assessment.informationGaps.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 text-xs flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 dark:text-amber-300">Data Gaps Needing Field Audit: </strong>
                <span className="text-slate-700 dark:text-slate-300">
                  {assessment.informationGaps.join(' • ')}
                </span>
              </div>
            </div>
          )}

          {/* Mandatory Transparency Disclaimer */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <Info className="w-4 h-4 shrink-0 text-slate-400" />
            <span>{assessment.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
