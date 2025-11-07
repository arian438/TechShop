import React from 'react';
import { Minus, Plus, Trash2 } from '../icons/index';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CartItem as CartItemType, Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CartItemProps {
  item: CartItemType;
  product: Product;
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
    if (newQuantity <= 0) {
      removeItem(item.productId);
    } else {
      updateQuantity(item.productId, newQuantity);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Product image */}
          <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <ImageWithFallback
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product details */}
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-2 mb-2">{product.name}</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">{formatPrice(item.price)}</span>
                <span className="text-sm text-muted-foreground">
                  Итого: {formatPrice(item.price * item.quantity)}
                </span>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" size={16} />
                </Button>
                
                <span className="w-8 text-center">{item.quantity}</span>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= product.stockQuantity}
                >
                  <Plus className="h-4 w-4" size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" size={16} />
                </Button>
              </div>
            </div>

            {/* Stock warning */}
            {product.stockQuantity < 5 && (
              <p className="text-xs text-orange-600 mt-1">
                Внимание: осталось только {product.stockQuantity} шт.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}