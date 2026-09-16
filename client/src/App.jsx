import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ImpactPage from './pages/ImpactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';

// Donor pages
import DonorDashboard from './pages/donor/DonorDashboard';
import CreateDonationPage from './pages/donor/CreateDonationPage';
import EditDonationPage from './pages/donor/EditDonationPage';
import MyDonationsPage from './pages/donor/MyDonationsPage';
import DonationDetailsPage from './pages/donor/DonationDetailsPage';

// NGO pages
import NgoDashboard from './pages/ngo/NgoDashboard';
import AvailableDonationsPage from './pages/ngo/AvailableDonationsPage';
import ClaimedDonationsPage from './pages/ngo/ClaimedDonationsPage';
import SavedDonationsPage from './pages/ngo/SavedDonationsPage';

// Volunteer pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import AvailablePickupsPage from './pages/volunteer/AvailablePickupsPage';
import MyDeliveriesPage from './pages/volunteer/MyDeliveriesPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import DonationManagementPage from './pages/admin/DonationManagementPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        {/* Public landing, about, impact & public help */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Shared Authenticated Routes (Profile & Help inside DashboardLayout) */}
        <Route element={<DashboardLayout allowedRoles={['donor', 'ngo', 'volunteer', 'admin']} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Donor routes */}
        <Route
          path="/donor"
          element={<DashboardLayout allowedRoles={['donor']} />}
        >
          <Route index element={<Navigate to="/donor/dashboard" replace />} />
          <Route path="dashboard" element={<DonorDashboard />} />
          <Route path="donate" element={<CreateDonationPage />} />
          <Route path="my-donations" element={<MyDonationsPage />} />
          <Route path="donations/:id" element={<DonationDetailsPage />} />
          <Route path="edit/:id" element={<EditDonationPage />} />
        </Route>

        {/* NGO routes */}
        <Route
          path="/ngo"
          element={<DashboardLayout allowedRoles={['ngo']} />}
        >
          <Route index element={<Navigate to="/ngo/dashboard" replace />} />
          <Route path="dashboard" element={<NgoDashboard />} />
          <Route path="available" element={<AvailableDonationsPage />} />
          <Route path="claimed" element={<ClaimedDonationsPage />} />
          <Route path="saved" element={<SavedDonationsPage />} />
          <Route path="donations/:id" element={<DonationDetailsPage />} />
        </Route>

        {/* Volunteer routes */}
        <Route
          path="/volunteer"
          element={<DashboardLayout allowedRoles={['volunteer']} />}
        >
          <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
          <Route path="dashboard" element={<VolunteerDashboard />} />
          <Route path="available" element={<AvailablePickupsPage />} />
          <Route path="deliveries" element={<MyDeliveriesPage />} />
          <Route path="donations/:id" element={<DonationDetailsPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={<DashboardLayout allowedRoles={['admin']} />}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="donations" element={<DonationManagementPage />} />
          <Route path="moderation" element={<AdminReportsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;