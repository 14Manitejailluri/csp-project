import React, { useEffect, useState, useCallback } from 'react';
import { Package, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { donationService } from '../../services/donationService';
import DonationCard from '../../components/donations/DonationCard';
import DonationFilters from '../../components/donations/DonationFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MapView from '../../components/map/MapView';
import { getCurrentPosition } from '../../utils/geo';
import toast from 'react-hot-toast';

export const AvailableDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '', page: 1, limit: 12 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [userLoc, setUserLoc] = useState(null);
  const [claimModal, setClaimModal] = useState({ open: false, donation: null });
  const [claiming, setClaiming] = useState(false);

  const fetchAvailable = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (userLoc) {
        params.lat = userLoc.lat;
        params.lng = userLoc.lng;
        params.radiusKm = 50;
      }
      const res = await donationService.getAvailable(params);
      setDonations(res.data.data || []);
      setPagination({
        total: res.data.total || 0,
        pages: res.data.pages || 1,
      });
    } catch (err) {
      toast.error('Failed to load available donations');
    } finally {
      setLoading(false);
    }
  }, [filters, userLoc]);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  const handleUseLocation = async () => {
    try {
      const pos = await getCurrentPosition();
      setUserLoc(pos);
      toast.success('Sorted by distance from your location');
    } catch (err) {
      toast.error('Could not determine your location. Please check browser permissions.');
    }
  };

  const handleClaimClick = (donation) => {
    setClaimModal({ open: true, donation });
  };

  const confirmClaim = async () => {
    if (!claimModal.donation?._id) return;
    setClaiming(true);
    try {
      await donationService.claim(claimModal.donation._id);
      toast.success('Donation claimed! Head over to Claimed Donations to assign a volunteer.');
      setClaimModal({ open: false, donation: null });
      fetchAvailable();
    } catch (err) {
      toast.error(err.message || 'Failed to claim donation');
    } finally {
      setClaiming(false);
    }
  };

  const markers = donations
    .filter((d) => d.location?.coordinates)
    .map((d) => ({
      lat: d.location.coordinates[1],
      lng: d.location.coordinates[0],
      popup: `<b>${d.title}</b><br/>${d.quantity} ${d.unit} • ${d.category}`,
    }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Available Surplus Food</h1>
          <p className="text-slate-500 text-sm mt-0.5">Claim food donations to distribute to people in need</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseLocation}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
              userLoc
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Navigation className="h-4 w-4" />
            {userLoc ? 'Near Me (Active)' : 'Find Near Me'}
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DonationFilters
        filters={filters}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f, page: 1 }))}
        hideStatus={true}
      />

      {/* Map or Grid Content */}
      {loading ? (
        <LoadingSpinner message="Finding available donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No available donations"
          message="No active food donations found matching your criteria. Check back soon or widen your filters."
        />
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <MapView
            markers={markers}
            center={userLoc ? [userLoc.lat, userLoc.lng] : undefined}
            zoom={userLoc ? 12 : 6}
            height="480px"
          />
          <p className="text-xs text-slate-400 text-center">
            Showing {markers.length} pinned donation locations on map
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {donations.map((d) => (
              <DonationCard
                key={d._id}
                donation={d}
                showActions={true}
                actionLabel="Claim Food"
                onAction={() => handleClaimClick(d)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500 px-3">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                disabled={filters.page >= pagination.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Claim Confirmation Dialog */}
      <ConfirmDialog
        isOpen={claimModal.open}
        onClose={() => setClaimModal({ open: false, donation: null })}
        onConfirm={confirmClaim}
        title="Claim Food Donation"
        message={`Are you sure you want to claim "${claimModal.donation?.title}"? You will be responsible for picking up ${claimModal.donation?.quantity} ${claimModal.donation?.unit} before expiration.`}
        confirmLabel="Yes, Claim Food"
        confirmVariant="primary"
        loading={claiming}
      />
    </div>
  );
};

export default AvailableDonationsPage;
