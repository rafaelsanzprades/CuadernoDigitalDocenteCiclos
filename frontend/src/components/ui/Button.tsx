import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, className = '', variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const baseStyle = "font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "text-xs py-1.5 px-3",
    md: "text-sm py-2 px-5",
    lg: "text-base py-2.5 px-6",
  };

  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-accent/15 text-accent border border-accent/40 hover:bg-accent/25 hover:border-accent/60 shadow-sm";
      break;
    case 'secondary':
      variantStyle = "bg-info/10 text-info dark:text-info border border-info/30 hover:bg-info/10";
      break;
    case 'danger':
      variantStyle = "bg-danger/10 text-danger dark:text-danger border border-danger/30 hover:bg-danger/10";
      break;
    case 'success':
      variantStyle = "bg-success/10 text-success dark:text-success border border-success/30 hover:bg-success/10";
      break;
    case 'ghost':
      variantStyle = "bg-transparent border border-transparent text-muted hover:text-foreground hover:bg-foreground/5";
      break;
  }

  return (
    <button className={`${baseStyle} ${sizes[size]} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
