import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './layouts/SidebarLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import LandlordDashboard from './pages/landlord/Dashboard';
import TenantDirectory from './pages/landlord/TenantDirectory';
import MyProperties from './pages/landlord/MyProperties';
import LandlordProfile from './pages/landlord/LandlordProfile';
import AddProperty from './pages/landlord/AddProperty';
import LeaseRequests from './pages/landlord/LeaseRequests';
import LandlordPayments from './pages/landlord/Payments';
import LandlordDocuments from './pages/landlord/Documents';
import TenantDashboard from './pages/tenant/Dashboard';
import TenantPayments from './pages/tenant/Payments';
import TenantProfile from './pages/tenant/TenantProfile';
import RentProperty from './pages/tenant/RentProperty';
import MyLease from './pages/tenant/MyLease';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFlats from './pages/admin/Flats';
import AdminVerifications from './pages/admin/Verifications';
import AdminLeases from './pages/admin/Leases';
import AdminDocuments from './pages/admin/Documents';
import AdminProfile from './pages/admin/Profile';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Landlord Routes (Protected) */}
          <Route
            path="/landlord"
            element={
              <ProtectedRoute allowedRole="landlord">
                <SidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<LandlordDashboard />} />
            <Route path="my-properties" element={<MyProperties />} />
            <Route path="add-property" element={<AddProperty />} />
            <Route path="lease-requests" element={<LeaseRequests />} />
            <Route path="tenants" element={<TenantDirectory />} />
            <Route path="payments" element={<LandlordPayments />} />
            <Route path="documents" element={<LandlordDocuments />} />
            <Route path="profile" element={<LandlordProfile />} />
          </Route>

          {/* Tenant Routes (Protected) */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute allowedRole="tenant">
                <SidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="rent-property" element={<RentProperty />} />
            <Route path="my-lease" element={<MyLease />} />
            <Route path="payments" element={<TenantPayments />} />
            <Route path="profile" element={<TenantProfile />} />
            <Route path="documents" element={<div className="p-4 bg-white rounded-lg shadow">Document Vault (Phase 3)</div>} />
            <Route path="support" element={<div className="p-4 bg-white rounded-lg shadow">Support Center (Phase 3)</div>} />
          </Route>

          {/* Admin Routes (Protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <SidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="flats" element={<AdminFlats />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="leases" element={<AdminLeases />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;