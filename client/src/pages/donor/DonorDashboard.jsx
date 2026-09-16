import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { analyticsService } from '../../services/analyticsService';
import { donationService } from '../../services/donationService';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);

  useEffect(() => {
    analyticsService.getDonor()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    donationService.myDonations({ limit: 4, page: 1 })
      .then((r) => const d = r.data.data;
const list = Array.isArray(d) ? d : d?.donations || d?.items || [];
setRecentDonations(list);
      .catch(() => {})
      .finally(() => setLoadingDonations(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.name} 👋</p>
        </div>
        <Link
          to="/donor/donate"
          id="dashboard-create-donation-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-emerald-200"
        >
          <PlusCircle className="h-4 w-4" />
          Create Donation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Donations"
          value={stats?.totalDonations}
          icon={Package}
          color="emerald"
          loading={loadingStats}
        />
        <StatCard
          title="Delivered"
          value={stats?.delivered}
          icon={CheckCircle2}
          color="teal"
          loading={loadingStats}
        />
        <StatCard
          title="Active"
          value={stats?.active}
          icon={Clock}
          color="amber"
          loading={loadingStats}
        />
        <StatCard
          title="Meals Rescued"
          value={stats?.mealsRescued || stats?.totalServings}
          icon={TrendingUp}
          color="blue"
          loading={loadingStats}
        />
      </div>

      {/* Recent donations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Donations</h2>
          <Link to="/donor/my-donations" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All →
          </Link>
        </div>

        {loadingDonations ? (
          <LoadingSpinner />
        ) : recentDonations.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No donations yet"
            message="Create your first donation to start rescuing food."
            action={{ label: 'Create Donation', icon: PlusCircle, onClick: () => {} }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {recentDonations.map((d) => (
              <DonationCard key={d._id} donation={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
