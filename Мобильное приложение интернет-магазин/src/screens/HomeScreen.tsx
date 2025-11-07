import React, { useState, useMemo } from 'react';
import { Search } from '../components/icons/index';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { CategoryCard } from '../components/catalog/CategoryCard';
import { ProductCard } from '../components/catalog/ProductCard';
import { mockCategories, mockProducts } from '../data/mockData';
import { Product, Category } from '../types';

interface HomeScreenProps {
  onProductSelect: (product: Product) => void;
  onCategorySelect: (category: Category) => void;
}

export function HomeScreen({ onProductSelect, onCategorySelect }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация товаров по поиску
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return mockProducts.slice(0, 4); // Показываем только первые 4 для главной
    
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Рекомендуемые товары (с скидкой)
  const recommendedProducts = useMemo(() => {
    return mockProducts.filter(product => product.discount && product.discount > 0);
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" size={16} />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <section className="px-4">
        <h2 className="mb-4">Категории</h2>
        <div className="grid grid-cols-3 gap-3">
          {mockCategories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onCategoryClick={onCategorySelect}
            />
          ))}
        </div>
      </section>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2>Рекомендуем</h2>
            <Button variant="link" className="p-0">
              Все товары
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recommendedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={onProductSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search Results or Popular Products */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2>{searchQuery ? 'Результаты поиска' : 'Популярные товары'}</h2>
          {!searchQuery && (
            <Button variant="link" className="p-0">
              Все товары
            </Button>
          )}
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
          <div className="text-center py-8">
            <p className="text-muted-foreground">Товары не найдены</p>
          </div>
        )}
      </section>
    </div>
  );
}