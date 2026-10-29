import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search by place name, city, street, or keywords...'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full shadow-xs rounded-xl"
      role="search"
      aria-label="Places search"
    >
      <label htmlFor="places-search-input" className="sr-only">
        Search public places by name, category, or address
      </label>

      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
        <Search className="w-5 h-5" aria-hidden="true" />
      </div>

      <input
        id="places-search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-24 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
      />

      <div className="absolute right-2 flex items-center gap-1.5">
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
