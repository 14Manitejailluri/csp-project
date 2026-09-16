import React from 'react';
import {
  Package, ShieldCheck, CheckCircle2, UserCheck, QrCode,
  Truck, MapPin, Award, CheckCircle, Clock
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const DonationTimeline = ({ donation, pickup }) => {
  if (!donation) return null;

  const isCancelled = donation.status === 'CANCELLED';
  const isExpired = donation.status === 'EXPIRED';
  const isRejected = donation.status === 'REJECTED';

  if (isCancelled || isExpired || isRejected) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <p className="font-bold text-slate-800 uppercase tracking-wider mb-1">Status: {donation.status}</p>
        <p>
          {isRejected
            ? `Listing was not approved: ${donation.rejectionReason || 'Please review guidelines.'}`
            : `This rescue listing was ${donation.status.toLowerCase()}.`}
        </p>
      </div>
    );
  }

  // Determine which step is achieved based on timestamps and status
  const stages = [
    {
      key: 'POSTED',
      label: 'Food Posted',
      desc: 'Surplus food details submitted by donor',
      icon: Package,
      time: donation.createdAt,
      isDone: true,
    },
    {
      key: 'VERIFIED',
      label: 'Photo & Details Verified',
      desc: 'Listing safety checked by platform team',
      icon: ShieldCheck,
      time: donation.verifiedAt || donation.createdAt,
      isDone: donation.verificationStatus === 'VERIFIED' || !!donation.verifiedAt,
    },
    {
      key: 'REQUESTED',
      label: 'NGO Requested Food',
      desc: donation.claimedBy?.organizationName
        ? `Claimed by ${donation.claimedBy.organizationName}`
        : 'Requested by verified NGO partner',
      icon: CheckCircle2,
      time: donation.claimedAt,
      isDone: ['REQUESTED', 'CLAIMED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(donation.status),
    },
    {
      key: 'ASSIGNED',
      label: 'Volunteer Assigned',
      desc: donation.volunteer?.name
        ? `Accepted by volunteer ${donation.volunteer.name}`
        : 'Assigned for collection and delivery',
      icon: UserCheck,
      time: pickup?.scheduledTime || (pickup?.volunteer ? pickup.updatedAt : null),
      isDone: ['ASSIGNED', 'PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(donation.status) && (!!donation.volunteer || !!pickup?.volunteer),
    },
    {
      key: 'QR_VERIFIED',
      label: 'QR Pickup Verified',
      desc: 'Secure one-time QR code scanned at donor premises',
      icon: QrCode,
      time: pickup?.qrVerifiedAt || donation.pickedUpAt,
      isDone: ['PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(donation.status) || !!pickup?.qrVerifiedAt,
    },
    {
      key: 'PICKED_UP',
      label: 'Food Picked Up',
      desc: 'Collected from donor with proof photo',
      icon: Truck,
      time: donation.pickedUpAt || pickup?.pickedUpAt,
      isDone: ['PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(donation.status),
    },
    {
      key: 'DELIVERED',
      label: 'Delivered to NGO',
      desc: 'Transported to destination shelter with delivery proof',
      icon: MapPin,
      time: donation.deliveredAt || pickup?.deliveredAt,
      isDone: ['DELIVERED', 'COMPLETED'].includes(donation.status),
    },
    {
      key: 'CONFIRMED',
      label: 'NGO Confirmed Receipt',
      desc: 'Beneficiary organization validated food arrival',
      icon: CheckCircle,
      time: donation.completedAt || pickup?.completedAt,
      isDone: donation.status === 'COMPLETED' || !!donation.completedAt,
    },
    {
      key: 'COMPLETED',
      label: 'Donation Completed 🎉',
      desc: 'Surplus rescued, meals served & certificate issued',
      icon: Award,
      time: donation.completedAt || pickup?.completedAt,
      isDone: donation.status === 'COMPLETED',
    },
  ];

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {stages.map((stage, idx) => {
        const Icon = stage.icon;
        const isDone = stage.isDone;

        return (
          <div key={stage.key} className="relative flex items-start gap-4">
            {/* Stage Icon Node */}
            <div
              className={`absolute -left-6 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                isDone
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-950/20'
                  : 'bg-white border-slate-300 text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Stage Details */}
            <div className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className={`text-xs sm:text-sm font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                  {stage.label}
                </h4>
                {stage.time && isDone && (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(stage.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {new Date(stage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DonationTimeline;
