import React, { useState } from 'react';
import { Search, Filter, Package, Clock, CheckCircle, XCircle, Truck } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { mockOrders, mockProducts, mockUsers } from '../data/mockData';
import { Order } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface OrderHistoryScreenProps {
  onBack: () => void;
}

export function OrderHistoryScreen({ onBack }: OrderHistoryScreenProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const userOrders = mockOrders.filter(order => order.userId === user?.id);
  
  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'new': { 
        label: 'Новый', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-orange-600 bg-orange-50'
      },
      'processing': { 
        label: 'В обработке', 
        variant: 'default' as const, 
        icon: Package,
        color: 'text-blue-600 bg-blue-50'
      },
      'paid': { 
        label: 'Оплачен', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50'
      },
      'shipping': { 
        label: 'В пути', 
        variant: 'default' as const, 
        icon: Truck,
        color: 'text-purple-600 bg-purple-50'
      },
      'delivered': { 
        label: 'Доставлен', 
        variant: 'outline' as const, 
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50'
      },
      'cancelled': { 
        label: 'Отменен', 
        variant: 'destructive' as const, 
        icon: XCircle,
        color: 'text-red-600 bg-red-50'
      },
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.new;
  };

  const getOrderItems = (order: Order) => {
    return order.items.map(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      return {
        ...item,
        product
      };
    });
  };

  const ordersByStatus = {
    all: userOrders.length,
    new: userOrders.filter(o => o.status === 'new').length,
    processing: userOrders.filter(o => o.status === 'processing').length,
    delivered: userOrders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
      <div className="space-y-6 pb-20 p-4">
        {/* Search and Filter */}
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

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {ordersByStatus.all}
                </div>
                <div className="text-sm text-muted-foreground">Всего заказов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {ordersByStatus.delivered}
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

          <TabsContent value={selectedStatus} className="space-y-4 mt-4">
            {filteredOrders.length === 0 ? (
              <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-8 pb-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2">Заказы не найдены</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Попробуйте изменить условия поиска' 
                      : 'У вас пока нет заказов в этой категории'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const orderItems = getOrderItems(order);

                return (
                  <Card key={order.id} className="border-0 shadow-md bg-white/70 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      {/* Order Header */}
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">Заказ #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`p-1 rounded-full ${statusInfo.color}`}>
                                <StatusIcon className="h-3 w-3" />
                              </div>
                              <Badge variant={statusInfo.variant} className="text-xs">
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="font-medium">{formatPrice(order.total)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-4 space-y-3">
                        {orderItems.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                              {item.product && (
                                <ImageWithFallback
                                  src={item.product.imageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="truncate text-sm font-medium">{item.productName}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{item.quantity} шт.</span>
                                <span>•</span>
                                <span>{formatPrice(item.price)}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {orderItems.length > 2 && (
                          <div className="text-sm text-muted-foreground text-center pt-2 border-t">
                            +{orderItems.length - 2} товаров
                          </div>
                        )}

                        {/* Delivery Address */}
                        <div className="pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            <strong>Адрес доставки:</strong> {order.deliveryAddress.address}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}