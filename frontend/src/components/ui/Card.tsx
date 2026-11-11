import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className,
  padding = 'md',
  onClick,
  role,
  'aria-label': ariaLabel,
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-sm border border-apple-gray-2',
        paddingClasses[padding],
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className,
      )}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {title && (
        <h3 className="text-base font-bold text-apple-text mb-3 tracking-tight">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
