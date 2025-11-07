
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Menu, Share, Heart } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
  onNotificationClick?: () => void;
  isProductDetail?: boolean;
  onShare?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export function Header({ 
  title, 
  showBackButton = false, 
  onBackClick,
  showMenu = false,
  onMenuClick,
  rightAction,
  onNotificationClick,
  isProductDetail = false,
  onShare,
  onToggleFavorite,
  isFavorite
}: HeaderProps) {
  const { unreadCount } = useNotifications();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    if (isProductDetail) {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      setIsScrolled(false);
    }
  }, [isProductDetail]);

  const showStickyHeader = isProductDetail && isScrolled;

  return (
    <header className="sticky top-0 z-40 bg-card transition-all duration-300">
      <div className={cn(
        "flex items-center justify-between h-14 px-4 transition-opacity duration-300", 
        showStickyHeader ? 'opacity-0 h-0 invisible' : 'opacity-100 border-b'
      )}>
        <div className="flex items-center gap-2 w-1/4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={onBackClick}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {showMenu && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        <h1 className="flex-1 text-center truncate text-lg">{title}</h1>

        <div className="flex items-center justify-end gap-2 w-1/4">
          {rightAction || (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 relative"
              onClick={onNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1.5 flex items-center justify-center rounded-full"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {isProductDetail && (
         <div className={cn(
           "flex items-center justify-between h-14 px-4 border-b",
           showStickyHeader ? 'fixed top-0 left-0 right-0 z-50 bg-card' : ''
         )}>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onBackClick}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onShare}>
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onToggleFavorite}>
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-destructive fill-destructive' : 'text-foreground'}`} />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
