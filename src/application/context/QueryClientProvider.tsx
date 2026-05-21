/**
 * Application Layer: Query Client Provider
 * Configures React Query and provides context to the entire application.
 * Handles global query settings and error handling.
 */

'use client';

import { ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ApiClientError } from '@/infrastructure/api/apiClient';

/**
 * Create query client with secure defaults
 */
const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry auth errors
          if (error instanceof ApiClientError) {
            if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
              return false;
            }
          }

          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // Default to 5 minutes
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Create query client instance
const queryClient = createQueryClient();

/**
 * Props for QueryClientProvider
 */
interface QueryClientProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application with React Query context
 * Must be placed at a high level in the component tree (typically in root layout)
 */
export const AppQueryClientProvider = ({
  children,
}: QueryClientProviderProps): ReactNode => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Export query client for manual operations if needed
 */
export { queryClient };
