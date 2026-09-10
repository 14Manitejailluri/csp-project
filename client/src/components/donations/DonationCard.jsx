import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Package, User, Utensils } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatRelativeTime, formatDistance } from '../../utils/formatters';

const DonationCard = ({ donation, actions, showDonor = false }) => {
  const {
    _id,
    title,
    category,
    quantity,
    unit,
    expiresAt,
    status,
    images,
    donor,
    distanceKm,
    address,
  } = donation;

  const imageUrl = images?.[0]?.url;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-emerald-50 to-teal-50 flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-10 w-10 text-emerald-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge status={status} />
        </div>
        {distanceKm !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
            <MapPin className="h-3 w-3" />
            {formatDistance(distanceKm)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-800 text-base leading-tight mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-emerald-600 font-medium mb-3">{category}</p>

        <div className="space-y-1.5 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{quantity} {unit}</span>
          </div>
          {address?.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{address.city}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className={new Date(expiresAt) < new Date() ? 'text-rose-500' : ''}>
              Expires {formatRelativeTime(expiresAt)}
            </span>
          </div>
          {showDonor && donor && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{donor.name}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            to={`/donor/donations/${_id}`}
            className="w-full text-center text-sm font-medium py-2 px-4 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            View Details
          </Link>
          {actions}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
