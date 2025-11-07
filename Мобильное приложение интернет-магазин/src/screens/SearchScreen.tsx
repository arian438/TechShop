import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal } from '../components/icons/index';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { ProductCard } from '../components/catalog/ProductCard';
import { mockProducts, mockCategories, mockBrands } from '../data/mockData';
import { Product, ProductFilters } from '../types';

interface SearchScreenProps {
  onProductSelect: (product: Product) => void;
}

export function SearchScreen({ onProductSelect }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'newest',
    minPrice: 0,
    maxPrice: 200000,
  });

  // Фильтрация и сортировка товаров
  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    // Поиск по названию и описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории
    if (filters.categoryId) {
      result = result.filter(product => product.categoryId === filters.categoryId);
    }

    // Фильтр по бренду
    if (filters.brandId) {
      result = result.filter(product => product.brandId === filters.brandId);
    }

    // Фильтр по цене
    if (filters.minPrice !== undefined) {
      result = result.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(product => product.price <= filters.maxPrice!);
    }

    // Сортировка
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [searchQuery, filters]);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
    filters.minPrice !== 0 || filters.maxPrice !== 200000,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 pb-20">
      {/* Search Bar */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sorting and Filters */}
        <div className="flex gap-2">
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Новинки</SelectItem>
              <SelectItem value="popularity">Популярные</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="price_asc">Цена ↑</SelectItem>
              <SelectItem value="price_desc">Цена ↓</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                Фильтры
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
                <SheetDescription>
                  Настройте параметры поиска товаров
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Category Filter */}
                <div>
                  <Label className="mb-3 block">Категория</Label>
                  <Select value={filters.categoryId || ''} onValueChange={(value) => updateFilter('categoryId', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все категории</SelectItem>
                      {mockCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                <div>
                  <Label className="mb-3 block">Бренд</Label>
                  <Select value={filters.brandId || ''} onValueChange={(value) => updateFilter('brandId', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все бренды" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все бренды</SelectItem>
                      {mockBrands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="mb-3 block">Цена, ₽</Label>
                  <div className="space-y-4">
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
                  </div>
                </div>

                {/* Clear Filters */}
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Сбросить фильтры
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Results */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Найдено товаров: {filteredProducts.length}
          </span>
        </div>

        {filteredProducts.length > 0 ? (
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