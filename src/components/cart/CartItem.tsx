
'use client';
import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CartItem as CartItemType, Product } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
  product?: Product;
}

export function CartItem({ item, product }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.productId, newQuantity);
  };

  if (!product) {
      return (
          <Card>
              <CardContent className="p-4">
                  <p>Товар не найден в корзине.</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <ImageWithFallback
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-2 mb-2 font-normal">{product.name}</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold">{formatPrice(item.price)}</span>
                <span className="text-sm text-muted-foreground">
                  Итого: {formatPrice(item.price * item.quantity)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="w-8 text-center">{item.quantity}</span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= product.stockQuantity}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {product.stockQuantity > 0 && product.stockQuantity < 5 && (
              <p className="text-xs text-destructive mt-1">
                Осталось всего {product.stockQuantity} шт.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
