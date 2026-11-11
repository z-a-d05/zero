import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-apple-text"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-apple-text-secondary pointer-events-none" aria-hidden="true">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            {...props}
            aria-invalid={!!error}
            aria-describedby={clsx(error && errorId, hint && hintId)}
            className={clsx(
              'w-full bg-apple-gray border rounded-xl px-4 py-3 text-apple-text text-base',
              'placeholder:text-apple-gray-3 min-h-[44px]',
              'focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200',
              leftIcon && 'pl-10',
              rightElement && 'pr-10',
              error
                ? 'border-apple-red focus:ring-apple-red'
                : 'border-apple-gray-2 focus:ring-apple-blue',
              className,
            )}
          />

          {rightElement && (
            <span className="absolute right-3 text-apple-text-secondary">
              {rightElement}
            </span>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-apple-text-secondary">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs text-apple-red font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
