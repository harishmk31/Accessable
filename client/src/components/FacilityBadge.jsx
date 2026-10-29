import React from 'react';
import {
  Accessibility,
  ArrowUpDown,
  CircleHelp,
  CheckCircle2,
  XCircle,
  Car,
  Binary,
  Volume2
} from 'lucide-react';

const FACILITY_METADATA = {
  wheelchairRamp: {
    label: 'Wheelchair Ramp',
    icon: Accessibility
  },
  elevatorLift: {
    label: 'Elevator / Lift',
    icon: ArrowUpDown
  },
  accessibleToilet: {
    label: 'Accessible Restroom',
    icon: Accessibility
  },
  accessibleParking: {
    label: 'Accessible Parking',
    icon: Car
  },
  brailleSignage: {
    label: 'Braille Signage',
    icon: Binary
  },
  audioAssistance: {
    label: 'Audio Assistance',
    icon: Volume2
  }
};

const STATUS_CONFIGS = {
  Available: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    indicator: 'bg-emerald-600',
    icon: CheckCircle2,
    badgeText: 'Available',
    ariaText: 'Facility is available'
  },
  Unavailable: {
    bg: 'bg-rose-50 text-rose-800 border-rose-300',
    indicator: 'bg-rose-600',
    icon: XCircle,
    badgeText: 'Unavailable',
    ariaText: 'Facility is unavailable'
  },
  Unknown: {
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    indicator: 'bg-amber-500',
    icon: CircleHelp,
    badgeText: 'Unknown',
    ariaText: 'Facility status unknown or unverified'
  }
};

const FacilityBadge = ({ facilityKey, status = 'Unknown', note = '', compact = false }) => {
  const meta = FACILITY_METADATA[facilityKey] || {
    label: facilityKey,
    icon: Accessibility
  };

  const validStatus = STATUS_CONFIGS[status] ? status : 'Unknown';
  const config = STATUS_CONFIGS[validStatus];
  const FacilityIcon = meta.icon;
  const StatusIcon = config.icon;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg}`}
        title={`${meta.label}: ${config.badgeText}${note ? ` - ${note}` : ''}`}
        aria-label={`${meta.label} is ${config.badgeText}`}
      >
        <FacilityIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[110px]">{meta.label}</span>
        <StatusIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} transition-all`}
      role="group"
      aria-label={`${meta.label}: ${config.badgeText}`}
    >
      <div className="p-2 rounded-md bg-white/80 shrink-0 shadow-sm">
        <FacilityIcon className="w-5 h-5 text-slate-700" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-sm text-slate-900">{meta.label}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 border border-current shadow-xs">
            <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {config.badgeText}
          </span>
        </div>

        {note ? (
          <p className="mt-1 text-xs text-slate-700 leading-relaxed">{note}</p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-500 italic">
            {validStatus === 'Unknown'
              ? 'Status not yet verified by an on-site audit.'
              : `Standard facility condition recorded as ${validStatus.toLowerCase()}.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default FacilityBadge;
