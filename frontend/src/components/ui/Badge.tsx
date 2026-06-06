import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
}

const variants = {
  success: "bg-success/10 text-success dark:text-success border-success/30",
  danger: "bg-danger/10 text-danger dark:text-danger border-danger/30",
  warning: "bg-warning/10 text-warning dark:text-warning border-warning/30",
  info: "bg-info/10 text-info dark:text-info border-info/30",
  default: "bg-foreground/8 text-foreground/70 border-[var(--glass-border)]",
};

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border flex items-center gap-1 w-fit ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
