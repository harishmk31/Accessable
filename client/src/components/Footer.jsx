import React from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, Heart, Shield, Terminal, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20"
      role="contentinfo"
      aria-label="AccessAble Platform Footer"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & College Project Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-teal-500 text-slate-950 rounded-xl flex items-center justify-center font-bold">
                <Accessibility className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Access<span className="text-teal-400">Able</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              <strong>AccessAble</strong> is an Accessibility Discovery Platform built to help people with disabilities, seniors, and caregivers find public places across Tamil Nadu with documented accessibility features.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 max-w-lg">
              <div className="flex items-center gap-1.5 font-bold text-teal-400 mb-1">
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Academic Project Submission & Demonstration Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Created for Full Stack Development Mini Project evaluation. Sample places in this database are curated demonstration records for testing verification workflows and 3-state facility modeling.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Platform Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-teal-400 transition-colors">
                  Discover Places Directory
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-teal-400 transition-colors">
                  Interactive Accessibility Map
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-teal-400 transition-colors">
                  Community Reviews
                </Link>
              </li>
              <li>
                <Link to="/places/new" className="hover:text-teal-400 transition-colors">
                  Submit / Register Place
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Stack Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Technology Stack
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>React 18 + Vite</li>
              <li>Node.js + Express REST API</li>
              <li>MongoDB + Mongoose</li>
              <li>Tailwind CSS + Leaflet Maps</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AccessAble. Full Stack Mini Project.</p>
          <div className="flex items-center gap-2">
            <span>Built with React + Vite, Node.js + Express, MongoDB & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
