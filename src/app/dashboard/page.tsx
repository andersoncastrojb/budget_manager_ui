/**
 * App Router Page: Dashboard
 * Main dashboard page route
 */

import { Layout } from '@/presentation/components/layout/Layout';
import { Dashboard } from '@/presentation/components/dashboard/Dashboard';

export const metadata = {
  title: 'Dashboard | Budget Manager',
  description: 'View your financial summary and account overview',
};

export default function DashboardPage() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}
