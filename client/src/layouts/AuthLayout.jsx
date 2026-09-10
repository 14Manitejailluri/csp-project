import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const AuthLayout = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (isAuthenticated) {
    const dashboardRoutes = {
      donor: '/donor/dashboard',
      ngo: '/ngo/dashboard',
      volunteer: '/volunteer/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardRoutes[role] || '/'} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <span className="text-3xl">🍀</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FoodRescue</h1>
          <p className="text-emerald-200 mt-1 text-sm">Connecting surplus food with communities in need</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
