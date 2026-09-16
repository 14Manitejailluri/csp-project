import React, { useState } from 'react';
import {
  Truck, MapPin, Clock, CheckCircle2, Package, Loader2,
  Camera, QrCode, Award, Navigation, Building2, User
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import DirectionsLink from '../map/DirectionsLink';
import ScanQRModal from './ScanQRModal';
import CompletionCertificateModal from '../common/CompletionCertificateModal';
import { pickupService } from '../../services/pickupService';
import toast from 'react-hot-toast';

export const PickupTaskCard = ({ pickup, onRefresh }) => {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [delivering, setDelivering] = useState(false);

  const donation = pickup?.donation;
  const foodTitle = donation?.title || donation?.foodName || 'Surplus Food';
  const isAssigned = pickup.status === 'ASSIGNED';
  const isPickedUp = pickup.status === 'PICKED_UP';
  const isDelivered = pickup.status === 'DELIVERED';
  const isCompleted = pickup.status === 'COMPLETED';

  const handleDeliver = async (e) => {
    e?.preventDefault();
    setDelivering(true);
    try {
      await pickupService.markDelivered(pickup._id, {
        deliveryProofPhoto: deliveryPhoto,
        proofImageUrl: deliveryPhoto,
        notes: deliveryNotes.trim(),
      });
      toast.success('Food marked as Delivered to NGO shelter! Outstanding job!');
      setDeliveryModalOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      toast.error('Failed to update delivery status');
    } finally {
      setDelivering(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 space-y-4 text-left">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
              Rescue Mission #{pickup._id.substring(18).toUpperCase()}
            </span>
            <h3 className="font-bold text-slate-900 text-lg">{foodTitle}</h3>
            <p className="text-xs text-slate-500">
              {donation?.dietaryType || 'Vegetarian'} • {donation?.quantity} {donation?.quantityUnit || 'meals'}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isCompleted
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : isDelivered
                ? 'bg-teal-100 text-teal-800'
                : isPickedUp
                ? 'bg-blue-100 text-blue-800 animate-pulse'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {isCompleted
              ? '✓ COMPLETED'
              : isDelivered
              ? '✓ DELIVERED'
              : isPickedUp
              ? '🚚 IN TRANSIT'
              : 'ASSIGNED'}
          </span>
        </div>

        {/* Addresses Grid (Pickup & Drop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Pickup Address */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-600" />
              1. Pickup Location (Donor)
            </span>
            <p className="font-bold text-slate-900">
              {pickup.donor?.organizationName || pickup.donor?.name || 'Donor Location'}
            </p>
            <p className="text-slate-600">
              {pickup.pickupAddress?.address}, {pickup.pickupAddress?.city}
            </p>
          </div>

          {/* Delivery Drop */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
              <Building2 className="h-3 w-3 text-blue-600" />
              2. Drop Shelter (NGO)
            </span>
            <p className="font-bold text-slate-900">
              {pickup.ngo?.organizationName || pickup.ngo?.name || 'NGO Distribution Center'}
            </p>
            <p className="text-slate-600">
              {pickup.deliveryAddress?.address || pickup.ngo?.location?.address || 'NGO Shelter Point'}, {pickup.deliveryAddress?.city || pickup.pickupAddress?.city}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Step 1: Scan QR */}
          {isAssigned && (
            <button
              onClick={() => setScanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <QrCode className="h-4 w-4" />
              Scan Pickup QR
            </button>
          )}

          {/* Step 2: Mark Delivered with photo proof */}
          {isPickedUp && (
            <button
              onClick={() => setDeliveryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Delivered + Upload Proof
            </button>
          )}

          {/* Certificate */}
          {isCompleted && (
            <button
              onClick={() => setCertModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Award className="h-4 w-4" />
              View Certificate
            </button>
          )}

          {donation?.location?.coordinates && (
            <DirectionsLink
              toLat={donation.location.coordinates[1]}
              toLng={donation.location.coordinates[0]}
            />
          )}
        </div>
      </div>

      {/* Scan QR Modal */}
      {scanModalOpen && (
        <ScanQRModal
          isOpen={scanModalOpen}
          onClose={() => setScanModalOpen(false)}
          pickup={pickup}
          onPickupConfirmed={onRefresh}
        />
      )}

      {/* Delivery Confirmation Modal */}
      {deliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-black text-slate-900">Delivery to NGO Shelter</h3>
            <p className="text-xs text-slate-500">
              Confirm that {foodTitle} has arrived safely at {pickup.ngo?.organizationName || pickup.ngo?.name}.
            </p>

            <form onSubmit={handleDeliver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Delivery Proof Photo URL (Optional / Recommended)
                </label>
                <input
                  type="url"
                  value={deliveryPhoto}
                  onChange={(e) => setDeliveryPhoto(e.target.value)}
                  placeholder="https://... (photo at NGO shelter)"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setDeliveryPhoto('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=80')}
                  className="text-[11px] text-blue-600 hover:underline mt-1 font-medium"
                >
                  Use Sample Proof Photo
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Delivery Remarks
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Handed over to shelter coordinator..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={delivering}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  {delivering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certModalOpen && (
        <CompletionCertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          data={{
            certificateId: `CERT-${pickup._id.substring(18).toUpperCase()}-2026`,
            donationId: donation?._id,
            foodName: foodTitle,
            quantity: `${donation?.quantity} ${donation?.quantityUnit || 'meals'}`,
            donorName: pickup.donor?.organizationName || pickup.donor?.name || 'Food Donor',
            ngoName: pickup.ngo?.organizationName || pickup.ngo?.name || 'Partner NGO',
            volunteerName: pickup.volunteer?.name || 'Hero Volunteer',
            completedDate: pickup.completedAt || pickup.deliveredAt || new Date(),
            city: pickup.pickupAddress?.city || 'Community Zone',
          }}
        />
      )}
    </>
  );
};

export default PickupTaskCard;
