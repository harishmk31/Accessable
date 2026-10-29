import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  User,
  ChevronDown,
  Bookmark,
  ShieldCheck,
  Settings,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

const Header = ({
  onToggleMobileSidebar,
  onOpenProfileModal,
  isSidebarCollapsed,
  onToggleCollapse
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Top Left: Hamburger trigger on mobile/tablet or when collapsed on desktop */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* When sidebar is collapsed on desktop, show a subtle expand toggle */}
        {isSidebarCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Expand left navigation"
          >
            <Menu className="w-4 h-4 text-teal-700" />
            <span>Menu</span>
          </button>
        )}

        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Accessibility Discovery Platform • Tamil Nadu
        </span>
      </div>

      {/* Top Right: User Profile Avatar, Name, Account Dropdown */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[120px] truncate">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                role="menu"
                aria-orientation="vertical"
              >
                {/* User info banner */}
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 capitalize">
                    {user.role}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onOpenProfileModal) onOpenProfileModal();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    role="menuitem"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Profile Settings</span>
                  </button>

                  <Link
                    to="/saved"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    role="menuitem"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                    <span>Saved Places</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                      role="menuitem"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    role="menuitem"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
