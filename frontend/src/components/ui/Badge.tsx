import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
}

const variants = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  danger: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
  default: "bg-foreground/8 text-foreground/70 border-[var(--glass-border)]",
};

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border flex items-center gap-1 w-fit ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
