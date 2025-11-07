
'use client';
import React from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { toast } from '../ui/sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  showActiveStatus?: boolean;
}

export function ProductCard({ product, onProductClick, showActiveStatus = true }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isProdFavorite = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast({ title: 'Товар добавлен в корзину'});
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onProductClick(product)}
    >
      <CardContent className="p-3">
        <div className="relative mb-3">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-40 object-cover rounded-md"
          />
          
          {product.discount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2"
            >
              -{product.discount}%
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-1 h-auto bg-background/70 rounded-full"
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isProdFavorite ? 'text-destructive fill-destructive' : 'text-foreground'}`} />
          </Button>
          
          {product.stockQuantity > 0 && product.stockQuantity < 10 && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 left-2 text-xs"
            >
              Осталось: {product.stockQuantity}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="line-clamp-2 h-10 text-sm font-normal">{product.name}</h3>
          
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{product.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewsCount})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-normal">{formatPrice(product.price)}</span>
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
              className="h-8 w-10 p-0"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
           {showActiveStatus && product.isActive && (
            <div className="text-xs text-green-600">
              активен
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
