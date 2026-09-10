import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { adminService } from '../../services/adminService';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingNgos, setPendingNgos] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      analyticsService.getPlatform().then((r) => setStats(r.data.data)).catch(() => {}),
      adminService.getUsers({ role: 'ngo', isVerified: 'false', limit: 5 }).then((r) => setPendingNgos(r.data.data || [])).catch(() => {}),
      adminService.getDonations({ limit: 5 }).then((r) => setRecentDonations(r.data.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyNgo = async (userId) => {
    setVerifyingId(userId);
    try {
      await adminService.verifyNgo(userId);
      toast.success('NGO verified successfully');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to verify NGO');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview, pending verifications, and system health</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Donations"
          value={stats?.totalDonations}
          icon={Package}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Meals Rescued"
          value={stats?.totalMealsRescued || stats?.totalServings}
          icon={TrendingUp}
          color="teal"
          loading={loading}
        />
        <StatCard
          title="Pending NGOs"
          value={pendingNgos.length}
          icon={ShieldCheck}
          color="amber"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending NGO Verifications */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              Pending NGO Verifications
            </h2>
            <Link to="/admin/users" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              Manage Users →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : pendingNgos.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              All NGOs are verified! No pending requests.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingNgos.map((ngo) => (
                <div key={ngo._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{ngo.organizationName || ngo.name}</p>
                    <p className="text-xs text-slate-400 truncate">{ngo.email} • Joined {formatDate(ngo.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleVerifyNgo(ngo._id)}
                    disabled={verifyingId === ngo._id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {verifyingId === ngo._id ? 'Verifying...' : 'Verify NGO'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Platform Donations */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Recent Platform Activity
            </h2>
            <Link to="/admin/donations" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              All Donations →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : recentDonations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No recent donations found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDonations.map((d) => (
                <div key={d._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{d.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {d.quantity} {d.unit} • by {d.donor?.name || 'Donor'}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
