'use client';
import React from 'react';
import { Bell, Package, Gift, AlertCircle, Trash2, Check } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useNotifications } from '../contexts/NotificationContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface NotificationsScreenProps {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-black" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-black" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-black" />;
      case 'product':
        return <Bell className="h-5 w-5 text-black" />;
      default:
        return <Bell className="h-5 w-5 text-black" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-500';
      case 'promotion':
        return 'bg-green-500';
      case 'system':
        return 'bg-orange-500';
      case 'product':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} мин назад`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} ч назад`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} дн назад`;
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-blue-500 rounded-full p-4 mb-4">
          <Bell className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-lg font-normal mb-2">
          Уведомлений нет
        </h3>
        <p className="text-muted-foreground">
          Когда появятся новые уведомления, они отобразятся здесь
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
        <Card>
            <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-normal text-lg">Уведомления</h2>
                        <p className="text-sm text-muted-foreground">{unreadCount} непрочитанных</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="link" size="sm" className="p-0 h-auto text-sm" onClick={markAllAsRead}>
                            <Check className="h-4 w-4 mr-1" />
                            Прочитать все
                        </Button>
                        <Button variant="link" size="sm" className="p-0 h-auto text-sm text-destructive" onClick={clearAllNotifications}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Очистить
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`overflow-hidden cursor-pointer transition-all duration-200 relative ${!notification.isRead ? 'ring-2 ring-blue-500/20' : ''}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
                <div className={`absolute top-0 left-4 bottom-4 w-12 rounded-lg flex items-start justify-center pt-4 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <CardContent className="p-4 pl-20">
                    <div className="flex items-start justify-between gap-8">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-normal truncate">
                                    {notification.title}
                                </h4>
                                {!notification.isRead && (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-violet-500 text-white border-0 px-2 py-0.5">
                                        Новое
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-3">
                                {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                            {notification.imageUrl && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                    <ImageWithFallback
                                        src={notification.imageUrl}
                                        alt="Изображение уведомления"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                }}
                                className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
  );
}
