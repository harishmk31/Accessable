import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading accessibility information...' }) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 space-y-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" aria-hidden="true" />
      <p className="text-slate-600 font-medium text-sm">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
