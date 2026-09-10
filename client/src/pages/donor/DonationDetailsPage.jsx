import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  ShieldCheck,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle,
  Building,
  User,
  Phone,
} from 'lucide-react';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import DonationTimeline from '../../components/donations/DonationTimeline';
import MapView from '../../components/map/MapView';
import DirectionsLink from '../../components/map/DirectionsLink';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, getStorageLabel } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const DonationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await donationService.getById(id);
      setDonation(res.data.data);
    } catch (err) {
      toast.error('Failed to load donation details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await donationService.cancel(id);
      toast.success('Donation cancelled successfully');
      setCancelModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel donation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      await donationService.claim(id);
      toast.success('Donation claimed successfully!');
      setClaimModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to claim donation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading donation details..." />;
  if (!donation) return null;

  const isOwner = user?._id === donation.donor?._id || user?._id === donation.donor;
  const isNgo = user?.role === 'ngo';
  const isVolunteer = user?.role === 'volunteer';
  const canEdit = isOwner && donation.status === 'AVAILABLE';
  const canCancel = (isOwner || user?.role === 'admin') && ['AVAILABLE', 'CLAIMED'].includes(donation.status);
  const canClaim = isNgo && donation.status === 'AVAILABLE';

  const marker = donation.location?.coordinates
    ? [
        {
          lat: donation.location.coordinates[1],
          lng: donation.location.coordinates[0],
          popup: donation.title,
        },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              to={`/donor/edit/${donation._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="h-4 w-4 text-slate-500" />
              Edit
            </Link>
          )}

          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Cancel Donation
            </button>
          )}

          {canClaim && (
            <button
              onClick={() => setClaimModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <CheckCircle className="h-4 w-4" />
              Claim Food
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {donation.category}
                </span>
                <h1 className="text-2xl font-bold text-slate-800 mt-2">{donation.title}</h1>
              </div>
              <StatusBadge status={donation.status} size="lg" />
            </div>

            {donation.description && (
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {donation.description}
              </p>
            )}

            {/* Images */}
            {donation.images && donation.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {donation.images.map((img, idx) => (
                  <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img
                      src={img.url}
                      alt={donation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Key specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Quantity</p>
                <p className="text-base font-semibold text-slate-800 mt-0.5">
                  {donation.quantity} {donation.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Storage Condition</p>
                <p className="text-base font-semibold text-slate-800 mt-0.5">
                  {getStorageLabel(donation.storageCondition)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Expires At</p>
                <p className="text-base font-semibold text-rose-600 mt-0.5">
                  {formatDate(donation.expiresAt)}
                </p>
              </div>
            </div>

            {/* Dietary & Allergens */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Dietary & Safety</h3>
              <div className="flex flex-wrap gap-2">
                {donation.isVegetarian && (
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200">
                    🥦 Vegetarian
                  </span>
                )}
                {donation.isVegan && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
                    🌱 Vegan
                  </span>
                )}
                {donation.isHalal && (
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium border border-teal-200">
                    ☪️ Halal
                  </span>
                )}
                {donation.allergens && donation.allergens.length > 0 && (
                  donation.allergens.map((alg) => (
                    <span
                      key={alg}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium border border-rose-200"
                    >
                      ⚠️ Contains {alg}
                    </span>
                  ))
                )}
                {!donation.isVegetarian && !donation.isVegan && !donation.isHalal && (!donation.allergens || donation.allergens.length === 0) && (
                  <span className="text-xs text-slate-400">Standard / No special dietary tags specified</span>
                )}
              </div>
            </div>

            {/* Pickup Instructions */}
            {donation.pickupInstructions && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Pickup Instructions</h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {donation.pickupInstructions}
                </p>
              </div>
            )}
          </div>

          {/* Location & Map */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Pickup Location
              </h2>
              {donation.location?.coordinates && (
                <DirectionsLink
                  toLat={donation.location.coordinates[1]}
                  toLng={donation.location.coordinates[0]}
                />
              )}
            </div>

            <p className="text-sm text-slate-600">
              {[donation.address?.street, donation.address?.city, donation.address?.state, donation.address?.pincode]
                .filter(Boolean)
                .join(', ') || 'Address provided upon assignment'}
            </p>

            {marker.length > 0 && (
              <MapView markers={marker} zoom={15} height="240px" />
            )}
          </div>
        </div>

        {/* Sidebar info & timeline */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Tracking Timeline
            </h2>
            <DonationTimeline status={donation.status} history={donation.statusHistory || []} />
          </div>

          {/* Parties involved */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Parties Involved</h2>

            {/* Donor */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <User className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-400">DONOR</p>
                <p className="text-sm font-medium text-slate-800">{donation.donor?.name || 'Anonymous Donor'}</p>
                {donation.donor?.phone && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" /> {donation.donor.phone}
                  </p>
                )}
              </div>
            </div>

            {/* NGO */}
            {donation.claimedBy && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60">
                <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-400">CLAIMED BY NGO</p>
                  <p className="text-sm font-medium text-slate-800">
                    {donation.claimedBy?.organizationName || donation.claimedBy?.name || 'NGO Partner'}
                  </p>
                  {donation.claimedBy?.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {donation.claimedBy.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Donation"
        message="Are you sure you want to cancel this donation listing? It will no longer be available for collection."
        confirmLabel="Yes, Cancel Donation"
        confirmVariant="danger"
        loading={actionLoading}
      />

      {/* Claim modal */}
      <ConfirmDialog
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onConfirm={handleClaim}
        title="Claim Food Donation"
        message="Confirm claiming this donation for your organization. You will be responsible for coordinating the pickup before it expires."
        confirmLabel="Confirm Claim"
        confirmVariant="primary"
        loading={actionLoading}
      />
    </div>
  );
};

export default DonationDetailsPage;
