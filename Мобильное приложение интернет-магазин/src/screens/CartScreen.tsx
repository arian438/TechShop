import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { CartItem } from '../components/cart/CartItem';
import { useCart } from '../contexts/CartContext';
import { mockProducts } from '../data/mockData';
import { ShoppingBag, Truck } from '../components/icons/index';

interface CartScreenProps {
  onCheckout: () => void;
}

export function CartScreen({ onCheckout }: CartScreenProps) {
  const { items, total, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const deliveryFee = total > 50000 ? 0 : 500;
  const totalWithDelivery = total + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="mb-2">Корзина пуста</h2>
        <p className="text-muted-foreground mb-6">
          Добавьте товары в корзину, чтобы оформить заказ
        </p>
        <Button className="w-full max-w-sm">
          Перейти к покупкам
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-32">
      {/* Cart Items */}
      <div className="px-4 space-y-3">
        {items.map(item => {
          const product = mockProducts.find(p => p.id === item.productId);
          if (!product) return null;
          
          return (
            <CartItem
              key={item.id}
              item={item}
              product={product}
            />
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Сумма заказа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Товары ({items.length})</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Доставка</span>
              <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
              </span>
            </div>
            
            {deliveryFee > 0 && (
              <p className="text-sm text-muted-foreground">
                Бесплатная доставка от {formatPrice(50000)}
              </p>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-medium text-lg">
              <span>Итого</span>
              <span>{formatPrice(totalWithDelivery)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span>Итого: </span>
          <span className="font-medium text-lg">{formatPrice(totalWithDelivery)}</span>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={clearCart} className="flex-1">
            Очистить корзину
          </Button>
          <Button onClick={onCheckout} className="flex-1">
            Оформить заказ
          </Button>
        </div>
      </div>
    </div>
  );
}