import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cameraAudio } from '../../utils/CameraAudioFeedback';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wider text-[12px] uppercase rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer font-mono';
  
  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] focus:ring-cyan-500 focus:ring-offset-black',
    cyan: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm focus:ring-cyan-500 focus:ring-offset-black',
    secondary: 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600 focus:ring-slate-700 focus:ring-offset-black shadow-sm',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 hover:text-white shadow-[0_0_15px_rgba(255,45,85,0.2)] focus:ring-rose-600 focus:ring-offset-black',
    outline: 'border border-cyan-500/30 bg-transparent text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 focus:ring-cyan-500 focus:ring-offset-black',
    ghost: 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-[12px]',
    lg: 'px-6 py-3 text-sm',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    cameraAudio.playLockOnBeep();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
