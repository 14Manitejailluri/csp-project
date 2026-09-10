import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, ListChecks, Truck,
  Users, BarChart3, ClipboardList, ShieldCheck, LogOut, X,
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
  ],
  volunteer: [
    { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/volunteer/pickups', label: 'Available Pickups', icon: Truck },
    { to: '/volunteer/deliveries', label: 'My Deliveries', icon: ClipboardList },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/donations', label: 'Donations', icon: Package },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
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
            <div>
              <p className="text-white font-bold text-lg leading-tight">FoodRescue</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-white/90 text-xs font-medium">
                {roleLabels[role]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name}</p>
              <p className="text-white/60 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
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
