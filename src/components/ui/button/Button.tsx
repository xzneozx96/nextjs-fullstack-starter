import type { ReactNode } from 'react';
import { cn } from '@/libs/utils';
import React from 'react';

type ButtonProps = {
  children: ReactNode; // Button text or content
  size?: 'sm' | 'md'; // Button size
  variant?: 'primary' | 'outline' | 'icon'; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  startIcon,
  endIcon,
  onClick,
  className = '',
  disabled = false,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm',
    md: 'px-5 py-3.5 text-sm',
  };

  // Variant Classes
  const variantClasses = {
    primary:
      'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
    outline:
      'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white dark:text-gray-800 dark:ring-none dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
    icon: 'size-12 bg-white text-gray-800 hover:bg-gray-100 dark:bg-white dark:text-gray-800 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center font-medium gap-2 rounded-lg transition',
        className,
        sizeClasses[size],
        variantClasses[variant],
        disabled ? 'cursor-not-allowed opacity-50' : '',
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
