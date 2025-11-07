import React from 'react';
import { Home, Search, ShoppingCart, User, Settings } from '../icons/index';
import { Badge } from '../ui/badge';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { getItemCount } = useCart();
  const { user } = useAuth();
  const itemCount = getItemCount();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const tabs = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'search', label: 'Поиск', icon: Search },
    { id: 'cart', label: 'Корзина', icon: ShoppingCart, badge: itemCount },
    { id: 'profile', label: 'Профиль', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Панель', icon: Settings }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] relative ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" size={20} />
                {tab.badge && tab.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}