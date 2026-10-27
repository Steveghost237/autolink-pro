import React from 'react';
import DashboardLayout from './DashboardLayout';
import { OwnerLayout } from './ownerdash';
import { useAuth } from '../contexts/AuthContext';

/* Layout adaptatif : OwnerLayout pour les propriétaires, DashboardLayout sinon. */
export default function RoleLayout({ children, title }) {
  const { user } = useAuth();
  if (user?.role === 'OWNER') return <OwnerLayout>{children}</OwnerLayout>;
  return <DashboardLayout title={title}>{children}</DashboardLayout>;
}
