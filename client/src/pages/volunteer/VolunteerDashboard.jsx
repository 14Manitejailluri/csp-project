import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, Clock, MapPin, TrendingUp } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { analyticsService } from '../../services/analyticsService';
import { pickupService } from '../../services/pickupService';
import PickupTaskCard from '../../components/pickups/PickupTaskCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      analyticsService.getVolunteer().then((r) => {
        // getVolunteerAnalytics returns { stats: { availablePickups, activePickups, completedPickups, ... } }
        const d = r.data.data;
        setStats(d?.stats || d || null);
      }).catch(() => {}),
      pickupService.myPickups({ status: 'ASSIGNED,PICKED_UP', limit: 4 }).then((r) => setActiveTasks(r.data.data?.pickups || (Array.isArray(r.data.data) ? r.data.data : []))).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (pickupId, nextAction) => {
    setActionLoading(true);
    try {
      if (nextAction === 'picked-up') {
        await pickupService.markPickedUp(pickupId);
        toast.success('Pickup confirmed! Proceed to delivery destination.');
      } else if (nextAction === 'delivered') {
        await pickupService.markDelivered(pickupId);
        toast.success('Delivery completed! Thank you for rescuing food!');
      }
      fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Volunteer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.name} 👋 Ready to deliver hope?</p>
        </div>
        <Link
          to="/volunteer/available"
          id="volunteer-available-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-emerald-200"
        >
          <Truck className="h-4 w-4" />
          Find Available Tasks
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={stats?.totalDeliveries}
          icon={Truck}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Active Missions"
          value={stats?.activePickups}
          icon={Clock}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Completed Deliveries"
          value={stats?.completedPickups}
          icon={CheckCircle2}
          color="teal"
          loading={loading}
        />
        <StatCard
          title="Total Rescued (kg)"
          value={stats?.foodRescuedKg != null ? `${stats.foodRescuedKg} kg` : '0 kg'}
          icon={TrendingUp}
          color="emerald"
          loading={loading}
        />
      </div>

      {/* Active Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Active Missions</h2>
            <p className="text-xs text-slate-500">Pickups currently assigned to you</p>
          </div>
          <Link to="/volunteer/deliveries" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Delivery History →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : activeTasks.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No active missions"
            message="You don't have any active pickup tasks right now. Browse available food runs to help!"
            action={{
              label: 'Browse Available Runs',
              icon: Truck,
              onClick: () => (window.location.href = '/volunteer/available'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTasks.map((t) => (
              <PickupTaskCard
                key={t._id}
                pickup={t}
                onUpdateStatus={handleUpdateStatus}
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
