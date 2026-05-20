/**
 * Infrastructure Layer: Error Mappers
 * Converts backend errors and unexpected errors into user-friendly messages.
 * Ensures no sensitive information is leaked to the UI.
 */

import { ApiClientError } from '../api/apiClient';

export interface UserFriendlyError {
  message: string;
  code: string;
  details?: string;
}

/**
 * Map API errors to user-friendly messages
 * Generic messages protect against information leakage while maintaining UX
 */
export const mapApiError = (error: unknown): UserFriendlyError => {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: error.message,
      details: process.env.NODE_ENV === 'development'
        ? JSON.stringify(error.details)
        : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development'
        ? error.message
        : undefined,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
  };
};

/**
 * Get specific error message by code for display purposes
 * Provides actionable feedback to users
 */
export const getErrorMessageByCode = (code: string): string => {
  const messages: Record<string, string> = {
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission for this action.',
    NOT_FOUND: 'The requested resource was not found.',
    CONFLICT: 'This resource already exists. Please use a different value.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    SERVER_ERROR: 'An error occurred. Please try again later.',
    NETWORK_ERROR: 'Network connection error. Please check your internet.',
    TIMEOUT: 'Request timeout. Please try again.',
  };

  return messages[code] || 'An error occurred. Please try again later.';
};

/**
 * Check if error is a specific type for retry logic
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof ApiClientError) {
    const retryableCodes = ['TIMEOUT', 'RATE_LIMITED', 'SERVER_ERROR'];
    return retryableCodes.includes(error.code);
  }
  return false;
};

/**
 * Format validation error details
 * Safely extract field-level errors for form display
 */
export const formatValidationErrors = (
  error: unknown
): Record<string, string> => {
  if (error instanceof ApiClientError && error.details) {
    const errors: Record<string, string> = {};

    if (Array.isArray((error.details as Record<string, unknown>).fieldErrors)) {
      const fieldErrors = (error.details as Record<string, unknown>)
        .fieldErrors as Array<{ field: string; message: string }>;
      fieldErrors.forEach((fieldError: { field: string; message: string }) => {
        errors[fieldError.field] = fieldError.message;
      });
    }

    return errors;
  }

  return {};
};
