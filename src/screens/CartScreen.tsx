
'use client';
import React, { useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { CartItem } from '../components/cart/CartItem';
import { ShoppingBag, Truck } from '../components/icons/index';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface CartScreenProps {
  onCheckout: () => void;
  onGoToHome: () => void;
}

export function CartScreen({ onCheckout, onGoToHome }: CartScreenProps) {
  const { items, total, clearCart, loading: cartLoading } = useCart();
  const { firestore, isUserLoading: firebaseLoading } = useFirebase();

  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);

  const getProductById = (id: string) => products?.find(p => p.id === id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const deliveryFee = total > 50000 ? 0 : 500;
  const totalWithDelivery = total + deliveryFee;

  if (firebaseLoading || cartLoading || productsLoading) {
    return <div className="p-4 space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl mb-2">Корзина пуста</h2>
        <p className="text-muted-foreground mb-6">
          Добавьте товары в корзину, чтобы оформить заказ
        </p>
        <Button onClick={onGoToHome} className="w-full max-w-sm">
          Перейти к покупкам
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-32">
      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {items.map(item => {
          const product = getProductById(item.productId);
          if (!product) return <div key={item.id}>Товар не найден...</div>;
          
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
            <CardTitle className="flex items-center gap-2 text-base">
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
            
            <div className="flex justify-between font-bold text-lg">
              <span>Итого</span>
              <span>{formatPrice(totalWithDelivery)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 space-y-3 z-10">
        <div className="flex justify-between items-center">
          <span className="text-foreground">Итого: </span>
          <span className="font-bold text-lg">{formatPrice(totalWithDelivery)}</span>
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
