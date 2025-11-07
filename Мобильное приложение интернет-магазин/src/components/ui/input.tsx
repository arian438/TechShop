import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', type = 'text', ...props }: InputProps) {
  const classes = `flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 transition-colors file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  return <input type={type} className={classes} {...props} />;
}