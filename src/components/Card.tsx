/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={cn(
        "bg-[#111111] border border-[#222222] rounded-xl overflow-hidden",
        hoverable && "hover:border-[#3f3f46] transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
