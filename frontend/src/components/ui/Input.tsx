import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
}

export function Input({ label, helpText, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</label>}
      <input
        className={`w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/15 transition-all text-sm ${className}`}
        {...props}
      />
      {helpText && <p className="text-xs text-muted mt-1">{helpText}</p>}
    </div>
  );
}
