import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' }
];

const LanguageSelector = () => {
  const { lang, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
        aria-label={`Change interface language. Current language: ${activeLang.native}`}
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-teal-700" />
        <span className="font-bold">{activeLang.native}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
          aria-label="Language options"
        >
          {LANGUAGES.map((l) => {
            const isSelected = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  changeLanguage(l.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-teal-50 transition-colors ${
                  isSelected ? 'font-bold text-teal-800 bg-teal-50/60' : 'text-slate-700'
                }`}
                role="menuitem"
              >
                <span>{l.native}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
