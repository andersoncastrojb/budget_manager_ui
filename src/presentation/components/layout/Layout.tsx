'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/application/hooks/useUserData';
import { LoadingSpinner, ErrorAlert } from '../common/StateComponents';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Listado de usuarios', href: '/', icon: '👥' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const selectedUserId = searchParams?.get('userId') ?? undefined;
  const { data: user, isLoading, error } = useCurrentUser(selectedUserId);

  const buildHref = (href: string) => {
    if (href === '/') return '/';
    return selectedUserId ? `${href}?userId=${selectedUserId}` : href;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <ErrorAlert
            message="Failed to load user data"
            details="Please refresh the page or try selecting a different profile."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transition-transform duration-300 z-40 lg:translate-x-0 lg:static lg:w-64`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-8 border-b border-gray-800">
            <h1 className="text-2xl font-bold">Budget Manager</h1>
            <p className="text-gray-400 text-sm mt-1">Control your finances</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={buildHref(item.href)}
                    className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-4 py-4 border-t border-gray-800">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {user?.name ?? 'Selected user'}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  window.location.href = '/logout';
                }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Logout"
              >
                ⏻
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <span className="text-2xl">☰</span>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
            >
              🔔
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
