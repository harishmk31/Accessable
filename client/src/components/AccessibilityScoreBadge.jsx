import React, { useState } from 'react';
import { Award, Info, X, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export default function AccessibilityScoreBadge({ place, size = 'md' }) {
  const [showModal, setShowModal] = useState(false);

  if (!place) return null;

  const score = place.accessibilityScore;
  const tier = place.accessibilityTier || 'Insufficient Data';
  const facilities = place.facilities || {};
  const isInsufficient = tier === 'Insufficient Data' || score === null || score === undefined;

  // Count how many of the 6 core facilities are confirmed (Available or Unavailable)
  const confirmedCount = [
    facilities.wheelchairRamp,
    facilities.elevatorLift,
    facilities.accessibleToilet,
    facilities.accessibleParking,
    facilities.brailleSignage,
    facilities.audioAssistance
  ].filter((s) => s === 'Available' || s === 'Unavailable').length;

  // Badge appearance classes based on tier
  const tierStyles = {
    'High Accessibility': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
    'Moderate Accessibility': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
    'Limited Accessibility': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
    'Insufficient Data': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  const badgeClass = tierStyles[isInsufficient ? 'Insufficient Data' : tier] || tierStyles['Insufficient Data'];

  const domainBreakdown = [
    {
      label: 'Ramp / Step-Free Entrance',
      weight: 25,
      status: facilities.wheelchairRamp || 'Unknown',
      points: facilities.wheelchairRamp === 'Available' ? 25 : 0
    },
    {
      label: 'Elevator / Lift',
      weight: 20,
      status: facilities.elevatorLift || 'Unknown',
      points: facilities.elevatorLift === 'Available' ? 20 : 0
    },
    {
      label: 'Accessible Restroom',
      weight: 20,
      status: facilities.accessibleToilet || 'Unknown',
      points: facilities.accessibleToilet === 'Available' ? 20 : 0
    },
    {
      label: 'Accessible Parking',
      weight: 15,
      status: facilities.accessibleParking || 'Unknown',
      points: facilities.accessibleParking === 'Available' ? 15 : 0
    },
    {
      label: 'Tactile & Braille Signage',
      weight: 10,
      status: facilities.brailleSignage || 'Unknown',
      points: facilities.brailleSignage === 'Available' ? 10 : 0
    },
    {
      label: 'Audio Assistance',
      weight: 10,
      status: facilities.audioAssistance || 'Unknown',
      points: facilities.audioAssistance === 'Available' ? 10 : 0
    }
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-full flex-wrap ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        } ${badgeClass}`}
        title="Click to view how this accessibility score is calculated"
        aria-label={`Accessibility Score: ${isInsufficient ? 'Insufficient data' : `${score}/100`} (${confirmedCount} of 6 facilities confirmed). Click to view breakdown.`}
      >
        <Award className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-4 h-4 shrink-0'} />
        <span className="font-semibold shrink-0">{isInsufficient ? 'Insufficient Data' : `${score}/100`}</span>
        <span className="text-[11px] opacity-75 shrink-0">({confirmedCount}/6 confirmed)</span>
        <Info className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
      </button>

      {/* Transparent Formula Breakdown Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="score-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 id="score-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Accessibility Score Breakdown
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close score breakdown modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Place summary banner */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                    {place.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {place.city}, {place.district || 'Tamil Nadu'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {isInsufficient ? 'Score Unavailable' : `${score}/100`}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {tier} ({confirmedCount} of 6 facilities confirmed)
                  </div>
                </div>
              </div>

              {/* Explanatory note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed border border-slate-200/60 dark:border-slate-800">
                <strong className="block text-slate-900 dark:text-white font-bold">
                  How this accessibility score is calculated:
                </strong>
                <p>
                  Scores are calculated strictly from verified physical facilities using standard architectural weights:
                  Ramp / Step-free entrance (25 pts), Elevator/Lift (20 pts), Accessible Restroom (20 pts), Accessible Parking (15 pts), Tactile/Braille Signage (10 pts), and Audio Assistance (10 pts).
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Venues with fewer than 2 confirmed facilities are classified as <em>Insufficient Data</em>. Unknown facilities add zero points and are never assumed to be unavailable.
                </p>
              </div>

              {/* Domain breakdown table */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Weight Distribution by Facility
                </div>
                {domainBreakdown.map((item, idx) => {
                  const isAvail = item.status === 'Available';
                  const isUnavail = item.status === 'Unavailable';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {isAvail ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isUnavail ? (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {item.label}
                          </span>
                          <span className="text-xs text-slate-400 ml-1.5">
                            ({item.weight}% weight)
                          </span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span
                          className={`font-bold ${
                            isAvail
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isUnavail
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          +{item.points} pts
                        </span>
                        <div className="text-[10px] text-slate-400">{item.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formula summary */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                <strong>Grading Formula:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  <li><strong>70–100:</strong> High Accessibility (wheelchair ready & multi-feature)</li>
                  <li><strong>40–69:</strong> Moderate Accessibility (core facilities available)</li>
                  <li><strong>1–39:</strong> Limited Accessibility (significant barriers present)</li>
                  <li><strong>Insufficient Data:</strong> Fewer than 2 facilities have been audited</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
