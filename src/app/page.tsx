'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserList } from '@/application/hooks/useUserData';
import { Button, Card, ErrorAlert, SkeletonLoader } from '@/presentation/components/common';

export default function HomePage() {
  const router = useRouter();
  const { data: users, isLoading, error, refetch } = useUserList();

  const handleReturn = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Modern Hero & Overview Section */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {/* Decorative Gradient Top Bar */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          
          <div className="p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <span>✨</span> Personal Finance Workspace
                </div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  Take Control of Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Financial Future</span>
                </h1>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Welcome to <strong className="text-gray-900">Budget Manager</strong>, a professional personal financial workspace. 
                  Monitor multi-account balances, track incomes, automate fixed expenses, and keep structural loans organized under one clean, secure dashboard.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Button variant="secondary" onClick={handleReturn} className="shadow-sm hover:shadow-md transition-all cursor-pointer">
                  Return
                </Button>
              </div>
            </div>

            {/* Core Features Grid */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 border-t border-gray-100 pt-8">
              <div className="group rounded-2xl bg-gray-50/50 p-5 border border-gray-100 hover:border-blue-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Financial Dashboard</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Real-time key metrics tracking your total balances, incomes, expenses, and active loans dynamically.
                </p>
              </div>

              <div className="group rounded-2xl bg-gray-50/50 p-5 border border-gray-100 hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className="text-3xl mb-3">🏦</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Multi-Account Hub</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Seamlessly organize savings, checking, cash, and long-term investments in one secure space.
                </p>
              </div>

              <div className="group rounded-2xl bg-gray-50/50 p-5 border border-gray-100 hover:border-purple-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Income & Expenses</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Log your earnings and fixed expenses to forecast and manage your monthly cash flow with ease.
                </p>
              </div>

              <div className="group rounded-2xl bg-gray-50/50 p-5 border border-gray-100 hover:border-pink-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Loan Monitoring</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Keep track of lenders, interest rates, deadlines, and current remaining debt effortlessly.
                </p>
              </div>
            </div>

            {/* Selection Guidance */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border border-blue-100/50 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white animate-bounce">
                👤
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-blue-900 text-sm">Ready to explore?</h4>
                <p className="text-xs text-blue-700 mt-0.5 font-medium">
                  Please select one of the user profiles from the list below to access their personalized financial dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert
              message="Unable to load users"
              details="There was a problem retrieving the users list. Please try again."
              onDismiss={() => refetch()}
            />
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <SkeletonLoader count={4} />
                </Card>
              ))
            : users?.map((user) => (
                <Card
                  key={user.id}
                  className="flex flex-col justify-between space-y-4"
                >
                  <div>
                    <p className="text-sm font-medium text-blue-600">User profile</p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard?userId=${encodeURIComponent(user.id)}`}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      View Dashboard
                    </Link>
                  </div>
                </Card>
              ))}
        </div>

        {!isLoading && users?.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            No users are available to display right now.
          </div>
        )}
      </div>
    </div>
  );
}
