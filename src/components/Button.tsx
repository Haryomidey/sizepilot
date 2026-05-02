/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    
    const variants = {
      primary: 'bg-white text-black hover:bg-[#e4e4e7]',
      secondary: 'bg-[#111111] text-white border border-[#222222] hover:bg-[#18181b] hover:border-[#3f3f46]',
      outline: 'bg-transparent text-white border border-[#222222] hover:border-[#3f3f46] hover:bg-white/[0.02]',
      ghost: 'bg-transparent text-white hover:bg-white/[0.02]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
      icon: 'p-2',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
