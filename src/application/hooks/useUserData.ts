/**
 * Application Layer: React Query Hooks
 * Custom hooks for data fetching with automatic error handling and caching.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { User, UserDashboard } from '@/domain/entities';
import { userRepository } from '@/infrastructure/api/repositories/UserRepository';

/**
 * Query key factory for managing query cache
 */
export const queryKeys = {
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    dashboard: () => [...queryKeys.user.all, 'dashboard'] as const,
  },
  accounts: {
    all: ['accounts'] as const,
    list: () => [...queryKeys.accounts.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.accounts.all, 'detail', id] as const,
  },
  income: {
    all: ['income'] as const,
    list: () => [...queryKeys.income.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.income.all, 'detail', id] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: () => [...queryKeys.expenses.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.expenses.all, 'detail', id] as const,
  },
  loans: {
    all: ['loans'] as const,
    list: () => [...queryKeys.loans.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.loans.all, 'detail', id] as const,
  },
};

/**
 * Hook: Get current user
 */
export const useCurrentUser = (): UseQueryResult<User, Error> => {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      return userRepository.getCurrentUser();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get user dashboard with summary data
 */
export const useUserDashboard = (): UseQueryResult<UserDashboard, Error> => {
  return useQuery({
    queryKey: queryKeys.user.dashboard(),
    queryFn: async () => {
      return userRepository.getUserDashboard();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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
