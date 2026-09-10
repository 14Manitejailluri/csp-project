import React from 'react';
import { Truck, MapPin, Clock, CheckCircle2, Package, Loader2 } from 'lucide-react';
import { formatDate, formatDistance } from '../../utils/formatters';
import DirectionsLink from '../map/DirectionsLink';

const statusConfig = {
  PENDING: { label: 'Pending Assignment', color: 'amber', nextAction: null },
  ASSIGNED: { label: 'Assigned to You', color: 'blue', nextAction: 'picked-up' },
  PICKED_UP: { label: 'Picked Up', color: 'indigo', nextAction: 'delivered' },
  DELIVERED: { label: 'Delivered', color: 'teal', nextAction: null },
};

const PickupTaskCard = ({ pickup, onUpdateStatus, loading = false }) => {
  const donation = pickup?.donation;
  const config = statusConfig[pickup.status] || statusConfig.PENDING;

  const colorClasses = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  const actionLabel = {
    'picked-up': 'Mark as Picked Up',
    'delivered': 'Mark as Delivered',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-base truncate">{donation?.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{donation?.category}</p>
        </div>
        <span className={`flex-shrink-0 px-3 py-1 rounded-full border text-xs font-medium ${colorClasses[config.color]}`}>
          {config.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
          <span>{donation?.address?.street}, {donation?.address?.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-400" />
          <span>{donation?.quantity} {donation?.unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Expires: {formatDate(donation?.expiresAt)}</span>
        </div>
        {pickup.distanceKm !== undefined && (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-slate-400" />
            <span>{formatDistance(pickup.distanceKm)}</span>
          </div>
        )}
      </div>

      {/* Pickup instructions */}
      {donation?.pickupInstructions && (
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 border border-slate-100">
          <p className="font-medium text-slate-700 mb-0.5">Pickup Instructions</p>
          <p>{donation.pickupInstructions}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {donation?.location?.coordinates && (
          <DirectionsLink
            toLat={donation.location.coordinates[1]}
            toLng={donation.location.coordinates[0]}
          />
        )}
        {config.nextAction && pickup.status !== 'DELIVERED' && (
          <button
            onClick={() => onUpdateStatus(pickup._id, config.nextAction)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {actionLabel[config.nextAction]}
          </button>
        )}
      </div>
    </div>
  );
};

export default PickupTaskCard;
