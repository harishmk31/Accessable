import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Accessibility,
  Menu,
  X,
  PlusCircle,
  Compass,
  Bookmark,
  ShieldCheck,
  LogOut,
  Info,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import AccessibilityStatementModal from './AccessibilityStatementModal';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
      isActive
        ? 'text-teal-700 bg-teal-50'
        : 'text-slate-700 hover:text-teal-700 hover:bg-slate-100'
    }`;

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2"
          aria-label="Main Navigation"
        >
          {/* Logo & Platform Name */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-lg p-1 shrink-0"
            aria-label="AccessAble Platform Homepage"
          >
            <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-md">
              <Accessibility className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                Access<span className="text-teal-600">Able</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tamil Nadu
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              {t('home')}
            </NavLink>
            <NavLink to="/discover" className={navLinkClass}>
              <Compass className="w-4 h-4" aria-hidden="true" />
              {t('discover')}
            </NavLink>
            <NavLink to="/regions" className={navLinkClass}>
              <MapPin className="w-4 h-4" aria-hidden="true" />
              {t('regionalHub') || 'TN Hub'}
            </NavLink>
            <NavLink to="/saved" className={navLinkClass}>
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              {t('savedPlaces')}
            </NavLink>
            <NavLink to="/places/new" className={navLinkClass}>
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              {t('listPlace')}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <ShieldCheck className="w-4 h-4 text-purple-600" aria-hidden="true" />
                {t('adminDashboard')}
              </NavLink>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Regional Language Switcher */}
            <LanguageSelector />

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              aria-label="Open accessibility standards information"
            >
              <Info className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
              <span className="hidden xl:inline">{t('accessibilityGuide')}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold uppercase">
                    {user.role === 'admin' ? t('admin') : t('member')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                  title="Sign out of AccessAble"
                  aria-label="Log out of account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile navigation header */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-teal-50 rounded-lg"
            >
              {t('home')}
            </Link>
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-teal-50 rounded-lg"
            >
              {t('discover')}
            </Link>
            <Link
              to="/regions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50 rounded-lg"
            >
              {t('regionalHub') || 'Tamil Nadu Hub'}
            </Link>
            <Link
              to="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-teal-50 rounded-lg"
            >
              {t('savedPlaces')}
            </Link>
            <Link
              to="/places/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-teal-50 rounded-lg"
            >
              {t('listPlace')}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-lg"
              >
                {t('adminDashboard')}
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsModalOpen(true);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 rounded-lg"
            >
              {t('accessibilityGuide')}
            </button>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-teal-700 font-semibold uppercase">{user.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    {t('signOut')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 rounded-lg"
                  >
                    {t('signIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AccessibilityStatementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
