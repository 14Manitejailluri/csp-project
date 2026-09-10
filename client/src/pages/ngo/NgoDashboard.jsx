import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle2, Clock, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { analyticsService } from '../../services/analyticsService';
import { donationService } from '../../services/donationService';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const NgoDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [claimedDonations, setClaimedDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getNgo().then((r) => setStats(r.data.data)).catch(() => {}),
      donationService.getAvailable({ limit: 4 }).then((r) => setAvailableDonations(r.data.data || [])).catch(() => {}),
      donationService.myClaimed({ limit: 4 }).then((r) => setClaimedDonations(r.data.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">NGO Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {user?.organizationName ? `${user.organizationName} — ` : ''}Welcome back, {user?.name} 👋
          </p>
        </div>
        <Link
          to="/ngo/available"
          id="ngo-find-food-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-emerald-200"
        >
          <Package className="h-4 w-4" />
          Browse Available Food
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Claimed Total"
          value={stats?.totalClaimed}
          icon={Package}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="In Transit / Picked"
          value={stats?.inProgress}
          icon={Clock}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Successfully Received"
          value={stats?.delivered}
          icon={CheckCircle2}
          color="teal"
          loading={loading}
        />
        <StatCard
          title="Meals Distributed"
          value={stats?.mealsDistributed || stats?.totalServings}
          icon={TrendingUp}
          color="emerald"
          loading={loading}
        />
      </div>

      {/* Available food nearby */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Available For Claim</h2>
            <p className="text-xs text-slate-500">Fresh listings ready for immediate claim</p>
          </div>
          <Link to="/ngo/available" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : availableDonations.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No available donations"
            message="There are currently no fresh surplus food listings available."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {availableDonations.map((d) => (
              <DonationCard key={d._id} donation={d} />
            ))}
          </div>
        )}
      </div>

      {/* Claimed in progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Your Active Claims</h2>
            <p className="text-xs text-slate-500">Food you've claimed that is being picked up or delivered</p>
          </div>
          <Link to="/ngo/claimed" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : claimedDonations.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No active claims"
            message="Browse available food to claim surplus supplies for your community."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {claimedDonations.map((d) => (
              <DonationCard key={d._id} donation={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoDashboard;
