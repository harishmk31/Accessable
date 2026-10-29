import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="text-4xl font-black text-slate-900 block">404</span>
        <h1 className="text-lg font-bold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The accessibility discovery page or venue record you requested does not exist or has been relocated.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl"
          >
            <Compass className="w-4 h-4" />
            Discover Places
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
