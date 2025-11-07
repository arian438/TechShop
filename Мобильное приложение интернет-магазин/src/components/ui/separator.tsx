import React from 'react';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ 
  className = '', 
  orientation = 'horizontal', 
  ...props 
}: SeparatorProps) {
  const orientationClasses = orientation === 'horizontal' 
    ? 'h-px w-full' 
    : 'h-full w-px';

  return (
    <div
      className={`shrink-0 bg-border ${orientationClasses} ${className}`}
      {...props}
    />
  );
}