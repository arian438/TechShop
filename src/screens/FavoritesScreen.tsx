
'use client';
import React, { useState, useMemo } from 'react';
import { Heart, Search } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Product, Category, User } from '../types';
import { ProductCard } from '../components/catalog/ProductCard';
import { useCollection, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/contexts/FavoritesContext';
import { toast } from '@/components/ui/sonner';

interface FavoritesScreenProps {
  onProductSelect: (product: Product) => void;
  onBack: () => void;
}

export function FavoritesScreen({ onProductSelect, onBack }: FavoritesScreenProps) {
  const { favorites: favoriteIds, loading: favoritesLoading, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const { firestore, isUserLoading: firebaseLoading } = useFirebase();
  
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesCollection);

  const isLoading = favoritesLoading || firebaseLoading || productsLoading || categoriesLoading;

  const favoriteProducts = useMemo(() => {
    if (!favoriteIds || !products) return [];
    return products.filter(p => favoriteIds.includes(p.id));
  }, [products, favoriteIds]);


  const filteredProducts = useMemo(() => {
    return favoriteProducts
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
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [favoriteProducts, searchQuery, filterCategory, sortBy]);

  const favoriteCategories = useMemo(() => {
    if (!categories || !favoriteProducts) return [];
    const categoryIds = new Set(favoriteProducts.map(p => p.categoryId));
    return categories.filter(c => categoryIds.has(c.id));
  }, [favoriteProducts, categories]);
  
  const handleToggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(productId);
    toast({ title: favoriteIds.includes(productId) ? 'Удалено из избранного' : 'Добавлено в избранное'});
  };

  const sortOptions: { [key: string]: string } = {
    name: 'По названию',
    price_asc: 'Сначала дешевые',
    price_desc: 'Сначала дорогие',
    rating: 'По рейтингу',
  };

  if (isLoading) {
    return <div className="p-4 space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    </div>
  }
  
  const getSelectedSortLabel = () => {
    switch (sortBy) {
      case 'name':
        return 'название';
      case 'price_asc':
        return 'сначала дешевые';
      case 'price_desc':
        return 'сначала дорогие';
      case 'rating':
        return 'рейтинг';
      default:
        return 'название';
    }
  };
  
  const getSelectedCategoryLabel = () => {
    if (filterCategory === 'all') {
      return 'все';
    }
    const category = categories?.find(c => c.id === filterCategory);
    return category ? filterCategory : 'все';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 to-red-50/50 dark:from-pink-950/20 dark:to-red-950/20">
        <div className="p-4 space-y-4">
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

                <div className="flex justify-start items-center gap-4">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-auto bg-transparent border-0 p-0 h-auto justify-start text-sm font-normal lowercase">
                           <SelectValue>{getSelectedCategoryLabel()}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Все категории</SelectItem>
                          {favoriteCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-auto bg-transparent border-0 p-0 h-auto justify-start text-sm font-normal lowercase">
                         <SelectValue>{getSelectedSortLabel()}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="name">По названию</SelectItem>
                          <SelectItem value="price_asc">Сначала дешевые</SelectItem>
                          <SelectItem value="price_desc">Сначала дорогие</SelectItem>
                          <SelectItem value="rating">По рейтингу</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                 <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    Найдено: {filteredProducts.length} из {favoriteProducts.length}
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
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
                <h3 className="text-lg mb-2">
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
                    <ProductCard
                        key={product.id}
                        product={product}
                        onProductClick={onProductSelect}
                        showActiveStatus={false}
                    />
                ))}
            </div>
            )}
        </div>
    </div>
  );
}
