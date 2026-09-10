import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, Award, ShieldCheck, Download } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getPlatform()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodrescue-impact-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Impact & Platform Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Comprehensive analytics on food rescue, carbon offset, and community reach</p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export JSON Report
        </button>
      </div>

      {/* High-level stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rescued"
          value={stats?.totalRescuedKg ? `${stats.totalRescuedKg.toLocaleString()} kg` : '0 kg'}
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
          title="CO₂ Emissions Saved"
          value={stats?.co2SavedKg ? `${stats.co2SavedKg.toLocaleString()} kg` : '0 kg'}
          icon={Award}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Verified NGOs"
          value={stats?.verifiedNgos || 0}
          icon={ShieldCheck}
          color="amber"
          loading={loading}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating impact metrics..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Community Network Breakdown
            </h2>

            <div className="space-y-3 pt-2">
              {[
                { label: 'Food Donors', count: stats?.userBreakdown?.donor || 0, color: 'bg-emerald-500' },
                { label: 'NGO Partners', count: stats?.userBreakdown?.ngo || 0, color: 'bg-blue-500' },
                { label: 'Volunteers', count: stats?.userBreakdown?.volunteer || 0, color: 'bg-amber-500' },
                { label: 'Administrators', count: stats?.userBreakdown?.admin || 0, color: 'bg-purple-500' },
              ].map((item) => {
                const total = stats?.totalUsers || 1;
                const pct = Math.round((item.count / total) * 100) || 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>{item.label}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donation Status Distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Donation Lifecycle Distribution
            </h2>

            <div className="space-y-3 pt-2">
              {[
                { label: 'Delivered / Completed', count: stats?.statusBreakdown?.DELIVERED || 0, color: 'bg-teal-500' },
                { label: 'In Transit / Claimed', count: (stats?.statusBreakdown?.CLAIMED || 0) + (stats?.statusBreakdown?.PICKED_UP || 0), color: 'bg-amber-500' },
                { label: 'Available for Claim', count: stats?.statusBreakdown?.AVAILABLE || 0, color: 'bg-emerald-500' },
                { label: 'Cancelled / Expired', count: (stats?.statusBreakdown?.CANCELLED || 0) + (stats?.statusBreakdown?.EXPIRED || 0), color: 'bg-rose-400' },
              ].map((item) => {
                const total = stats?.totalDonations || 1;
                const pct = Math.round((item.count / total) * 100) || 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>{item.label}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
