import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/routes';
import { PageLoader } from './components/ui';

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const PublicServices = lazy(() => import('./pages/public/PublicServices'));
const PlatformServices = lazy(() => import('./pages/public/PlatformServices'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/public/TermsOfService'));
const RefundPolicy = lazy(() => import('./pages/public/RefundPolicy'));
const Contact = lazy(() => import('./pages/public/Contact'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// User Pages
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const NewOrder = lazy(() => import('./pages/user/NewOrder'));
const Orders = lazy(() => import('./pages/user/Orders'));
const Services = lazy(() => import('./pages/user/Services'));
const AddFunds = lazy(() => import('./pages/user/AddFunds'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Notifications = lazy(() => import('./pages/user/Notifications'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminAddFunds = lazy(() => import('./pages/admin/AdminAddFunds'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminFundRequests = lazy(() => import('./pages/admin/AdminFundRequests'));
const AdminPaymentMethods = lazy(() => import('./pages/admin/AdminPaymentMethods'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminProviders = lazy(() => import('./pages/admin/AdminProviders'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Home Page - Always accessible */}
        <Route path="/" element={<Home />} />
        
        {/* Public Services Pages */}
        <Route path="/services" element={<PublicServices />} />
        <Route path="/services/:platform" element={<PlatformServices />} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact" element={<Contact />} />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-order" element={<NewOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/my-services" element={<Services />} />
            <Route path="/add-funds" element={<AddFunds />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/fund-requests" element={<AdminFundRequests />} />
            <Route path="/admin/payment-methods" element={<AdminPaymentMethods />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/add-funds" element={<AdminAddFunds />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
