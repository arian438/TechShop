
'use client';
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Clock, 
  CheckCircle,
  Banknote,
  Smartphone,
  MapPin,
  Edit,
  Plus,
  ChevronRight
} from '../components/icons/index';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/sonner';
import { Order, OrderItem, User, DeliveryAddress, Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { addDoc, collection, doc, updateDoc, increment } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AddressForm } from '../components/profile/AddressForm';


interface CheckoutScreenProps {
  onBack: () => void;
  user: User;
  onOrderPlaced: () => void;
  updateUser: (user: User) => Promise<void>;
}

export function CheckoutScreen({ onBack, user, onOrderPlaced, updateUser }: CheckoutScreenProps) {
  const { items, total, clearCart } = useCart();
  const { firestore } = useFirebase();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses?.find(addr => addr.isDefault)?.id || (user?.addresses?.length > 0 ? user.addresses[0].id : '')
  );
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryTime, setDeliveryTime] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const deliveryFee = deliveryTime === 'express' ? 500 : 0;
  const finalTotal = total + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const handleSaveAddress = async (newAddress: Omit<DeliveryAddress, 'id'>) => {
    let updatedAddresses = [...(user.addresses || [])];
    const addressWithId: DeliveryAddress = { ...newAddress, id: Date.now().toString() };
    
    if (addressWithId.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    
    updatedAddresses.push(addressWithId);
    await updateUser({ ...user, addresses: updatedAddresses });
    setSelectedAddressId(addressWithId.id);
    setShowAddDialog(false);
    toast({ title: "Адрес успешно добавлен" });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast({ title: 'Выберите адрес доставки', variant: 'destructive'});
      return;
    }
    const selectedAddressData = user?.addresses.find(addr => addr.id === selectedAddressId);
    if (!user || !selectedAddressData || !firestore) {
      toast({ title: 'Вы должны быть авторизованы и выбрать адрес для оформления заказа', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    const orderItems: OrderItem[] = items.map(cartItem => ({
        id: cartItem.id,
        productId: cartItem.productId,
        productName: cartItem.productName || cartItem.name,
        productImage: cartItem.image,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: cartItem.price * cartItem.quantity,
    }));

    const orderData: Omit<Order, 'id'> = {
        userId: user.id,
        items: orderItems,
        deliveryAddress: selectedAddressData,
        paymentMethod: paymentMethod,
        status: 'new',
        subtotal: total,
        deliveryFee: deliveryFee,
        total: finalTotal,
        createdAt: new Date().toISOString(),
    };
    
    try {
      await addDoc(collection(firestore, 'orders'), orderData);
      
      // Update stock quantity for each product in the cart
      for (const item of items) {
        const productRef = doc(firestore, 'products', item.productId);
        await updateDoc(productRef, {
          stockQuantity: increment(-item.quantity)
        });
      }

      await clearCart();
      toast({ title: 'Заказ успешно оформлен!' });
      onOrderPlaced();
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка оформления заказа', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedAddressData = user?.addresses.find(addr => addr.id === selectedAddressId);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Банковская карта',
      description: 'Visa, MasterCard, МИР',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'cash',
      name: 'Наличными',
      description: 'При получении заказа',
      icon: Banknote,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'sbp',
      name: 'СБП',
      description: 'Система быстрых платежей',
      icon: Smartphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Стандартная доставка',
      description: '2-3 рабочих дня',
      price: 0,
      icon: Clock,
    },
    {
      id: 'express',
      name: 'Экспресс-доставка',
      description: 'В течение дня',
      price: 500,
      icon: CheckCircle,
    }
  ];

  return (
    <div className="bg-muted/30 min-h-screen">
        <div className="p-4 space-y-6 pb-24">
             {/* Order Summary */}
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold">Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="truncate text-sm font-bold">{item.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{item.quantity} шт.</span>
                            <span>×</span>
                            <span className="text-muted-foreground">{formatPrice(item.price)}</span>
                        </div>
                        </div>
                        <div className="text-sm font-bold">
                        {formatPrice(item.price * item.quantity)}
                        </div>
                    </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Стоимость товаров:</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Доставка:</span>
                        <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                        {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="font-bold">Итого:</span>
                        <span className="text-lg font-bold text-emerald-600">{formatPrice(finalTotal)}</span>
                    </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <MapPin className="h-4 w-4 text-green-500"/>
                        Адрес доставки
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {user?.addresses.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground mb-3">Нет сохраненных адресов</p>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                          <DialogTrigger asChild>
                            <Button variant="ghost">
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить адрес
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle className="text-center font-bold">Добавить новый адрес</DialogTitle>
                              </DialogHeader>
                              <AddressForm 
                                onSave={handleSaveAddress} 
                                onCancel={() => setShowAddDialog(false)}
                              />
                          </DialogContent>
                        </Dialog>
                    </div>
                    ) : (
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        {user?.addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <div className="flex-1">
                            <Label htmlFor={address.id} className="flex items-center gap-2 cursor-pointer">
                                <span className="font-bold">{address.name}</span>
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
            <div>
                <h3 className="flex items-center gap-2 mb-3 font-medium">
                    <Clock className="h-5 w-5 text-teal-600" />
                    Время доставки
                </h3>
                <RadioGroup value={deliveryTime} onValueChange={setDeliveryTime} className="space-y-3">
                    {deliveryOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Label key={option.id} htmlFor={`delivery-${option.id}`} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer bg-card`}>
                            <RadioGroupItem value={option.id} id={`delivery-${option.id}`} />
                            <Icon className="h-4 w-4 text-black" />
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="font-bold">{option.name}</span>
                                    {option.price > 0 && <span className="font-bold">+{formatPrice(option.price)}</span>}
                                </div>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                        </Label>
                      )
                    })}
                </RadioGroup>
            </div>

            {/* Payment Method */}
            <div>
                <h3 className="flex items-center gap-2 mb-3 font-medium">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    Способ оплаты
                </h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                        <Label key={method.id} htmlFor={`payment-${method.id}`} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer bg-card`}>
                            <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                            <div className={`p-2 rounded-lg ${method.bgColor}`}>
                                <Icon className={`h-5 w-5 ${method.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                        </Label>
                        )
                    })}
                </RadioGroup>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Итого к оплате:</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatPrice(finalTotal)}
            </span>
          </div>
          
          <Button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !selectedAddressId}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isProcessing ? 'Оформление...' : (
              <>
                Оформить заказ
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
    </div>
  );
}
