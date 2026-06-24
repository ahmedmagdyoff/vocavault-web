import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder-slate-500 dark:focus:border-brand ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
