import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationState } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Заказ оформлен',
    message: 'Ваш заказ #12345 успешно оформлен и отправлен в обработку',
    type: 'order',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Новая акция!',
    message: 'Скидка 20% на все смартфоны до конца недели',
    type: 'promotion',
    isRead: false,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Товар в наличии',
    message: 'iPhone 15 Pro снова доступен для заказа',
    type: 'product',
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: '4',
    userId: 'user1',
    title: 'Обновление системы',
    message: 'Запланированные технические работы 15 марта с 02:00 до 04:00',
    type: 'system',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: '5',
    userId: 'manager1',
    title: 'Новый заказ',
    message: 'Поступил новый заказ #12346 на сумму 45 000 ₽',
    type: 'order',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
  },
  {
    id: '6',
    userId: 'admin1',
    title: 'Низкий остаток товара',
    message: 'На складе осталось менее 5 единиц товара "MacBook Pro M3"',
    type: 'system',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
  }
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      // Filter notifications by user
      const userNotifications = mockNotifications.filter(n => n.userId === user.id);
      setNotifications(userNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}