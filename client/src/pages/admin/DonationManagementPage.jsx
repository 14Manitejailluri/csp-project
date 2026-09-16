import React, { useEffect, useState, useCallback } from 'react';
import {
  Package, Search, Trash2, Eye, ShieldCheck, XCircle,
  CheckCircle2, AlertCircle, Image as ImageIcon, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const DonationManagementPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, title: '' });
  const [rejectionReason, setRejectionReason] = useState('Photo unclear or packaging not visible');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminService.getDonations(params);
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setDonations(items);
      setPagination({
        total: res.data?.pagination?.total || items.length,
        pages: res.data?.pagination?.totalPages || 1,
      });
    } catch {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleVerify = async (id) => {
    try {
      await adminService.verifyDonation(id);
      toast.success('Donation verified! Listing is active for NGOs.');
      fetchDonations();
    } catch {
      toast.error('Failed to verify donation');
    }
  };

  const handleReject = async (e) => {
    e?.preventDefault();
    if (!rejectModal.id) return;
    setActionLoading(true);
    try {
      await adminService.rejectDonation(rejectModal.id, rejectionReason);
      toast.success('Donation marked as Rejected with feedback');
      setRejectModal({ open: false, id: null, title: '' });
      fetchDonations();
    } catch {
      toast.error('Failed to reject donation');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Donation Oversight & Safety Verification</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Review uploaded food photos, verify safety declarations, or provide rejection feedback.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Safety Guidance:</strong> Photo verification confirms that the submitted donation information and image were reviewed. It does not replace proper food-safety judgment.
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by food name, donor, city..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All', value: '' },
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'Pending / Verified', value: 'VERIFIED' },
            { label: 'Claimed', value: 'CLAIMED' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Rejected', value: 'REJECTED' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setStatusFilter(item.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === item.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingSpinner message="Loading platform donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No donations found"
          message="Try changing the search query or status filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Food & Photos</th>
                  <th className="px-4 py-4">Donor / Org</th>
                  <th className="px-4 py-4">Volume</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Food & Photo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {d.imageUrl || d.images?.[0] ? (
                          <img
                            src={d.imageUrl || d.images[0]}
                            alt={d.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{d.title || d.foodName}</p>
                          <p className="text-slate-400 text-[11px]">{d.foodCategory || d.foodType} • {d.dietaryType || 'Veg'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Donor */}
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{d.donor?.organizationName || d.donor?.name || 'Donor'}</p>
                      <p className="text-slate-400 text-[11px]">{d.location?.city}</p>
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-4 font-bold text-slate-800">
                      {d.quantity} {d.quantityUnit || 'meals'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={d.status} />
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {d.verificationStatus === 'REJECTED' ? '✕ REJECTED' : '✓ VERIFIED'}
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/donor/donations/${d._id}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {d.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerify(d._id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verify
                          </button>
                        )}

                        {d.status !== 'REJECTED' && d.status !== 'COMPLETED' && (
                          <button
                            onClick={() => setRejectModal({ open: true, id: d._id, title: d.title || d.foodName })}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
                            title="Reject Listing with reason"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Reject Food Listing</h3>
            <p className="text-xs text-slate-500">
              Provide feedback for <strong className="text-slate-800">{rejectModal.title}</strong> so the donor can rectify it.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="Photo unclear or packaging not visible">Photo unclear or packaging not visible</option>
                  <option value="Information incomplete or quantity ambiguous">Information incomplete or quantity ambiguous</option>
                  <option value="Shelf-life deadline passed or insufficient">Shelf-life deadline passed or insufficient</option>
                  <option value="Does not meet FoodRescue safety guidelines">Does not meet FoodRescue safety guidelines</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, id: null, title: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow flex items-center gap-1"
              >
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagementPage;
