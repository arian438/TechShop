import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className = '', ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  );
}

export function AvatarImage({ className = '', ...props }: AvatarImageProps) {
  return <img className={`aspect-square h-full w-full ${className}`} {...props} />;
}

export function AvatarFallback({ className = '', ...props }: AvatarFallbackProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
      {...props}
    />
  );
}