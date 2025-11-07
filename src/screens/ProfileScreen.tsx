
'use client';
import React, { useMemo } from 'react';
import { User as UserIcon, MapPin, ShoppingBag, Heart, Settings, LogOut, ChevronRight, Star } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { User as UserType, Order } from '@/types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onViewOrders: () => void;
  onViewAddresses: () => void;
  onViewFavorites: () => void;
  onViewSettings: () => void;
  onLogout: () => void;
  user: UserType;
}

export function ProfileScreen({ onEditProfile, onViewOrders, onViewAddresses, onViewFavorites, onViewSettings, user, onLogout }: ProfileScreenProps) {
  const { firestore } = useFirebase();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'orders'), where('userId', '==', user.id));
  }, [firestore, user]);
  
  const { data: orders = [] } = useCollection<Order>(ordersQuery);

  if (!user) return null;

  const completedOrders = orders?.filter(order => order.status === 'delivered') || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getPurchasesLabel = (count: number) => {
    if (count === 1) return 'покупка';
    if (count > 1 && count < 5) return 'покупки';
    return 'покупок';
  }

  const menuItems = [
    {
      id: 'profile',
      label: 'Личные данные',
      description: 'Редактировать профиль',
      icon: UserIcon,
      onClick: onEditProfile,
    },
    {
      id: 'orders',
      label: 'Мои заказы',
      description: `${orders?.length || 0} заказов`,
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
      description: `${user.favoriteProducts?.length || 0} товаров`,
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

  const stats = [
    {
      label: 'Заказов',
      value: orders?.length || 0,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Избранное',
      value: user.favoriteProducts?.length || 0,
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      label: 'Завершено',
      value: completedOrders.length,
      icon: Star,
      color: 'bg-green-100 text-green-600',
    },
  ];

  const getRoleBadge = (role: 'user' | 'manager' | 'admin') => {
    switch(role) {
      case 'admin':
        return <Badge variant="destructive">Администратор</Badge>;
      case 'manager':
        return <Badge variant="default">Менеджер</Badge>;
      default:
        return <Badge variant="secondary">Покупатель</Badge>;
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-4 p-4">
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-violet-500 to-blue-600"></div>
          <CardContent className="p-4 flex flex-row items-start gap-4 -mt-12">
            <div className="flex-shrink-0">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-12">
              <h2 className="text-lg font-medium">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
               <div className="flex items-center justify-start gap-2 mt-2">
                {getRoleBadge(user.role)}
                {completedOrders.length > 0 && 
                  <Badge variant="outline" className="border-black">
                      {completedOrders.length} {getPurchasesLabel(completedOrders.length)}
                  </Badge>
                }
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const textColorClass = stat.color.split(' ').find(c => c.startsWith('text-'));
            return (
              <Card key={index} className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-3 text-center">
                  <div className={`p-2 rounded-lg inline-block mb-1 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className={`text-xl ${textColorClass}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Menu Items */}
        <div className="px-0">
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.id}>
                  <button
                    onClick={item.onClick}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-bold">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {index < menuItems.length - 1 && (
                    <div className="border-b border-border mx-6" />
                  )}
                </React.Fragment>
              );
            })}
          </CardContent>
        </Card>
        </div>

        {/* Logout */}
        <div className="px-0 pb-4">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start p-4 hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="h-5 w-5 mr-4" />
          <span>Выйти из аккаунта</span>
        </Button>
        </div>
    </div>
    </div>
  );
}
