import React, { useEffect, useState, useCallback } from 'react';
import { Truck, CheckCircle2, Clock } from 'lucide-react';
import { pickupService } from '../../services/pickupService';
import PickupTaskCard from '../../components/pickups/PickupTaskCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const MyDeliveriesPage = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await pickupService.myPickups(params);
      setPickups(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load your deliveries');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchMyDeliveries();
  }, [fetchMyDeliveries]);

  const handleUpdateStatus = async (pickupId, nextAction) => {
    setActionLoading(true);
    try {
      if (nextAction === 'picked-up') {
        await pickupService.markPickedUp(pickupId);
        toast.success('Status updated to Picked Up!');
      } else if (nextAction === 'delivered') {
        await pickupService.markDelivered(pickupId);
        toast.success('Status updated to Delivered! Great job!');
      }
      fetchMyDeliveries();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Deliveries</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage your volunteer rescue missions</p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { label: 'All', value: '' },
            { label: 'Assigned', value: 'ASSIGNED' },
            { label: 'In Transit', value: 'PICKED_UP' },
            { label: 'Completed', value: 'DELIVERED' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

      {/* List */}
      {loading ? (
        <LoadingSpinner message="Loading your deliveries..." />
      ) : pickups.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No deliveries found"
          message={
            statusFilter
              ? 'No missions match the selected status filter.'
              : 'You have not accepted any pickup missions yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pickups.map((p) => (
            <PickupTaskCard
              key={p._id}
              pickup={p}
              onUpdateStatus={handleUpdateStatus}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDeliveriesPage;
