import React from 'react';
import DashboardLayout from './DashboardLayout';
import { OwnerLayout } from './ownerdash';
import AdminLayout from './admindash/AdminLayout';
import { useAuth } from '../contexts/AuthContext';

/* Layout adaptatif : OwnerLayout / AdminLayout selon le rôle, DashboardLayout sinon. */
export default function RoleLayout({ children, title }) {
  const { user } = useAuth();
  if (user?.role === 'OWNER') return <OwnerLayout>{children}</OwnerLayout>;
  if (user?.role === 'ADMIN') return <AdminLayout title={title}>{children}</AdminLayout>;
  return <DashboardLayout title={title}>{children}</DashboardLayout>;
}
