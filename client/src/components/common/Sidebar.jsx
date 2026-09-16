import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, ListChecks, Truck,
  Users, BarChart3, ClipboardList, ShieldCheck, LogOut, X,
  UserCircle, Headphones, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navConfig = {
  donor: [
    { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/donor/donate', label: 'Create Donation', icon: PlusCircle },
    { to: '/donor/my-donations', label: 'My Donations', icon: Package },
  ],
  ngo: [
    { to: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ngo/available', label: 'Available Donations', icon: Package },
    { to: '/ngo/claimed', label: 'Claimed Donations', icon: ListChecks },
    { to: '/ngo/saved', label: 'Saved Donations', icon: Sparkles },
  ],
  volunteer: [
    { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/volunteer/available', label: 'Available Pickups', icon: Truck },
    { to: '/volunteer/deliveries', label: 'My Deliveries', icon: ClipboardList },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/donations', label: 'Donations Review', icon: Package },
    { to: '/admin/moderation', label: 'Listing Flags', icon: ShieldCheck },
    { to: '/admin/reports', label: 'Impact Analytics', icon: BarChart3 },
  ],
};

const roleColors = {
  donor: 'from-emerald-600 to-teal-700',
  ngo: 'from-blue-600 to-indigo-700',
  volunteer: 'from-amber-500 to-orange-600',
  admin: 'from-violet-600 to-purple-700',
};

const roleLabels = {
  donor: 'Food Donor',
  ngo: 'NGO Partner',
  volunteer: 'Volunteer',
  admin: 'Administrator',
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[role] || [];
  const gradient = roleColors[role] || 'from-slate-600 to-slate-700';

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-white border-r border-slate-100 shadow-xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none lg:z-auto`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${gradient} p-5`}>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5" onClick={onClose}>
              <p className="text-white font-bold text-lg leading-tight">FoodRescue</p>
            </Link>
            <div className="flex items-center gap-1">
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/95 text-[11px] font-semibold">
                {roleLabels[role] || 'Member'}
              </span>
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* User info box linking to /profile */}
          <Link
            to="/profile"
            onClick={onClose}
            className="mt-4 flex items-center gap-3 p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/15 group"
            title="View My Profile"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-white/40 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=059669&color=fff&size=128`;
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm truncate group-hover:underline flex items-center gap-1">
                {user?.name}
              </p>
              <p className="text-white/70 text-xs truncate">My Profile & Account →</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>
          <ul className="space-y-1 mb-4">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Account & Help Section */}
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 pt-2 border-t border-slate-100">
            Account & Support
          </div>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                <UserCircle className="h-4 w-4 flex-shrink-0" />
                Profile & Settings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/help"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                <Headphones className="h-4 w-4 flex-shrink-0" />
                Customer Support
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          {role === 'ngo' && user?.isVerified === false && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
              <ShieldCheck className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">Verification pending</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
