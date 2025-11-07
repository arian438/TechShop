
'use client';
import React from 'react';
import { useToast } from '@/contexts/ToastContext';

export function Toaster() {
    const { toasts, removeToast } = useToast();
  
    return (
      <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            onClick={() => removeToast(id)}
            className={`pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all cursor-pointer ${
              variant === 'destructive'
                ? 'destructive group border-destructive bg-destructive text-destructive-foreground'
                : 'border bg-background text-foreground'
            }`}
          >
            <div className="grid gap-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && <div className="text-sm opacity-90">{description}</div>}
            </div>
          </div>
        ))}
      </div>
    );
}

export const toast = (props: { title: React.ReactNode; description?: React.ReactNode; variant?: 'default' | 'destructive', duration?: number }) => {
  window.dispatchEvent(new CustomEvent('add-toast', { detail: props }));
};
