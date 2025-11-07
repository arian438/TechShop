import React from 'react';
import { ArrowLeft, Bell, Menu } from '../icons/index';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNotifications } from '../../contexts/NotificationContext';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
  onNotificationClick?: () => void;
}

export function Header({ 
  title, 
  showBackButton = false, 
  onBackClick,
  showMenu = false,
  onMenuClick,
  rightAction,
  onNotificationClick
}: HeaderProps) {
  const { unreadCount } = useNotifications();

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-border safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-auto"
              onClick={onBackClick}
            >
              <ArrowLeft className="h-5 w-5" size={20} />
            </Button>
          )}
          {showMenu && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-auto"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" size={20} />
            </Button>
          )}
        </div>

        {/* Center - Title */}
        <h1 className="flex-1 text-center truncate px-2">{title}</h1>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {rightAction || (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-auto relative"
              onClick={onNotificationClick}
            >
              <Bell className="h-5 w-5" size={20} />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}