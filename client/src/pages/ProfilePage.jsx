import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Building2, Calendar, ShieldCheck,
  Edit3, Heart, Clock, Award, CheckCircle2, AlertCircle,
  Truck, Utensils, HelpCircle, FileText, Sparkles, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/profile/EditProfileModal';
import CustomerSupportCard from '../components/common/CustomerSupportCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const roleBadgeConfig = {
  donor: {
    label: 'Food Donor',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: Utensils,
    desc: 'Donating surplus food to eliminate hunger and reduce food waste.',
  },
  ngo: {
    label: 'Verified NGO Partner',
    gradient: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: ShieldCheck,
    desc: 'Distributing collected food directly to vulnerable communities.',
  },
  volunteer: {
    label: 'Community Volunteer',
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: Truck,
    desc: 'Bridging the distance by transporting donations safely and swiftly.',
  },
  admin: {
    label: 'System Administrator',
    gradient: 'from-purple-600 to-indigo-700',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: Award,
    desc: 'Managing platform governance, security, and verification.',
  },
};

export const ProfilePage = () => {
  const { user, loading, updateProfile, fetchMe } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Refresh user data from API on component mount to ensure fresh DB sync
    if (fetchMe) {
      fetchMe();
    }
  }, [fetchMe]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMe();
      toast.success('Profile synced with database!');
    } catch {
      toast.error('Failed to reload profile');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={false} />;
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">User session not found</h3>
        <p className="text-sm text-slate-500 mt-1">Please log in to view your profile.</p>
      </div>
    );
  }

  const role = user.role || 'donor';
  const badgeInfo = roleBadgeConfig[role] || roleBadgeConfig.donor;
  const RoleIcon = badgeInfo.icon;

  const address = user.location?.address || 'Not specified';
  const city = user.location?.city || 'Not specified';
  const pincode = user.location?.pincode || 'Not specified';
  const state = user.location?.state || '';
  const fullAddressString = [address, city, state, pincode].filter((p) => p && p !== 'Not specified').join(', ') || 'No address registered';

  const createdAtFormatted = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently Joined';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Account Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User Profile
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage your registered details, role permissions, and active settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors shadow-sm flex items-center gap-1.5 text-xs font-medium"
            title="Reload from database"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <button
            id="edit-profile-btn"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/20 transition-all active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Banner with modern pattern & gradient */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />
        </div>

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar and Primary Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-2xl bg-white"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=059669&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 border-4 border-white shadow-2xl flex items-center justify-center text-white text-3xl sm:text-4xl font-black">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-500 transition-transform active:scale-90"
                  title="Change photo"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {user.name}
                  </h2>
                  <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${badgeInfo.bg} ${badgeInfo.text} border ${badgeInfo.border}`}>
                    <RoleIcon className="h-3.5 w-3.5" />
                    {badgeInfo.label}
                  </span>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user.email}
                  {user.organizationName && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-slate-700">{user.organizationName}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
              >
                <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
                Edit Info
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Account Status
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active & Registered
              </span>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Member Since
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {createdAtFormatted}
              </span>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                City / Region
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {city || 'Unassigned'}
              </span>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Role Type
              </span>
              <span className="text-xs font-bold text-slate-800 capitalize">
                {role} Account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Aware Detailed Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Registered Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Comprehensive Details Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registered Information</h3>
                  <p className="text-xs text-slate-500">
                    Live details fetched directly from database
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {role} Schema
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              {/* Full Name */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
                </p>
                <p className="text-base font-bold text-slate-900">{user.name}</p>
              </div>

              {/* Email Address */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
                </p>
                <p className="text-sm font-semibold text-slate-900 break-all">{user.email}</p>
              </div>

              {/* Phone Number */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {user.phone ? (
                    <a href={`tel:${user.phone}`} className="text-emerald-700 hover:underline">
                      {user.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-normal italic">Not provided</span>
                  )}
                </p>
              </div>

              {/* User Role */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <RoleIcon className="h-3.5 w-3.5 text-slate-400" /> User Role
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${badgeInfo.bg} ${badgeInfo.text}`}>
                    {badgeInfo.label}
                  </span>
                </div>
              </div>

              {/* ROLE SPECIFIC: DONOR */}
              {role === 'donor' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-emerald-600" /> Organization / Business Name
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.organizationName || <span className="text-slate-400 font-normal italic">Individual Donor</span>}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Utensils className="h-3.5 w-3.5 text-emerald-600" /> Donor Type
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.donorType || 'Restaurant'}
                    </p>
                  </div>
                </>
              )}

              {/* ROLE SPECIFIC: NGO */}
              {role === 'ngo' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-blue-600" /> NGO / Organization Name
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.organizationName || <span className="text-slate-400 font-normal italic">Not specified</span>}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-blue-600" /> Contact Person
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.contactPerson || user.name}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 sm:col-span-2">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600" /> Registration / 80G Number
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-900">
                      {user.registrationNumber || <span className="text-slate-400 font-normal font-sans italic">Registration under review / not added</span>}
                    </p>
                  </div>
                </>
              )}

              {/* ROLE SPECIFIC: VOLUNTEER */}
              {role === 'volunteer' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 sm:col-span-2">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600" /> Availability & Schedule
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.availability || 'Flexible / On-call'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Notifications for food rescue deliveries will prioritize your availability window.
                  </p>
                </div>
              )}

              {/* Street Address */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Street Address
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {address}
                </p>
              </div>

              {/* City */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  City
                </p>
                <p className="text-sm font-bold text-slate-900">{city}</p>
              </div>

              {/* Pincode */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Pincode / ZIP
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono">{pincode}</p>
              </div>

              {/* Account Created Date */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Account Created Date
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {createdAtFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Role Summary Note */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 mb-1">
                Your FoodRescue Role: {badgeInfo.label}
              </h4>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                {badgeInfo.desc} You can update your location and preferences anytime using the Edit Profile button.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Support & Help Widget */}
        <div className="space-y-6">
          {/* Integrated Customer Support Widget */}
          <CustomerSupportCard variant="compact" />

          {/* Quick Security & Account Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Account Security & Privacy
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your contact details and exact location coordinates are only shared with verified partners when a rescue pickup or claim is confirmed.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Modify Contact & Address
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Support Full Banner at Bottom */}
      <div className="mt-8">
        <CustomerSupportCard variant="card" />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdated={updateProfile}
      />
    </div>
  );
};

export default ProfilePage;
