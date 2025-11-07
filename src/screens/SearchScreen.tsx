
'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, ArrowDown, ArrowUp } from '../components/icons/index';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../components/ui/sheet';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { ProductCard } from '../components/catalog/ProductCard';
import { Product, ProductFilters, Category, Brand } from '../types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const sortOptions: { [key: string]: React.ReactNode } = {
  newest: 'Новинки',
  popularity: 'Популярные',
  rating: 'По рейтингу',
  price_asc: <span className="flex items-center">Цена <ArrowUp className="h-4 w-4 ml-1" /></span>,
  price_desc: <span className="flex items-center">Цена <ArrowDown className="h-4 w-4 ml-1" /></span>,
};

interface SearchScreenProps {
  onProductSelect: (product: Product) => void;
}


export function SearchScreen({ onProductSelect }: { onProductSelect: (product: Product) => void; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'newest',
    minPrice: 0,
    maxPrice: 200000,
  });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { firestore, isUserLoading: firebaseLoading } = useFirebase();

  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const brandsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'brands') : null, [firestore]);

  const { data: products = [], isLoading: productsLoading } = useCollection<Product>(productsCollection);
  const { data: categories = [], isLoading: categoriesLoading } = useCollection<Category>(categoriesCollection);
  const { data: brands = [], isLoading: brandsLoading } = useCollection<Brand>(brandsCollection);


  const isLoading = firebaseLoading || productsLoading || categoriesLoading || brandsLoading;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      result = result.filter(product => product.categoryId === filters.categoryId);
    }

    if (filters.brandId && filters.brandId !== 'all') {
      result = result.filter(product => product.brandId === filters.brandId);
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(product => product.price <= filters.maxPrice!);
    }

    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [searchQuery, filters, products]);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'newest',
      minPrice: 0,
      maxPrice: 200000,
    });
  };

  const activeFiltersCount = [
    filters.categoryId,
    filters.brandId,
    (filters.minPrice || 0) > 0,
    (filters.maxPrice || 200000) < 200000,
  ].filter(Boolean).length;
  
  const getSelectedSortLabel = useCallback(() => {
    const sortBy = filters.sortBy || 'newest';
    if (sortBy === 'rating') return 'рейтинг';
    if (sortBy === 'price_asc') return 'цена возр';
    if (sortBy === 'price_desc') return 'цена убыв';
    
    const label = sortOptions[sortBy];
    if (typeof label === 'string') {
      return label.toLowerCase();
    }
    
    return 'новинки';
  }, [filters.sortBy]);
  
  const getSelectedCategoryLabel = useCallback(() => {
    if (!filters.categoryId || filters.categoryId === 'all') {
      return "Все категории";
    }
    const category = categories.find(c => c.id === filters.categoryId);
    return category ? category.name : "Все категории";
  }, [filters.categoryId, categories]);
  
  const getSelectedBrandLabel = useCallback(() => {
    if (!filters.brandId || filters.brandId === 'all') {
      return "Все бренды";
    }
    const brand = brands.find(b => b.id === filters.brandId);
    return brand ? brand.name : "Все бренды";
  }, [filters.brandId, brands]);


  return (
    <div className="space-y-4 pb-20">
      <div className="p-4 space-y-3 sticky top-0 bg-background z-10 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted"
          />
        </div>

        <div className="flex justify-start gap-2">
           <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-auto bg-muted h-9 border-none lowercase">
              <SelectValue>
                <span className="flex items-center">{getSelectedSortLabel()}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortOptions).map(([key, label]) => (
                 <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative bg-muted h-9 border-none">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Фильтры
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw]">
              <SheetHeader className="text-center mb-6">
                <SheetTitle>Фильтры</SheetTitle>
                 <SheetDescription>
                  Настройте параметры поиска товаров
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 overflow-y-auto h-[calc(100%-120px)] p-1">
                <div className="space-y-2">
                  <Label className="font-medium">Категория</Label>
                   <Select value={filters.categoryId || 'all'} onValueChange={(value) => updateFilter('categoryId', value)}>
                    <SelectTrigger className="bg-muted">
                       <SelectValue>{filters.categoryId && filters.categoryId !== 'all' ? getSelectedCategoryLabel() : 'Все категории'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {(categories || []).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Бренд</Label>
                  <Select value={filters.brandId || 'all'} onValueChange={(value) => updateFilter('brandId', value)}>
                    <SelectTrigger className="bg-muted">
                       <SelectValue>{filters.brandId && filters.brandId !== 'all' ? getSelectedBrandLabel() : 'Все бренды'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все бренды</SelectItem>
                      {(brands || []).map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Цена, ₽</Label>
                  <div className="space-y-4 pt-2">
                    <Slider
                      min={0}
                      max={200000}
                      step={1000}
                      value={[filters.minPrice || 0, filters.maxPrice || 200000]}
                      onValueChange={(value) => {
                        updateFilter('minPrice', value[0]);
                        updateFilter('maxPrice', value[1]);
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{(filters.minPrice || 0).toLocaleString('ru-RU')} ₽</span>
                      <span>{(filters.maxPrice || 200000).toLocaleString('ru-RU')} ₽</span>
                    </div>
                     <div className="text-center">
                        <Button variant="link" onClick={clearFilters}>
                            Сбросить фильтры
                        </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Найдено товаров: {filteredProducts.length}
          </span>
        </div>

        {isLoading ? (
             <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={onProductSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'По вашему запросу ничего не найдено' : 'Начните поиск товаров'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Сбросить поиск
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
