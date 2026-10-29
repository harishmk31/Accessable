import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Shield, Bookmark, CheckCircle, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useTranslation } from '../context/LanguageContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuth();
  const { t } = useTranslation();
  const modalRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      const res = await authService.updateProfile({ name: name.trim() });
      if (updateUser) updateUser(res.data.user);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const savedCount = user?.savedPlaces?.length || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-900 leading-tight">
                Profile & Settings
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {user?.role === 'admin' ? 'Administrator' : 'AccessAble Member'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Statistics Row */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Account Type</span>
            <span className="text-xs font-bold text-teal-800 capitalize mt-0.5 block">
              {user?.role || 'Guest'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Saved Places</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block">
              {savedCount} {savedCount === 1 ? 'place' : 'places'}
            </span>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="profile-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-xl focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Email is permanently linked to your account</span>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
