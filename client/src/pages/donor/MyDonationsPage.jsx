import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package } from 'lucide-react';
import { donationService } from '../../services/donationService';
import DonationCard from '../../components/donations/DonationCard';
import DonationFilters from '../../components/donations/DonationFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export const MyDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1, limit: 12 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [cancelling, setCancelling] = useState(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donationService.myDonations(filters);
      // paginated response: { data: [...], pagination: { total, totalPages, page, limit } }
      setDonations(Array.isArray(res.data.data) ? res.data.data : []);
      setPagination({
        total: res.data.pagination?.total || 0,
        pages: res.data.pagination?.totalPages || 1,
      });
    } catch (err) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleCancelClick = (id) => {
    setCancelModal({ open: true, id });
  };

  const confirmCancel = async () => {
    if (!cancelModal.id) return;
    setCancelling(true);
    try {
      await donationService.cancel(cancelModal.id);
      toast.success('Donation cancelled successfully');
      setCancelModal({ open: false, id: null });
      fetchDonations();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel donation');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Donations</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track your posted food listings</p>
        </div>
        <Link
          to="/donor/donate"
          id="create-donation-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-emerald-200"
        >
          <PlusCircle className="h-4 w-4" />
          Create Donation
        </Link>
      </div>

      {/* Filters */}
      <DonationFilters filters={filters} onChange={handleFilterChange} />

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading your donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No donations found"
          message={
            filters.status || filters.category || filters.search
              ? 'Try adjusting your filters to find what you are looking for.'
              : 'You have not created any food donations yet.'
          }
          action={
            !filters.status && !filters.category && !filters.search
              ? {
                  label: 'Post First Donation',
                  icon: PlusCircle,
                  onClick: () => (window.location.href = '/donor/donate'),
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {donations.map((item) => (
              <DonationCard
                key={item._id}
                donation={item}
                showActions={true}
                onCancel={handleCancelClick}
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

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, id: null })}
        onConfirm={confirmCancel}
        title="Cancel Donation"
        message="Are you sure you want to cancel this donation? This action cannot be undone."
        confirmLabel="Yes, Cancel Donation"
        confirmVariant="danger"
        loading={cancelling}
      />
    </div>
  );
};

export default MyDonationsPage;
