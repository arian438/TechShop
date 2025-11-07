import React, { useState } from 'react';

interface SheetProps {
  children: React.ReactNode;
}

interface SheetTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface SheetContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children: React.ReactNode;
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const SheetContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function Sheet({ children }: SheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children }: SheetTriggerProps) {
  const { setOpen } = React.useContext(SheetContext);

  return (
    <div onClick={() => setOpen(true)}>
      {children}
    </div>
  );
}

export function SheetContent({ side = 'right', className = '', children }: SheetContentProps) {
  const { open, setOpen } = React.useContext(SheetContext);

  if (!open) return null;

  const sideClasses = {
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    top: 'inset-x-0 top-0 h-auto border-b',
    bottom: 'inset-x-0 bottom-0 h-auto border-t',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => setOpen(false)}
      />
      
      {/* Sheet */}
      <div
        className={`fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg transition ease-in-out ${sideClasses[side]} ${className}`}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => setOpen(false)}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className = '', ...props }: SheetHeaderProps) {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
  );
}

export function SheetTitle({ className = '', ...props }: SheetTitleProps) {
  return <h2 className={`text-lg font-semibold ${className}`} {...props} />;
}

export function SheetDescription({ className = '', ...props }: SheetDescriptionProps) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />;
}