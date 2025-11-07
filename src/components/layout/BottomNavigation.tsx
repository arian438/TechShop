
'use client';
import React from 'react';
import { Home, Search, ShoppingCart, User as UserIcon, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserType | null;
}

export function BottomNavigation({ activeTab, onTabChange, user }: BottomNavigationProps) {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const tabs = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'search', label: 'Поиск', icon: Search },
    { id: 'cart', label: 'Корзина', icon: ShoppingCart },
    { id: 'profile', label: 'Профиль', icon: UserIcon },
    ...(isAdmin ? [{ id: 'admin', label: 'Панель', icon: Settings }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex justify-around items-start h-16 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.id === 'cart') {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-start min-w-[60px] h-full relative transition-colors',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {itemCount > 0 && (
                     <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-2 h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center rounded-full"
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </Badge>
                  )}
                </div>
                {itemCount === 0 ? (
                   <span className={cn(
                    'text-sm -ml-1',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {itemCount}
                  </span>
                ) : (
                  <div className="h-[1.25rem]"></div>
                )}
                <span className={cn(
                    'text-xs',
                    isActive ? 'font-medium' : 'font-normal'
                )}>{tab.label}</span>
              </button>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-start min-w-[60px] h-full relative transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
              </div>
              
              <span className={cn(
                  'text-xs pt-1',
                  isActive ? 'font-medium' : 'font-normal'
              )}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
