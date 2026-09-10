import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const dashboardRoute = {
  donor: '/donor/dashboard',
  ngo: '/ngo/dashboard',
  volunteer: '/volunteer/dashboard',
  admin: '/admin/dashboard',
};

export const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out!');
    navigate('/');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              FoodRescue
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/#how-it-works" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">How it Works</NavLink>
            <NavLink to="/#impact" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Impact</NavLink>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardRoute[role] || '/'}
                  className="text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors px-3 py-2">
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to={dashboardRoute[role] || '/'} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">Dashboard</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">Log In</Link>
                <Link to="/register" className="block px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;