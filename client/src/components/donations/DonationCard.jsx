import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, MapPin, Package, User, Utensils, ShieldCheck,
  Heart, Flag, ChevronLeft, ChevronRight, CheckCircle2, Award, QrCode
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatRelativeTime, formatDistance } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { favoriteService } from '../../services/favoriteService';
import ReportDonationModal from './ReportDonationModal';
import toast from 'react-hot-toast';

export const DonationCard = ({
  donation = {},
  onRequest,
  onShowQR,
  onShowCertificate,
  showDonor = false,
  isFavoriteInitial = false,
}) => {
  const { user, role, isNgo, isDonor, isVolunteer, isAdmin } = useAuth();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(isFavoriteInitial);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const {
    _id,
    title,
    foodName,
    category,
    foodType,
    foodCategory,
    dietaryType = 'Vegetarian',
    quantity,
    unit,
    quantityUnit,
    expiresAt,
    pickupDeadline,
    availableUntil,
    preparedAt,
    status,
    verificationStatus = 'VERIFIED',
    images = [],
    imageUrl: directImageUrl,
    donor,
    distanceKm,
    address,
    location,
  } = donation;

  const displayTitle = title || foodName || 'Surplus Food';
  const displayCategory = category || foodCategory || foodType || 'Cooked food';
  const displayUnit = unit || quantityUnit || 'meals';
  const displayExpires = availableUntil || pickupDeadline || expiresAt;
  const displayCity = location?.city || address?.city || 'Local Area';

  // Extract all images
  const allImages = [];
  if (directImageUrl) allImages.push(directImageUrl);
  if (Array.isArray(images)) {
    images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }
  if (allImages.length === 0) {
    allImages.push(
      dietaryType === 'Vegetarian'
        ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80'
    );
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await favoriteService.toggle(_id);
      setIsFavorited(res.data?.data?.isFavorited);
      toast.success(res.data?.data?.isFavorited ? 'Saved to Favorites!' : 'Removed from Favorites');
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const isExpired = displayExpires && new Date(displayExpires) < new Date();
  const detailLink = `/${role || 'donor'}/donations/${_id}`;

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative">
        {/* Top Image & Gallery Controls */}
        <div className="relative h-48 sm:h-52 bg-slate-900 overflow-hidden flex-shrink-0">
          <img
            src={allImages[activeImgIndex] || allImages[0]}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

          {/* Badges on Top */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <StatusBadge status={status} />
            {verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-sm">
                <ShieldCheck className="h-3 w-3" />
                Verified Listing
              </span>
            )}
          </div>

          {/* Quick Action Buttons (Favorite / Flag) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {isNgo && (
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`p-2 rounded-xl backdrop-blur-md transition-transform active:scale-90 ${
                  isFavorited
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
                }`}
                title={isFavorited ? 'Saved in favorites' : 'Save donation'}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-white' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReportModalOpen(true);
              }}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/70 hover:text-rose-400 backdrop-blur-md transition-colors"
              title="Report suspicious listing"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Image carousel indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImgIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeImgIndex === i ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Dietary Badge on Image */}
          <div className="absolute bottom-3 left-3 z-10">
            <span
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md ${
                dietaryType === 'Vegetarian'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : dietaryType === 'Vegan'
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
              }`}
            >
              {dietaryType === 'Vegetarian' && '🥦 Veg'}
              {dietaryType === 'Non-Vegetarian' && '🍗 Non-Veg'}
              {dietaryType === 'Vegan' && '🌱 Vegan'}
            </span>
          </div>

          {/* City Pill */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[11px] text-white/90 bg-black/50 px-2.5 py-1 rounded-xl backdrop-blur-md">
            <MapPin className="h-3 w-3 text-emerald-400" />
            <span>{displayCity}</span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 flex-1 flex flex-col space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                {displayCategory}
              </span>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {quantity} {displayUnit}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 mt-1">
              {displayTitle}
            </h3>
          </div>

          {/* Key Timestamps Grid */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            {preparedAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Prepared:</span>
                <span className="font-medium text-slate-700">
                  {new Date(preparedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {displayExpires && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Available Until:</span>
                <span className={`font-bold flex items-center gap-1 ${isExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(displayExpires)}
                </span>
              </div>
            )}
            {showDonor && donor && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span className="text-slate-400">Donor:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                  {donor.organizationName || donor.name}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={detailLink}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-center font-bold text-xs transition-colors flex items-center justify-center gap-1"
              >
                View Details
              </Link>

              {/* Context Action Button */}
              {isNgo && status === 'AVAILABLE' && (
                <button
                  type="button"
                  onClick={() => onRequest && onRequest(donation)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  Request Food
                </button>
              )}

              {isDonor && (status === 'ASSIGNED' || status === 'CLAIMED') && (
                <button
                  type="button"
                  onClick={() => onShowQR && onShowQR(donation)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Show QR
                </button>
              )}

              {status === 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => onShowCertificate && onShowCertificate(donation)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Award className="h-3.5 w-3.5" />
                  Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportDonationModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          donation={donation}
        />
      )}
    </>
  );
};

export default DonationCard;
