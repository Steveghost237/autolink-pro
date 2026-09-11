import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/ClientDashboard';
import SearchVehicles from './pages/client/SearchVehicles';
import MyBookings from './pages/client/MyBookings';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyVehicles from './pages/owner/MyVehicles';
import AddVehicle from './pages/owner/AddVehicle';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverRecruitment from './pages/admin/DriverRecruitment';
import Finance from './pages/admin/Finance';
import VehicleInspection from './pages/admin/VehicleInspection';
import ManageUsers from './pages/admin/ManageUsers';
import ControllerDashboard from './pages/controller/ControllerDashboard';
import CatalogManager from './pages/admin/CatalogManager';
import AgentsManager from './pages/admin/AgentsManager';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const Guard = ({ roles, children }) => <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/client/dashboard" element={<Guard roles={['CLIENT']}><ClientDashboard /></Guard>} />
      <Route path="/client/search" element={<Guard roles={['CLIENT']}><SearchVehicles /></Guard>} />
      <Route path="/client/bookings" element={<Guard roles={['CLIENT']}><MyBookings /></Guard>} />

      <Route path="/owner/dashboard" element={<Guard roles={['OWNER']}><OwnerDashboard /></Guard>} />
      <Route path="/owner/vehicles" element={<Guard roles={['OWNER']}><MyVehicles /></Guard>} />
      <Route path="/owner/add-vehicle" element={<Guard roles={['OWNER']}><AddVehicle /></Guard>} />

      <Route path="/driver/dashboard" element={<Guard roles={['DRIVER']}><DriverDashboard /></Guard>} />

      <Route path="/admin/dashboard" element={<Guard roles={['ADMIN']}><AdminDashboard /></Guard>} />
      <Route path="/admin/drivers" element={<Guard roles={['ADMIN']}><DriverRecruitment /></Guard>} />
      <Route path="/admin/finance" element={<Guard roles={['ADMIN']}><Finance /></Guard>} />
      <Route path="/admin/inspections" element={<Guard roles={['ADMIN', 'CONTROLLER']}><VehicleInspection /></Guard>} />
      <Route path="/admin/users" element={<Guard roles={['ADMIN']}><ManageUsers /></Guard>} />
      <Route path="/admin/catalog" element={<Guard roles={['ADMIN']}><CatalogManager /></Guard>} />
      <Route path="/admin/agents" element={<Guard roles={['ADMIN']}><AgentsManager /></Guard>} />

      <Route path="/controller/dashboard" element={<Guard roles={['ADMIN', 'CONTROLLER']}><ControllerDashboard /></Guard>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
