'use client';

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        // Variants
        {
          'bg-gradient-to-br from-accent-primary to-orange-400 text-bg-primary shadow-lg shadow-accent-primary/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg':
            variant === 'primary',
          'bg-bg-elevated text-text-primary border border-border hover:bg-bg-card hover:border-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed':
            variant === 'secondary',
          'bg-transparent text-text-secondary border border-border hover:text-text-primary hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed':
            variant === 'ghost',
        },
        // Sizes
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2.5 text-sm': size === 'md',
          'px-8 py-4 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
