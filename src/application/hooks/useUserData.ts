/**
 * Application Layer: React Query Hooks
 * Custom hooks for data fetching with automatic error handling and caching.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  User,
  UserDashboard,
  Account,
  Income,
  FixedExpense,
  Loan,
} from '@/domain/entities';
import { userRepository } from '@/infrastructure/api/repositories/UserRepository';
import { accountRepository } from '@/infrastructure/api/repositories/AccountRepository';
import { incomeRepository } from '@/infrastructure/api/repositories/IncomeRepository';
import { fixedExpenseRepository } from '@/infrastructure/api/repositories/FixedExpenseRepository';
import { loanRepository } from '@/infrastructure/api/repositories/LoanRepository';

/**
 * Query key factory for managing query cache
 */
export const queryKeys = {
  user: {
    all: ['user'] as const,
    list: () => [...queryKeys.user.all, 'list'] as const,
    current: (userId?: string) =>
      userId
        ? [...queryKeys.user.all, 'current', userId] as const
        : [...queryKeys.user.all, 'current'] as const,
    dashboard: (userId?: string) =>
      userId
        ? [...queryKeys.user.all, 'dashboard', userId] as const
        : [...queryKeys.user.all, 'dashboard', 'default'] as const,
  },
  accounts: {
    all: ['accounts'] as const,
    list: (userId?: string) =>
      userId ? [...queryKeys.accounts.all, 'list', userId] as const : [...queryKeys.accounts.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.accounts.all, 'detail', id] as const,
  },
  income: {
    all: ['income'] as const,
    list: (userId?: string) =>
      userId ? [...queryKeys.income.all, 'list', userId] as const : [...queryKeys.income.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.income.all, 'detail', id] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: (userId?: string) =>
      userId ? [...queryKeys.expenses.all, 'list', userId] as const : [...queryKeys.expenses.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.expenses.all, 'detail', id] as const,
  },
  loans: {
    all: ['loans'] as const,
    list: (userId?: string) =>
      userId ? [...queryKeys.loans.all, 'list', userId] as const : [...queryKeys.loans.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.loans.all, 'detail', id] as const,
  },
};

/**
 * Hook: Get the full user list
 */
export const useUserList = (): UseQueryResult<User[], Error> => {
  return useQuery({
    queryKey: queryKeys.user.list(),
    queryFn: async () => userRepository.getUsers(),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get current or selected user
 */
export const useCurrentUser = (
  selectedUserId?: string
): UseQueryResult<User, Error> => {
  return useQuery({
    queryKey: queryKeys.user.current(selectedUserId),
    queryFn: async () => {
      if (selectedUserId) {
        return userRepository.getUserById(selectedUserId);
      }

      return userRepository.getCurrentUser();
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get user dashboard with summary data
 */
export const useUserDashboard = (
  selectedUserId?: string
): UseQueryResult<UserDashboard, Error> => {
  return useQuery({
    queryKey: queryKeys.user.dashboard(selectedUserId),
    queryFn: async () => userRepository.getUserDashboard(selectedUserId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get accounts for selected user
 */
export const useAccounts = (
  selectedUserId?: string
): UseQueryResult<Account[], Error> => {
  return useQuery({
    queryKey: queryKeys.accounts.list(selectedUserId),
    queryFn: async () =>
      accountRepository.getAccounts({ userId: selectedUserId }),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get incomes for selected user
 */
export const useIncomes = (
  selectedUserId?: string
): UseQueryResult<Income[], Error> => {
  return useQuery({
    queryKey: queryKeys.income.list(selectedUserId),
    queryFn: async () =>
      incomeRepository.getIncomes({ userId: selectedUserId }),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get fixed expenses for selected user
 */
export const useFixedExpenses = (
  selectedUserId?: string
): UseQueryResult<FixedExpense[], Error> => {
  return useQuery({
    queryKey: queryKeys.expenses.list(selectedUserId),
    queryFn: async () =>
      fixedExpenseRepository.getFixedExpenses({ userId: selectedUserId }),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get loans for selected user
 */
export const useLoans = (
  selectedUserId?: string
): UseQueryResult<Loan[], Error> => {
  return useQuery({
    queryKey: queryKeys.loans.list(selectedUserId),
    queryFn: async () => loanRepository.getLoans({ userId: selectedUserId }),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Configuration defaults for queries
 */
export const QUERY_CONFIG = {
  STALE_TIME_SHORT: 1000 * 60 * 1, // 1 minute
  STALE_TIME_MEDIUM: 1000 * 60 * 5, // 5 minutes
  STALE_TIME_LONG: 1000 * 60 * 30, // 30 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};
