import React, { useState } from 'react';
import { User, MapPin, ShoppingBag, Heart, Settings, LogOut, ChevronRight, Star, Gift } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { mockOrders } from '../data/mockData';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onViewOrders: () => void;
  onViewAddresses: () => void;
  onViewFavorites: () => void;
  onViewSettings: () => void;
}

export function ProfileScreen({ onEditProfile, onViewOrders, onViewAddresses, onViewFavorites, onViewSettings }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();

  if (!user) return null;

  const userOrders = mockOrders.filter(order => order.userId === user.id);
  const completedOrders = userOrders.filter(order => order.status === 'delivered');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Личные данные',
      description: 'Редактировать профиль',
      icon: User,
      onClick: onEditProfile,
    },
    {
      id: 'orders',
      label: 'Мои заказы',
      description: `${userOrders.length} заказов`,
      icon: ShoppingBag,
      onClick: onViewOrders,
    },
    {
      id: 'addresses',
      label: 'Адреса доставки',
      description: `${user.addresses.length} адресов`,
      icon: MapPin,
      onClick: onViewAddresses,
    },
    {
      id: 'favorites',
      label: 'Избранное',
      description: `${favorites.length} товаров`,
      icon: Heart,
      onClick: onViewFavorites,
    },
    {
      id: 'settings',
      label: 'Настройки',
      description: 'Уведомления, приватность',
      icon: Settings,
      onClick: onViewSettings,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20">
      <div className="space-y-6 pb-20 p-4">
        {/* User Profile Header */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-violet-500 to-blue-600"></div>
          <CardContent className="pt-6 -mt-8 relative">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarFallback className="text-lg bg-gradient-to-br from-violet-500 to-blue-600 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Администратор' : 
                     user.role === 'manager' ? 'Менеджер' : 'Покупатель'}
                  </Badge>
                  
                  {completedOrders.length > 0 && (
                    <Badge variant="outline">
                      {completedOrders.length} покупок
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {userOrders.length}
                </div>
                <div className="text-xs text-muted-foreground">Заказов</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="h-4 w-4 text-pink-600" />
                  </div>
                </div>
                <div className="text-xl font-medium bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  {favorites.length}
                </div>
                <div className="text-xs text-muted-foreground">Избранное</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="text-xl font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {completedOrders.length}
                </div>
                <div className="text-xs text-muted-foreground">Завершено</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  <button
                    onClick={item.onClick}
                    className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {index < menuItems.length - 1 && (
                    <div className="border-b border-border mx-4" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={logout}
          className="w-full justify-start text-destructive hover:text-destructive bg-white/50 hover:bg-white/80"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}