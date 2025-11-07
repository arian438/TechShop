
'use client';
import React, { useState, useMemo } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, Truck } from '../components/icons/index';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Order, Product, User } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderHistoryScreenProps {
  onBack: () => void;
  user: User;
}

export function OrderHistoryScreen({ onBack, user }: OrderHistoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { firestore, isUserLoading: firebaseLoading } = useFirebase();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    if (user.role === 'admin' || user.role === 'manager') {
      return collection(firestore, 'orders');
    }
    return query(collection(firestore, 'orders'), where('userId', '==', user.id));
  }, [firestore, user]);

  const { data: userOrders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  const productsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollectionRef);

  const isLoading = firebaseLoading || ordersLoading || productsLoading;

  const filteredOrders = useMemo(() => {
    if (!userOrders) return [];
    return userOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (order.items || []).some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });
  }, [userOrders, searchQuery, selectedStatus]);
  
  const deliveredOrdersCount = useMemo(() => {
      if (!userOrders) return 0;
      return userOrders.filter(order => order.status === 'delivered').length;
  }, [userOrders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'new': { label: 'Новый', icon: Clock, color: 'text-orange-600 bg-orange-50' },
      'processing': { label: 'В обработке', icon: Package, color: 'text-blue-600 bg-blue-50' },
      'paid': { label: 'Оплачен', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
      'shipping': { label: 'В пути', icon: Truck, color: 'text-purple-600 bg-purple-50' },
      'delivered': { label: 'Доставлен', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
      'cancelled': { label: 'Отменен', icon: XCircle, color: 'text-red-600 bg-red-50' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.new;
  };

  if (isLoading) {
    return <div className="p-4 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="p-4 space-y-4">
            {/* Search and Stats */}
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-4 space-y-4">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по номеру заказа..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/50"
                    />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                            <div className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {userOrders?.length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Всего заказов</div>
                        </div>
                        <div>
                            <div className="text-2xl font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                {deliveredOrdersCount}
                            </div>
                            <div className="text-sm text-muted-foreground">Доставлено</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Filter Tabs */}
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="new">Новые</TabsTrigger>
                <TabsTrigger value="processing">В работе</TabsTrigger>
                <TabsTrigger value="delivered">Доставлено</TabsTrigger>
            </TabsList>
            </Tabs>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-8 pb-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg">Заказы не найдены</h3>
                <p className="text-muted-foreground">
                    {searchQuery 
                    ? 'Попробуйте изменить условия поиска' 
                    : 'У вас пока нет заказов в этой категории'
                    }
                </p>
                </CardContent>
            </Card>
            ) : (
            <div className="space-y-4">
                {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                    <Card key={order.id} className="overflow-hidden border-0 shadow-md bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-4">
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-bold">Заказ #{order.id.substring(0, 6)}...</h3>
                            <p className="text-sm text-muted-foreground">
                            от {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center gap-2 mb-1 justify-end">
                              <div className={`p-1 rounded-full ${statusInfo.color}`}>
                                <StatusIcon className="h-3 w-3 text-current" />
                              </div>
                              <Badge variant={order.status === 'delivered' ? 'outline' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="font-bold">{formatPrice(order.total)}</div>
                        </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 border-t pt-3">
                        {order.items && order.items.slice(0, 1).map((item) => {
                            const product = products?.find(p => p.id === item.productId);
                            return (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                <ImageWithFallback
                                    src={item.productImage || product?.imageUrl || ''}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                />
                                </div>
                                <div className="flex-1 min-w-0">
                                <h4 className="truncate text-sm font-bold">{item.productName}</h4>
                                <div className="text-sm text-muted-foreground">
                                    {item.quantity} шт. • {formatPrice(item.price)}
                                </div>
                                </div>
                            </div>
                            );
                        })}
                        {order.items && order.items.length > 1 && (
                            <div className="text-sm text-muted-foreground text-center pt-2 border-t">
                                +{order.items.length - 1} других товаров
                            </div>
                        )}
                        </div>
                        
                        {/* Delivery Address */}
                        <div className="pt-3 border-t mt-3">
                          <p className="text-sm text-muted-foreground">
                            <strong>Адрес доставки:</strong> {order.deliveryAddress.address}
                          </p>
                        </div>

                    </CardContent>
                    </Card>
                );
                })}
            </div>
            )}
        </div>
    </div>
  );
}
