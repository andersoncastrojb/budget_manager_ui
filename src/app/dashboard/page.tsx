/**
 * App Router Page: Dashboard
 * Main dashboard page route
 */

import { Suspense } from 'react';
import { Layout } from '@/presentation/components/layout/Layout';
import { Dashboard } from '@/presentation/components/dashboard/Dashboard';

export const metadata = {
  title: 'Dashboard | Budget Manager',
  description: 'View your financial summary and account overview',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Loading dashboard...</div>}>
      <Layout>
        <Dashboard />
      </Layout>
    </Suspense>
  );
}
