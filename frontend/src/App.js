import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import IntroductionFlowPage from './pages/IntroductionFlowPage';
import IntroductionsPage from './pages/IntroductionsPage';
import TaxCenterPage from './pages/TaxCenterPage';
import NetworkPage from './pages/NetworkPage';
import CommissionsPage from './pages/CommissionsPage';
import EducationPage from './pages/EducationPage';
import AdminPage from './pages/AdminPage';
import SubmissionPage from './pages/SubmissionPage';

import ConciergePage from './pages/ConciergePage';

import './App.css';

function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id (OAuth callback)
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/submit" element={<SubmissionPage />} />

      {/* Protected routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/marketplace" element={
        <ProtectedRoute>
          <MarketplacePage />
        </ProtectedRoute>
      } />
      <Route path="/concierge/:accountId" element={
        <ProtectedRoute>
          <ConciergePage />
        </ProtectedRoute>
      } />
      <Route path="/introductions/new" element={
        <ProtectedRoute>
          <IntroductionFlowPage />
        </ProtectedRoute>
      } />
      <Route path="/introductions" element={
        <ProtectedRoute>
          <IntroductionsPage />
        </ProtectedRoute>
      } />
      <Route path="/tax-center" element={
        <ProtectedRoute>
          <TaxCenterPage />
        </ProtectedRoute>
      } />
      <Route path="/network" element={
        <ProtectedRoute>
          <NetworkPage />
        </ProtectedRoute>
      } />
      <Route path="/commissions" element={
        <ProtectedRoute>
          <CommissionsPage />
        </ProtectedRoute>
      } />
      <Route path="/education" element={
        <ProtectedRoute>
          <EducationPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
