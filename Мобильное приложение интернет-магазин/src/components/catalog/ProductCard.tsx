import React from 'react';
import { Heart, Star, ShoppingCart } from '../icons/index';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { toast } from '../ui/sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success('Товар добавлен в корзину');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discountPrice = product.originalPrice 
    ? product.originalPrice - product.price
    : 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onProductClick(product)}
    >
      <CardContent className="p-3">
        <div className="relative mb-3">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-40 object-cover rounded-md"
          />
          
          {/* Discount badge */}
          {product.discount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2"
            >
              -{product.discount}%
            </Badge>
          )}
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-1 h-auto bg-white/80 hover:bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="h-4 w-4" size={16} />
          </Button>
          
          {/* Stock indicator */}
          {product.stockQuantity < 5 && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 left-2 text-xs"
            >
              Осталось: {product.stockQuantity}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {/* Product name */}
          <h3 className="line-clamp-2 h-12">{product.name}</h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" size={16} />
            <span className="text-sm">{product.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewsCount})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
            >
              <ShoppingCart className="h-4 w-4" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}