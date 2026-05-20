'use client';

import React, { useState } from 'react';
import { useUserDashboard } from '@/application/hooks/useUserData';
import {
  Button,
  Card,
  ErrorAlert,
  SkeletonLoader,
} from '../common';
import { formatCurrency } from '@/shared/utils/formatters';
import { Income, FixedExpense } from '@/domain/entities';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    percentage: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  trend,
  className = '',
}) => {
  const trendColor =
    trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className={`flex items-start gap-4 ${className}`}>
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-sm ${trendColor} mt-2`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}% from last
            month
          </p>
        )}
      </div>
    </Card>
  );
};

const getTransactionDate = (transaction: Income | FixedExpense): Date => {
  if ('date' in transaction) {
    return transaction.date;
  }
  return transaction.createdAt;
};

export const Dashboard: React.FC = () => {
  const { data: dashboard, isLoading, error, refetch } = useUserDashboard();
  const [dismissedError, setDismissedError] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <SkeletonLoader count={3} />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <SkeletonLoader count={5} />
          </Card>
          <Card>
            <SkeletonLoader count={5} />
          </Card>
        </div>
      </div>
    );
  }

  if (error && !dismissedError) {
    return (
      <div className="space-y-4">
        <ErrorAlert
          message="Failed to load dashboard data"
          details="Unable to fetch your financial summary. Please try again."
          onDismiss={() => setDismissedError(true)}
        />
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  const totalBalanceStr = formatCurrency(dashboard.totalBalance);
  const totalIncomeStr = formatCurrency(dashboard.totalIncome);
  const totalExpensesStr = formatCurrency(dashboard.totalExpenses);
  const totalLoansStr = formatCurrency(dashboard.totalLoans);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {dashboard.user.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s your financial overview for this month
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon="💰"
          label="Total Balance"
          value={totalBalanceStr}
          trend={{ percentage: 12, direction: 'up' }}
        />
        <MetricCard
          icon="📈"
          label="Total Income"
          value={totalIncomeStr}
          trend={{ percentage: 8, direction: 'up' }}
        />
        <MetricCard
          icon="💳"
          label="Total Expenses"
          value={totalExpensesStr}
          trend={{ percentage: 5, direction: 'down' }}
        />
        <MetricCard
          icon="📋"
          label="Loans"
          value={totalLoansStr}
        />
      </div>

      {dashboard.accountCount > 0 && (
        <Card title="Accounts" subtitle={`You have ${dashboard.accountCount} account(s)`}>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Manage your accounts to track and organize your finances
            </p>
            <Button variant="primary" size="md">
              View All Accounts
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Upcoming Expenses"
          subtitle={`${dashboard.upcomingExpenses.length} expense(s) due this month`}
        >
          {dashboard.upcomingExpenses.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboard.upcomingExpenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Due: {new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        expense.dueDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No upcoming expenses</p>
          )}
        </Card>

        <Card
          title="Recent Transactions"
          subtitle={`${dashboard.recentTransactions.length} transaction(s) recorded`}
        >
          {dashboard.recentTransactions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboard.recentTransactions.slice(0, 5).map((transaction, idx) => (
                <div
                  key={`${transaction.id}-${idx}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {new Date(getTransactionDate(transaction)).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No transactions yet</p>
          )}
        </Card>
      </div>

      {dashboard.monthlyBalance.length > 0 && (
        <Card title="Monthly Balance" subtitle="Year-to-date overview">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Showing {dashboard.monthlyBalance.length} months of data
            </p>
            <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">
              📊 Chart visualization will be implemented with a charting library
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
