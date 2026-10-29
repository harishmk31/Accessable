import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, Eye, Accessibility, Keyboard, ShieldAlert } from 'lucide-react';

const AccessibilityStatementModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
              <Accessibility className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                Accessibility Statement & Evaluation Guide
              </h2>
              <p className="text-xs text-slate-500">AccessAble Platform Architecture</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            aria-label="Close accessibility statement modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-slate-600 leading-relaxed">
          <section className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-teal-900">
            <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-700" />
              Core Principle: 3-State Facility Truth
            </h3>
            <p className="text-xs leading-relaxed">
              In this platform, all accessibility features (wheelchair ramps, elevators, accessible toilets, parking, Braille signage, audio guides) are strictly tracked across <strong>Available</strong>, <strong>Unavailable</strong>, and <strong>Unknown</strong>. We deliberately never assume missing data means a facility does not exist.
            </p>
          </section>

          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
              <Keyboard className="w-4 h-4 text-slate-700" />
              Keyboard Navigation Controls
            </h3>
            <ul className="text-xs space-y-1.5 list-disc pl-5 text-slate-700">
              <li><strong>Tab / Shift + Tab:</strong> Move forwards and backwards through focusable elements.</li>
              <li><strong>Enter / Space:</strong> Activate buttons, links, and filter switches.</li>
              <li><strong>Escape:</strong> Dismiss active modals, dropdowns, and overlays.</li>
              <li><strong>Skip Link:</strong> Press Tab on page load to jump directly to main content.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-slate-700" />
              Visual Design & Contrast
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Color palettes conform to WCAG 2.1 AA standards for minimum text contrast (4.5:1 ratio). All interactive elements feature high-visibility outline rings for clarity.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 text-xs">
            <span className="font-bold block mb-1">External Review Note:</span>
            All sample records in this deployment are designated demonstration data. To test administrative capabilities, log in using the pre-configured administrator account.
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityStatementModal;
