import React, { useEffect, useState, useCallback } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, Check, X, Building, UserCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionModal, setActionModal] = useState({ open: false, type: '', user: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminService.getUsers(params);
      setUsers(res.data.data || []);
      setPagination({
        total: res.data.total || 0,
        pages: res.data.pages || 1,
      });
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleVerifyNgo = async () => {
    if (!actionModal.user?._id) return;
    setActionLoading(true);
    try {
      await adminService.verifyNgo(actionModal.user._id);
      toast.success('NGO verification status updated!');
      setActionModal({ open: false, type: '', user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update verification');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage donors, NGO partners, volunteers, and admins</p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or organization..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All Roles', value: '' },
            { label: 'Donors', value: 'donor' },
            { label: 'NGOs', value: 'ngo' },
            { label: 'Volunteers', value: 'volunteer' },
            { label: 'Admins', value: 'admin' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setRoleFilter(item.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === item.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Loading user records..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No users found"
              message="No platform users match your current filter settings."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                      {u.organizationName && (
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">Org: {u.organizationName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'ngo'
                            ? 'bg-blue-100 text-blue-700'
                            : u.role === 'volunteer'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'ngo' ? (
                        u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <ShieldAlert className="h-3.5 w-3.5" /> Unverified
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'ngo' && !u.isVerified && (
                        <button
                          onClick={() => setActionModal({ open: true, type: 'verify', user: u })}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                        >
                          Verify NGO
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing page {page} of {pagination.pages} ({pagination.total} total users)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      <ConfirmDialog
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: '', user: null })}
        onConfirm={handleVerifyNgo}
        title="Verify NGO Partner"
        message={`Confirm verification for "${actionModal.user?.organizationName || actionModal.user?.name}"? Once verified, they will be able to claim surplus food donations.`}
        confirmLabel="Confirm Verification"
        confirmVariant="primary"
        loading={actionLoading}
      />
    </div>
  );
};

export default UserManagementPage;
