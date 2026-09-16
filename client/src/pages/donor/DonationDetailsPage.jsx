import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Package, ShieldCheck, AlertTriangle,
  Edit2, Trash2, CheckCircle, Building, User, Phone, QrCode,
  Award, Camera, Flag, Heart, Sparkles, AlertCircle
} from 'lucide-react';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import DonationTimeline from '../../components/donations/DonationTimeline';
import PickupQRModal from '../../components/pickups/PickupQRModal';
import ScanQRModal from '../../components/pickups/ScanQRModal';
import CompletionCertificateModal from '../../components/common/CompletionCertificateModal';
import ReportDonationModal from '../../components/donations/ReportDonationModal';
import MapView from '../../components/map/MapView';
import DirectionsLink from '../../components/map/DirectionsLink';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const DonationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, isNgo, isDonor, isVolunteer, isAdmin } = useAuth();

  const [donation, setDonation] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [certData, setCertData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await donationService.getById(id);
      const data = res.data?.data?.donation || res.data?.data;
      setDonation(data);

      // Attempt to load associated pickup task if active
      if (['ASSIGNED', 'PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(data.status)) {
        try {
          const pickupRes = await pickupService.getAll();
          const pickups = pickupRes.data?.data?.pickups || [];
          const matched = pickups.find((p) => p.donation?._id === data._id || p.donation === data._id);
          if (matched) setPickup(matched);
        } catch {}
      }
    } catch (err) {
      toast.error('Failed to load donation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      await donationService.claim(id);
      toast.success('Food request submitted! A rescue pickup task has been created.');
      setClaimModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to request food');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await donationService.cancel(id);
      toast.success('Donation cancelled');
      setCancelModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to cancel donation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!pickup?._id) return;
    setActionLoading(true);
    try {
      await pickupService.confirmReceipt(pickup._id);
      toast.success('Food delivery confirmed! Rescue completed.');
      fetchDetails();
    } catch (err) {
      toast.error('Failed to confirm delivery receipt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCertificate = async () => {
    if (pickup?._id) {
      try {
        const res = await pickupService.getCertificate(pickup._id);
        setCertData(res.data?.data?.certificate);
        setCertModalOpen(true);
        return;
      } catch {}
    }

    // Fallback certificate generation
    setCertData({
      certificateId: `CERT-FR-${donation._id.substring(18).toUpperCase()}-2026`,
      donationId: donation._id,
      foodName: donation.title || donation.foodName,
      quantity: `${donation.quantity} ${donation.quantityUnit || 'meals'}`,
      donorName: donation.donor?.organizationName || donation.donor?.name || 'Community Donor',
      ngoName: donation.claimedBy?.organizationName || donation.claimedBy?.name || 'Partner NGO',
      volunteerName: donation.volunteer?.name || 'Community Volunteer',
      completedDate: donation.completedAt || donation.updatedAt,
      city: donation.location?.city || 'City Zone',
    });
    setCertModalOpen(true);
  };

  if (loading) return <LoadingSpinner message="Loading donation mission..." />;
  if (!donation) return null;

  const isOwner = user?._id === donation.donor?._id || user?._id === donation.donor;
  const isClaimedByMe = user?._id === donation.claimedBy?._id || user?._id === donation.claimedBy;
  const isAssignedVolunteer = user?._id === donation.volunteer?._id || user?._id === donation.volunteer;
  const isAuthorized = isOwner || isClaimedByMe || isAssignedVolunteer || isAdmin;

  // Compile image list
  const allImages = [];
  if (donation.imageUrl) allImages.push(donation.imageUrl);
  if (Array.isArray(donation.images)) {
    donation.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }
  if (allImages.length === 0) {
    allImages.push('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80');
  }

  const displayTitle = donation.title || donation.foodName || 'Surplus Food';
  const displayCity = donation.location?.city || 'Local Area';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Flag / Report Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors text-xs flex items-center gap-1.5"
            title="Report listing"
          >
            <Flag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Donor Actions */}
          {isOwner && (donation.status === 'ASSIGNED' || donation.status === 'CLAIMED') && (
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
            >
              <QrCode className="h-4 w-4 text-emerald-400" />
              Show Pickup QR Code
            </button>
          )}

          {/* Volunteer Actions */}
          {isVolunteer && (donation.status === 'ASSIGNED' || isAssignedVolunteer) && (
            <button
              onClick={() => setScanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Camera className="h-4 w-4" />
              Scan / Enter QR Code
            </button>
          )}

          {/* NGO Confirm Receipt Action */}
          {isNgo && donation.status === 'DELIVERED' && (
            <button
              onClick={handleConfirmReceipt}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Food Received
            </button>
          )}

          {/* Completed Certificate */}
          {donation.status === 'COMPLETED' && (
            <button
              onClick={handleViewCertificate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-md transition-all"
            >
              <Award className="h-4 w-4" />
              Rescue Certificate
            </button>
          )}

          {/* Cancel Button */}
          {isOwner && donation.status === 'AVAILABLE' && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
            >
              Cancel Listing
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Gallery + Info / Right Timeline & Pickup Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Details & Photos) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Image Showcase Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl">
            <div className="relative aspect-video bg-slate-900">
              <img
                src={allImages[activeImageIdx] || allImages[0]}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <StatusBadge status={donation.status} />
                {donation.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified by FoodRescue
                  </span>
                )}
              </div>
            </div>

            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="p-4 bg-slate-50 flex items-center gap-3 overflow-x-auto border-t border-slate-100">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIdx === idx ? 'border-emerald-600 scale-105 shadow' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Food Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {donation.dietaryType || 'Vegetarian'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                  {donation.foodCategory || donation.foodType || 'Cooked food'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                  Donor: {donation.donorType || 'Restaurant'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {displayTitle}
              </h1>
            </div>

            {/* Key Rescue Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">Quantity</span>
                <span className="text-lg font-black text-slate-900">
                  {donation.quantity} {donation.quantityUnit || 'meals'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Prepared Time</span>
                <span className="text-xs font-bold text-slate-800 block mt-1">
                  {new Date(donation.preparedAt || donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">Available Until</span>
                <span className="text-xs font-bold text-amber-900 block mt-1">
                  {new Date(donation.availableUntil || donation.pickupDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Description */}
            {donation.description && (
              <div className="space-y-1.5 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description & Handling</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {donation.description}
                </p>
              </div>
            )}

            {/* NGO Request CTA Button */}
            {isNgo && donation.status === 'AVAILABLE' && (
              <div className="pt-3">
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Request This Food Donation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Donation Journey Timeline & Pickup Information) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Timeline Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Donation Journey</h3>
            </div>

            <DonationTimeline donation={donation} pickup={pickup} />
          </div>

          {/* Pickup & Privacy Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Pickup Location Details
            </h3>

            {isAuthorized ? (
              /* Authorized View (Exact Address & Phone) */
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Donor Name / Org:</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {donation.donor?.organizationName || donation.donor?.name || 'Registered Food Donor'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Street Address:</span>
                  <p className="font-semibold text-slate-800">
                    {donation.location?.address}, {donation.location?.city} - {donation.location?.pincode}
                  </p>
                  {donation.pickupInstructions && (
                    <p className="text-emerald-700 mt-1">Instructions: {donation.pickupInstructions}</p>
                  )}
                </div>

                {donation.contactNumber && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block">Contact Phone:</span>
                      <p className="font-bold text-slate-900">{donation.contactNumber}</p>
                    </div>
                    <a
                      href={`tel:${donation.contactNumber}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500"
                    >
                      Call
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* Public / Protected View */
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="h-4 w-4 text-amber-700" />
                  Privacy Protection Active
                </div>
                <p>
                  Location is in <strong>{displayCity}</strong>. Exact street address and phone number are securely shared once an authorized NGO request is accepted.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {pickup && (
        <>
          <PickupQRModal
            isOpen={qrModalOpen}
            onClose={() => setQrModalOpen(false)}
            pickup={pickup}
          />
          <ScanQRModal
            isOpen={scanModalOpen}
            onClose={() => setScanModalOpen(false)}
            pickup={pickup}
            onPickupConfirmed={fetchDetails}
          />
        </>
      )}

      {certModalOpen && certData && (
        <CompletionCertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          data={certData}
        />
      )}

      {reportModalOpen && (
        <ReportDonationModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          donation={donation}
        />
      )}

      <ConfirmDialog
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onConfirm={handleClaim}
        title="Confirm Food Request"
        message={`Are you sure you want to request "${displayTitle}" (${donation.quantity} ${donation.quantityUnit}) for your NGO?`}
        confirmLabel="Submit Request"
      />

      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Donation"
        message="Are you sure you want to cancel this surplus food listing?"
        confirmLabel="Cancel Donation"
        variant="danger"
      />
    </div>
  );
};

export default DonationDetailsPage;
