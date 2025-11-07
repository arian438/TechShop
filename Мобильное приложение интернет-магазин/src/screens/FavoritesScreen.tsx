import React, { useState } from 'react';
import { Heart, Search, ShoppingCart, Star, Filter } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { mockProducts, mockCategories } from '../data/mockData';
import { Product } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from '../components/ui/sonner';

interface FavoritesScreenProps {
  onProductSelect: (product: Product) => void;
  onBack: () => void;
}

export function FavoritesScreen({ onProductSelect, onBack }: FavoritesScreenProps) {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');

  const favoriteProducts = mockProducts.filter(product => favorites.includes(product.id));

  const filteredProducts = favoriteProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1, product.price);
    toast(`${product.name} добавлен в корзину`);
  };

  const handleRemoveFromFavorites = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromFavorites(productId);
    toast('Товар удален из избранного');
  };

  const getCategoryName = (categoryId: string) => {
    const category = mockCategories.find(c => c.id === categoryId);
    return category?.name || 'Неизвестная категория';
  };

  const categories = Array.from(new Set(favoriteProducts.map(p => p.categoryId)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 to-red-50/50 dark:from-pink-950/20 dark:to-red-950/20">
      <div className="space-y-6 pb-20 p-4">
        {/* Search and Filters */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="pt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск в избранном..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="flex-1 bg-white/50">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map(categoryId => (
                    <SelectItem key={categoryId} value={categoryId}>
                      {getCategoryName(categoryId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 bg-white/50">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="price_asc">Сначала дешевые</SelectItem>
                  <SelectItem value="price_desc">Сначала дорогие</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Найдено: {filteredProducts.length} из {favoriteProducts.length}
              </div>
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                <Heart className="h-3 w-3 mr-1" />
                {favoriteProducts.length} товаров
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">
                {favoriteProducts.length === 0 ? 'Список избранного пуст' : 'Товары не найдены'}
              </h3>
              <p className="text-muted-foreground">
                {favoriteProducts.length === 0 
                  ? 'Добавляйте товары в избранное, нажимая на сердечко'
                  : 'Попробуйте изменить условия поиска'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="border-0 shadow-md bg-white/70 backdrop-blur-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                onClick={() => onProductSelect(product)}
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative aspect-square">
                    <ImageWithFallback
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleRemoveFromFavorites(product.id, e)}
                      className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </button>

                    {/* Discount Badge */}
                    {product.discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-muted-foreground">
                        {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={product.stockQuantity > 0 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {product.stockQuantity > 0 ? 'В наличии' : 'Нет в наличии'}
                      </Badge>
                      
                      {product.stockQuantity > 0 && (
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(product, e)}
                          className="h-8 px-3 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white border-0"
                        >
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}