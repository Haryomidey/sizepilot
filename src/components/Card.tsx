import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl overflow-hidden",
        hoverable && "hover:border-[#3f3f46] transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};