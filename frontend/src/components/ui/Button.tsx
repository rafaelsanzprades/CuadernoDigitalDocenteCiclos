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
      variantStyle = "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/25";
      break;
    case 'danger':
      variantStyle = "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25";
      break;
    case 'success':
      variantStyle = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25";
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
