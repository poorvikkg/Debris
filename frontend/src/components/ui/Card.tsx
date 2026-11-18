import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-[#0d1424]/90 rounded-2xl border border-cyan-500/15 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-200',
          hoverable && 'hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('px-5 py-3.5 border-b border-cyan-500/15 bg-[#0e172a]/70', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
  return (
    <h3 className={twMerge('text-sm font-bold text-white tracking-wide font-heading uppercase flex items-center gap-2', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return <div className={twMerge('p-5 bg-transparent text-slate-300 text-sm', className)} {...props}>{children}</div>;
};
