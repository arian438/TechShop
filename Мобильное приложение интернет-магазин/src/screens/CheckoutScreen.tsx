import React, { useState } from 'react';
import { 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Plus,
  Edit,
  Banknote,
  Smartphone,
  Card as CardIcon
} from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/mockData';
import { DeliveryAddress } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from '../components/ui/sonner';

interface CheckoutScreenProps {
  onBack: () => void;
}

export function CheckoutScreen({ onBack }: CheckoutScreenProps) {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [selectedAddress, setSelectedAddress] = useState<string>(
    user?.addresses.find(addr => addr.isDefault)?.id || user?.addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryTime, setDeliveryTime] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  const cartItems = items.map(item => {
    const product = mockProducts.find(p => p.id === item.productId);
    return {
      ...item,
      product,
      name: product?.name || 'Неизвестный товар',
      image: product?.imageUrl || ''
    };
  });

  const deliveryFee = deliveryTime === 'express' ? 500 : 0;
  const finalTotal = total + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedAddressData = user?.addresses.find(addr => addr.id === selectedAddress);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast('Выберите адрес доставки');
      return;
    }

    setIsProcessing(true);
    try {
      // Имитация создания заказа
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      toast('Заказ успешно оформлен!');
      onBack();
    } catch (error) {
      toast('Ошибка при оформлении заказа');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Банковская карта',
      description: 'Visa, MasterCard, МИР',
      icon: CreditCard,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'cash',
      name: 'Наличными',
      description: 'При получении заказа',
      icon: Banknote,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 'sbp',
      name: 'СБП',
      description: 'Система быстрых платежей',
      icon: Smartphone,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Стандартная доставка',
      description: '2-3 рабочих дня',
      price: 0,
      icon: Clock
    },
    {
      id: 'express',
      name: 'Экспресс-доставка',
      description: 'В течение дня',
      price: 500,
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
      <div className="space-y-6 pb-20 p-4">
        {/* Order Summary */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Ваш заказ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-medium">{item.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.quantity} шт.</span>
                    <span>×</span>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Стоимость товаров:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Доставка:</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Итого:</span>
                <span className="text-lg text-emerald-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-500" />
              Адрес доставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.addresses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">Нет сохраненных адресов</p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить адрес
                </Button>
              </div>
            ) : (
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                {user?.addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-white/50">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={address.id} className="flex items-center gap-2 cursor-pointer">
                        {address.name}
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">По умолчанию</Badge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.city}, {address.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.phone}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Delivery Time */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              Время доставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={deliveryTime} onValueChange={setDeliveryTime}>
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white/50">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        {option.name}
                        {option.price > 0 && (
                          <span className="font-medium">+{formatPrice(option.price)}</span>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              Способ оплаты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white/50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                        <div className={`p-1 rounded ${method.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {method.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Place Order Button */}
        <div className="sticky bottom-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Итого к оплате:</span>
            <span className="text-xl font-medium text-emerald-600">
              {formatPrice(finalTotal)}
            </span>
          </div>
          
          <Button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !selectedAddress}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
          >
            {isProcessing ? (
              'Оформление заказа...'
            ) : (
              <>
                Оформить заказ
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}