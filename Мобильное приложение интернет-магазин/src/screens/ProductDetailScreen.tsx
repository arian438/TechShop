import React, { useState } from 'react';
import { ArrowLeft, Heart, Share, Star, ShoppingCart, Minus, Plus } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { toast } from '../components/ui/sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
}

export function ProductDetailScreen({ product, onBack }: ProductDetailScreenProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Добавлено в корзину: ${quantity} шт.`);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="relative">
        <div className="aspect-square bg-muted">
          <ImageWithFallback
            src={product.images[selectedImageIndex] || product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Discount Badge */}
        {product.discount && (
          <Badge variant="destructive" className="absolute top-4 left-4">
            -{product.discount}%
          </Badge>
        )}

        {/* Image Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        {/* Title and Rating */}
        <div>
          <h1 className="mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">({product.reviewsCount} отзывов)</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div>
          {product.stockQuantity > 0 ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              В наличии: {product.stockQuantity} шт.
            </Badge>
          ) : (
            <Badge variant="destructive">
              Нет в наличии
            </Badge>
          )}
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h3 className="mb-2">Описание</h3>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Specifications */}
        {product.attributes.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="mb-3">Характеристики</h3>
              <div className="space-y-2">
                {product.attributes.map(attr => (
                  <div key={attr.id} className="flex justify-between">
                    <span className="text-muted-foreground">{attr.name}</span>
                    <span>{attr.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border p-4">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stockQuantity}
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {formatPrice(product.price * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}