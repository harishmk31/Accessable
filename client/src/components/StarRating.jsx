import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  interactive = false,
  onChange = null,
  size = 'md',
  label = 'Rating'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (interactive) {
    return (
      <div className="flex items-center gap-1" role="group" aria-label={label}>
        {[...Array(maxRating)].map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = starValue <= rating;

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange && onChange(starValue)}
              className="p-1 rounded hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              aria-label={`${starValue} out of ${maxRating} stars for ${label}`}
              aria-pressed={isFilled}
            >
              <Star
                className={`${currentSize} ${
                  isFilled
                    ? 'text-amber-500 fill-amber-400'
                    : 'text-slate-300 hover:text-amber-400'
                } transition-colors`}
              />
            </button>
          );
        })}
        <span className="ml-2 text-sm font-semibold text-slate-700">
          {rating > 0 ? `${rating} / ${maxRating}` : 'Select rating'}
        </span>
      </div>
    );
  }

  // Display-only mode
  return (
    <div
      className="inline-flex items-center gap-1.5"
      aria-label={`${rating} out of ${maxRating} stars`}
    >
      <div className="flex items-center" aria-hidden="true">
        {[...Array(maxRating)].map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = starValue <= Math.round(rating);

          return (
            <Star
              key={starValue}
              className={`${currentSize} ${
                isFilled
                  ? 'text-amber-500 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          );
        })}
      </div>
      <span className="text-sm font-bold text-slate-800">
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>
    </div>
  );
};

export default StarRating;
