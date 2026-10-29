import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No places found',
  description = 'Try modifying your search keywords or relaxing some accessibility filters.',
  action = null
}) => {
  return (
    <div
      className="text-center py-12 px-6 bg-white border border-slate-200 rounded-xl shadow-xs max-w-lg mx-auto"
      role="region"
      aria-label="Empty search results notice"
    >
      <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
