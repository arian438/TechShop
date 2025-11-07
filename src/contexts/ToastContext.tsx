
'use client';
import React, { ReactNode, useState, createContext, useContext, useEffect, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
    id: number;
    title: ReactNode;
    description?: ReactNode;
    variant?: ToastVariant;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (props: { title: ReactNode; description?: ReactNode; variant?: ToastVariant, duration?: number }) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((props: { title: ReactNode; description?: ReactNode; variant?: ToastVariant, duration?: number }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, ...props }]);
        setTimeout(() => {
            removeToast(id);
        }, props.duration || 5000);
    }, [removeToast]);

    useEffect(() => {
      const handleAddToast = (event: Event) => {
        const customEvent = event as CustomEvent;
        addToast(customEvent.detail);
      };
  
      window.addEventListener('add-toast', handleAddToast);
      return () => {
        window.removeEventListener('add-toast', handleAddToast);
      };
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}
