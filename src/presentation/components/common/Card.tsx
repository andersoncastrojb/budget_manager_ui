/**
 * Presentation Layer: Card Component
 * Reusable card container for dashboard metrics and content sections.
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}
        {...props}
      >
        {(title || subtitle) && (
          <div className="px-6 py-4 border-b border-gray-200">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
