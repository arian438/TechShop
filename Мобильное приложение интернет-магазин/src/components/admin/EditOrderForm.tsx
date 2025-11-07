import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { 
  Package,
  Save,
  X,
  AlertTriangle,
  Truck,
  CreditCard,
  MapPin
} from '../icons/index';
import { Order, DeliveryAddress } from '../../types';
import { toast } from '../ui/sonner';

interface EditOrderFormProps {
  order: Order;
  onClose: () => void;
  onSave: (order: Order) => void;
}

export function EditOrderForm({ order, onClose, onSave }: EditOrderFormProps) {
  const [formData, setFormData] = useState({
    status: order.status,
    paymentMethod: order.paymentMethod,
    deliveryFee: order.deliveryFee.toString(),
    deliveryAddress: { ...order.deliveryAddress },
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderStatuses = [
    { value: 'new', label: 'Новый', description: 'Заказ только что создан' },
    { value: 'processing', label: 'В обработке', description: 'Заказ обрабатывается' },
    { value: 'paid', label: 'Оплачен', description: 'Заказ оплачен и готов к отправке' },
    { value: 'shipping', label: 'В пути', description: 'Заказ отправлен покупателю' },
    { value: 'delivered', label: 'Доставлен', description: 'Заказ успешно доставлен' },
    { value: 'cancelled', label: 'Отменен', description: 'Заказ отменен' }
  ];

  const paymentMethods = [
    { value: 'card', label: 'Банковская карта' },
    { value: 'cash', label: 'Наличные при получении' },
    { value: 'online', label: 'Онлайн платеж' },
    { value: 'transfer', label: 'Банковский перевод' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryAddress: {
        ...prev.deliveryAddress,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const deliveryFee = parseFloat(formData.deliveryFee) || 0;
      const newTotal = order.subtotal + deliveryFee;

      const updatedOrder: Order = {
        ...order,
        status: formData.status as Order['status'],
        paymentMethod: formData.paymentMethod,
        deliveryFee,
        total: newTotal,
        deliveryAddress: formData.deliveryAddress,
        deliveredAt: formData.status === 'delivered' && !order.deliveredAt 
          ? new Date().toISOString() 
          : order.deliveredAt
      };

      onSave(updatedOrder);
      toast.success('Заказ успешно обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-50 text-blue-700 border-blue-200',
      'processing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'paid': 'bg-green-50 text-green-700 border-green-200',
      'shipping': 'bg-purple-50 text-purple-700 border-purple-200',
      'delivered': 'bg-green-50 text-green-700 border-green-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Редактирование заказа #{order.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Информация о заказе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Дата создания:</span>
                  <div>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Сумма заказа:</span>
                  <div className="font-medium">{formatPrice(order.subtotal)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Статус заказа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Текущий статус</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status.value)} variant="outline">
                            {status.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {status.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.status === 'cancelled' || formData.status === 'delivered') && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formData.status === 'cancelled' 
                        ? 'Внимание: заказ будет отменен' 
                        : 'Внимание: заказ будет помечен как доставленный'
                      }
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Оплата и доставка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Способ оплаты</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deliveryFee">Стоимость доставки</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center font-medium">
                <span>Итого к оплате:</span>
                <span>{formatPrice(order.subtotal + (parseFloat(formData.deliveryFee) || 0))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Адрес доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addressName">Имя получателя</Label>
                  <Input
                    id="addressName"
                    value={formData.deliveryAddress.name}
                    onChange={(e) => handleAddressChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="addressPhone">Телефон</Label>
                  <Input
                    id="addressPhone"
                    value={formData.deliveryAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  value={formData.deliveryAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={formData.deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Почтовый индекс</Label>
                  <Input
                    id="postalCode"
                    value={formData.deliveryAddress.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Примечания</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Добавить примечание к заказу..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}