import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accent?: 'top' | 'left' | 'none';
  accentColor?: string;
}

export function Card({ children, className = '', accent = 'none', accentColor, ...props }: CardProps) {
  const accentClass = accent === 'top' ? 'border-t-4 border-t-accent' :
    accent === 'left' ? 'border-l-4 border-l-accent' : '';

  const customAccent = accentColor && accent !== 'none'
    ? { borderTopColor: accent === 'top' ? accentColor : undefined,
        borderLeftColor: accent === 'left' ? accentColor : undefined }
    : {};

  return (
    <div
      className={`glass-card overflow-hidden ${accentClass} ${className}`}
      style={Object.keys(customAccent).length ? customAccent : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
