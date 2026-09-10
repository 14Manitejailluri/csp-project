import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
        <ShieldOff className="h-10 w-10 text-rose-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Access Denied</h1>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        You don&apos;t have permission to view this page. Please log in with an account that has the appropriate role.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </Link>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  </div>
);

export default UnauthorizedPage;
