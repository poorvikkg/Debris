import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 text-cyan-400/90">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 text-[13px] rounded-xl border bg-[#080d18] text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 shadow-inner font-mono disabled:opacity-50 disabled:bg-slate-900',
              error
                ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                : 'border-cyan-500/20 hover:border-cyan-500/40'
            ),
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
