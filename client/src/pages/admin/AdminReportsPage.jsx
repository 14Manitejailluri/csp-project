import React, { useEffect, useState } from 'react';
import { Flag, CheckCircle, AlertTriangle, ShieldCheck, Trash2, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getAll({ status: statusFilter });
      setReports(res.data?.data?.reports || []);
    } catch {
      toast.error('Failed to load donation reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (id, status) => {
    try {
      await reportService.resolve(id, { status, actionTaken: 'Reviewed by moderator' });
      toast.success(`Report marked as ${status}`);
      fetchReports();
    } catch {
      toast.error('Failed to resolve report');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Reported Listings & Moderation</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Review community flags for inaccurate details or food safety concerns.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['PENDING', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner message="Loading moderation flags..." />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports in this view"
          message="All community reports have been reviewed and resolved."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                  {r.reason}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Reported Donation:</p>
                <h4 className="font-bold text-slate-900 text-base">{r.donation?.title || 'Food Listing'}</h4>
                <p className="text-xs text-slate-500">
                  By: {r.donation?.donor?.organizationName || r.donation?.donor?.name || 'Donor'}
                </p>
              </div>

              {r.description && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <strong>Reporter Note:</strong> "{r.description}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {r.donation?._id && (
                  <Link
                    to={`/donor/donations/${r.donation._id}`}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Inspect Listing
                  </Link>
                )}

                {r.status === 'PENDING' && (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleResolve(r._id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(r._id, 'DISMISSED')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
