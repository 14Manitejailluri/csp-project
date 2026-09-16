import React, { useEffect, useState, useCallback } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, UserCheck } from 'lucide-react';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import DonationCard from '../../components/donations/DonationCard';
import DonationFilters from '../../components/donations/DonationFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const ClaimedDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1, limit: 12 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchClaimed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donationService.myClaimed(filters);
      const items = res.data.data?.claims || (Array.isArray(res.data.data) ? res.data.data : []);
      setDonations(items);
      setPagination({
        total: res.data.pagination?.total || res.data.total || items.length,
        pages: res.data.pagination?.totalPages || res.data.pages || 1,
      });
    } catch (err) {
      toast.error('Failed to load claimed donations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClaimed();
  }, [fetchClaimed]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Claimed Donations</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track and coordinate pickups for food you've claimed</p>
      </div>

      {/* Filters */}
      <DonationFilters
        filters={filters}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f, page: 1 }))}
      />

      {/* Grid Content */}
      {loading ? (
        <LoadingSpinner message="Loading your claimed donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No claimed donations"
          message={
            filters.status || filters.category || filters.search
              ? 'No claimed donations match your selected filters.'
              : 'You have not claimed any donations yet.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {donations.map((d) => (
              <DonationCard key={d._id} donation={d.donation || d} />
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
    </div>
  );
};

export default ClaimedDonationsPage;
