import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Accessibility,
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Compass,
  Navigation,
  Map,
  Bookmark,
  MessageSquare,
  Flag,
  Settings,
  HelpCircle,
  ShieldCheck,
  Globe,
  PlusCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

const Sidebar = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenReportModal,
  onOpenProfileModal,
  onOpenHelpModal
}) => {
  const { user, isAdmin } = useAuth();
  const { t, lang, changeLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on Escape key press (WCAG 2.1 compliance)
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onCloseMobile) onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const handleNearMeClick = (e) => {
    e.preventDefault();
    if (onCloseMobile) onCloseMobile();

    if (!navigator.geolocation) {
      navigate('/discover');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        navigate(`/discover?lat=${latitude}&lng=${longitude}&radius=10`);
      },
      () => {
        navigate('/discover?district=Coimbatore');
      },
      { timeout: 8000 }
    );
  };

  const navItemClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
      isActive
        ? 'bg-teal-700 text-white shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    } ${isCollapsed ? 'justify-center px-0' : ''}`;

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg"
            aria-label="AccessAble Home"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Accessibility className="w-5 h-5" aria-hidden="true" />
            </div>
            {!isCollapsed && (
              <div className="leading-none">
                <span className="text-base font-black tracking-tight text-slate-900 block">
                  Access<span className="text-teal-700">Able</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                  Tamil Nadu
                </span>
              </div>
            )}
          </NavLink>

          {/* Single Collapse Toggle (Desktop only) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close Button (Mobile drawer only) */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            aria-label="Close navigation menu"
            title="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Navigation Items (Vertical) */}
      <nav
        className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden"
        aria-label="Primary sidebar navigation"
      >
        {/* 1. Dashboard */}
        <NavLink
          to="/"
          end
          onClick={onCloseMobile}
          className={({ isActive }) => navItemClass(isActive)}
          title={isCollapsed ? 'Dashboard' : undefined}
          aria-label="Dashboard"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        {/* 2. Explore Places */}
        <NavLink
          to="/discover"
          end
          onClick={onCloseMobile}
          className={({ isActive }) => navItemClass(isActive && !location.search.includes('view=map'))}
          title={isCollapsed ? t('discover') || 'Explore Places' : undefined}
          aria-label="Explore Places"
        >
          <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>{t('discover') || 'Explore Places'}</span>}
        </NavLink>

        {/* 3. Nearby Places */}
        <button
          type="button"
          onClick={handleNearMeClick}
          className={`w-full ${navItemClass(false)}`}
          title={isCollapsed ? t('findNearMeBtn') || 'Nearby Places' : undefined}
          aria-label="Find places near me using GPS"
        >
          <Navigation className="w-4 h-4 shrink-0 text-teal-600" aria-hidden="true" />
          {!isCollapsed && <span>Nearby Places</span>}
        </button>

        {/* 4. Map View */}
        <NavLink
          to="/accessibility-map"
          onClick={onCloseMobile}
          className={({ isActive }) => navItemClass(isActive)}
          title={isCollapsed ? 'Accessibility Map' : undefined}
          aria-label="Dedicated Accessibility Map"
        >
          <Map className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Map View</span>}
        </NavLink>

        {/* 5. Saved Places */}
        <NavLink
          to="/saved"
          onClick={onCloseMobile}
          className={({ isActive }) => navItemClass(isActive)}
          title={isCollapsed ? t('savedPlaces') || 'Saved Places' : undefined}
          aria-label="Saved Places"
        >
          <Bookmark className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>{t('savedPlaces') || 'Saved Places'}</span>}
        </NavLink>

        {/* 6. Accessibility Reviews */}
        <NavLink
          to="/reviews"
          onClick={onCloseMobile}
          className={({ isActive }) => navItemClass(isActive)}
          title={isCollapsed ? 'Accessibility Reviews' : undefined}
          aria-label="Accessibility Reviews"
        >
          <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Accessibility Reviews</span>}
        </NavLink>

        {/* 7. Report an Issue */}
        <button
          type="button"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            if (onOpenReportModal) onOpenReportModal();
          }}
          className={`w-full ${navItemClass(false)}`}
          title={isCollapsed ? t('reportIssue') || 'Report an Issue' : undefined}
          aria-label="Report an Issue"
        >
          <Flag className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
          {!isCollapsed && <span>Report an Issue</span>}
        </button>

        {/* Submit Place link */}
        <NavLink
          to="/places/new"
          onClick={onCloseMobile}
          className={({ isActive }) => navItemClass(isActive)}
          title={isCollapsed ? 'List a Place' : undefined}
          aria-label="List a Place"
        >
          <PlusCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>List a Place</span>}
        </NavLink>

        {/* Admin Dashboard if authorized */}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-600 ${
                isActive
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-purple-700 hover:bg-purple-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
            title={isCollapsed ? 'Admin Dashboard' : undefined}
            aria-label="Admin Dashboard"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600" aria-hidden="true" />
            {!isCollapsed && <span>Admin Dashboard</span>}
          </NavLink>
        )}
      </nav>

      {/* Lower Section: Profile Settings, Help */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {/* Profile Settings */}
        <button
          type="button"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            if (user) {
              if (onOpenProfileModal) onOpenProfileModal();
            } else {
              navigate('/login');
            }
          }}
          className={`w-full ${navItemClass(false)}`}
          title={isCollapsed ? (user ? 'Profile Settings' : 'Sign In') : undefined}
          aria-label={user ? 'Open profile settings' : 'Sign in to AccessAble'}
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" />
          {!isCollapsed && <span>{user ? 'Profile Settings' : 'Sign In / Register'}</span>}
        </button>

        {/* 10. Help and About */}
        <button
          type="button"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            if (onOpenHelpModal) onOpenHelpModal();
          }}
          className={`w-full ${navItemClass(false)}`}
          title={isCollapsed ? 'Help & About' : undefined}
          aria-label="Open accessibility statement and evaluation guide"
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" />
          {!isCollapsed && <span>Help & About</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-200 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Sidebar Navigation"
      >
        {navContent}
      </aside>

      {/* Mobile Slide-Out Drawer & Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
