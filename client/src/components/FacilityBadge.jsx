import React from 'react';
import {
  Accessibility,
  ArrowUpDown,
  CircleHelp,
  CheckCircle2,
  XCircle,
  Car,
  Binary,
  Volume2,
  Footprints,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const FACILITY_METADATA = {
  wheelchairRamp: { labelKey: 'wheelchairRamp', icon: Accessibility },
  ramp: { labelKey: 'wheelchairRamp', icon: Accessibility },
  elevatorLift: { labelKey: 'elevatorLift', icon: ArrowUpDown },
  lift: { labelKey: 'elevatorLift', icon: ArrowUpDown },
  accessibleToilet: { labelKey: 'accessibleToilet', icon: Accessibility },
  accessibleParking: { labelKey: 'accessibleParking', icon: Car },
  brailleSignage: { labelKey: 'brailleSignage', icon: Binary },
  audioAssistance: { labelKey: 'audioAssistance', icon: Volume2 },
  tactilePaving: { labelKey: 'tactilePaving', icon: Footprints },
  stepFreeEntrance: { labelKey: 'stepFreeEntrance', icon: CheckCircle2 }
};

const normalizeStatus = (status = '') => {
  if (status === 'Verified Available' || status === 'Available') return 'Verified Available';
  if (status === 'Verified Unavailable' || status === 'Unavailable') return 'Verified Unavailable';
  if (status === 'Conflicting Reports') return 'Conflicting Reports';
  if (status === 'User Reported Pending Verification') return 'User Reported Pending Verification';
  return 'Unknown';
};

const STATUS_CONFIGS = {
  'Verified Available': {
    bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    indicator: 'bg-emerald-600',
    icon: CheckCircle2,
    badgeTextKey: 'statusAvailable',
    shortLabel: 'Available'
  },
  'Verified Unavailable': {
    bg: 'bg-rose-50 text-rose-900 border-rose-300',
    indicator: 'bg-rose-600',
    icon: XCircle,
    badgeTextKey: 'statusUnavailable',
    shortLabel: 'Unavailable'
  },
  'Unknown': {
    bg: 'bg-amber-50 text-amber-900 border-amber-300',
    indicator: 'bg-amber-500',
    icon: CircleHelp,
    badgeTextKey: 'statusUnknown',
    shortLabel: 'Unknown'
  },
  'Conflicting Reports': {
    bg: 'bg-orange-50 text-orange-900 border-orange-300',
    indicator: 'bg-orange-600',
    icon: AlertCircle,
    badgeTextKey: 'statusConflicting',
    shortLabel: 'Conflicting'
  },
  'User Reported Pending Verification': {
    bg: 'bg-sky-50 text-sky-900 border-sky-300',
    indicator: 'bg-sky-600',
    icon: Clock,
    badgeTextKey: 'statusUserReported',
    shortLabel: 'Pending'
  }
};

const FacilityBadge = ({ facilityKey, status = 'Unknown', note = '', compact = false, evidenceSource = '' }) => {
  const { t } = useTranslation();
  const meta = FACILITY_METADATA[facilityKey] || { labelKey: facilityKey, icon: Accessibility };
  const label = t(meta.labelKey) || facilityKey;

  const validStatus = normalizeStatus(status);
  const config = STATUS_CONFIGS[validStatus] || STATUS_CONFIGS['Unknown'];
  const FacilityIcon = meta.icon;
  const StatusIcon = config.icon;
  const statusLabel = t(config.badgeTextKey);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.bg}`}
        title={`${label}: ${statusLabel}${note ? ` — ${note}` : ''}`}
        aria-label={`${label} is ${statusLabel}`}
      >
        <FacilityIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[105px]">{label}</span>
        <StatusIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border ${config.bg} transition-all`}
      role="group"
      aria-label={`${label}: ${statusLabel}`}
    >
      <div className="p-2 rounded-lg bg-white/90 shrink-0 shadow-xs">
        <FacilityIcon className="w-5 h-5 text-slate-800" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-bold text-sm text-slate-900">{label}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/95 border border-current shadow-xs">
            <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {statusLabel}
          </span>
        </div>

        {note ? (
          <p className="mt-1 text-xs text-slate-700 leading-relaxed font-normal">{note}</p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-500 italic">
            {validStatus === 'Unknown'
              ? 'Condition not yet verified by on-site audit.'
              : `Standard facility condition recorded as ${validStatus.toLowerCase()}.`}
          </p>
        )}

        {evidenceSource && evidenceSource !== 'Not audited yet' && (
          <div className="mt-1.5 pt-1.5 border-t border-current/15 text-[10px] text-slate-600 font-medium">
            <span className="font-bold">Source:</span> {evidenceSource}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityBadge;
