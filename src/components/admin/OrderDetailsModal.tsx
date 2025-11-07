
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
} from '../icons/index';
import { Order, Product as ProductType, User as UserType } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { EditOrderForm } from './EditOrderForm';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onEditOrder?: (order: Order) => void;
  canEdit?: boolean;
  products: ProductType[];
  users: UserType[];
}

export function OrderDetailsModal({
  order,
  onClose,
  onEditOrder,
  canEdit = true,
  products,
  users,
}: OrderDetailsModalProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const customer = users.find(u => u.id === order?.userId);

  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      new: { label: 'Новый', variant: 'secondary' as const, icon: Package },
      processing: {
        label: 'В обработке',
        variant: 'default' as const,
        icon: Package,
      },
      paid: { label: 'Оплачен', variant: 'default' as const, icon: CreditCard },
      shipping: { label: 'В пути', variant: 'default' as const, icon: Truck },
      delivered: {
        label: 'Доставлен',
        variant: 'outline' as const,
        icon: CheckCircle,
      },
      cancelled: {
        label: 'Отменен',
        variant: 'destructive' as const,
        icon: XCircle,
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: 'secondary' as const,
      icon: Package,
    };

    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleEditSave = (updatedOrder: Order) => {
    if (onEditOrder) {
      onEditOrder(updatedOrder);
    }
    setShowEditForm(false);
  };

  if (showEditForm) {
    return (
      <EditOrderForm
        order={order}
        onClose={() => setShowEditForm(false)}
        onSave={handleEditSave}
      />
    );
  }

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Заказ #{order.id}
            </DialogTitle>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="font-bold"
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status and Date */}
          <div className="flex items-center justify-between">
            {getStatusBadge(order.status)}
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Информация о клиенте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-bold">
                  {customer?.name || 'Неизвестный клиент'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer?.email}
                </div>
                {customer?.phone && (
                  <div className="text-sm text-muted-foreground">
                    {customer.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Адрес доставки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="font-bold">{order.deliveryAddress?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {order.deliveryAddress?.address}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.deliveryAddress?.city},{' '}
                  {order.deliveryAddress?.postalCode}
                </div>
                <div className="text-sm text-muted-foreground">
                  Телефон: {order.deliveryAddress?.phone}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Товары в заказе</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const product = getProductById(item.productId);
                  return (
                    <div key={item.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <ImageWithFallback
                            src={item.productImage || product?.imageUrl || ''}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">
                            {item.productName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} × {item.quantity}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold">
                            {formatPrice(item.total)}
                          </div>
                        </div>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Информация об оплате
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Способ оплаты:</span>
                  <span>{order.paymentMethod}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Стоимость товаров:
                    </span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка:</span>
                    <span>{formatPrice(order.deliveryFee)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Итого:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.deliveredAt && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Доставлен:{' '}
                  {new Date(order.deliveredAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
