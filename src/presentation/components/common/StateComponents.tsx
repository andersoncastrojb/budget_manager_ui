/**
 * Presentation Layer: Loading and Error Components
 * Reusable components for loading states and error display.
 */

import React from 'react';

/**
 * Loading spinner component
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
};

/**
 * Error alert component
 */
interface ErrorAlertProps {
  message: string;
  details?: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  details,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
          {details && (
            <p className="mt-1 text-sm text-red-700">{details}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 inline-flex text-red-400 hover:text-red-500 focus:outline-none"
            aria-label="Dismiss alert"
          >
            <span className="text-xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Success alert component
 */
interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  message,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
      role="status"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-green-800">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 inline-flex text-green-400 hover:text-green-500 focus:outline-none"
            aria-label="Dismiss alert"
          >
            <span className="text-xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Skeleton loader for content placeholders
 */
export const SkeletonLoader: React.FC<{
  count?: number;
  height?: string;
}> = ({ count = 1, height = 'h-4' }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gray-200 rounded animate-pulse`}
        />
      ))}
    </div>
  );
};
