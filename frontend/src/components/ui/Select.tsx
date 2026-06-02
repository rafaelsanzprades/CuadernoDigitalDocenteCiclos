import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</label>}
      <select
        className={`w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/15 transition-all text-sm disabled:opacity-50 appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
