
'use client';
import React, { useMemo } from 'react';
import { Search } from '../components/icons/index';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { CategoryCard } from '../components/catalog/CategoryCard';
import { ProductCard } from '../components/catalog/ProductCard';
import { Product, Category } from '../types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeScreenProps {
  onProductSelect: (product: Product) => void;
  onCategorySelect: (category: Category) => void;
}

export function HomeScreen({ onProductSelect, onCategorySelect }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { firestore, isUserLoading: firebaseLoading } = useFirebase();

  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesCollection);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let sortedProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!searchQuery.trim()) {
        return sortedProducts.slice(0, 4);
    }
    
    return sortedProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  const recommendedProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => product.discount && product.discount > 0).slice(0, 2);
  }, [products]);

  const isLoading = firebaseLoading || productsLoading || categoriesLoading;

  if (isLoading) {
    return (
        <div className="space-y-6 pb-20 p-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
  }


  return (
    <div className="space-y-6 pb-20">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted"
          />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2 px-4">
            <h2>Категории</h2>
        </div>
        <div className="px-4 grid grid-cols-3 gap-3">
          {(categories || []).slice(0,6).map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onCategoryClick={onCategorySelect}
            />
          ))}
        </div>
      </section>

      {recommendedProducts.length > 0 && (
        <section className="px-4">
          <div className="flex items-center justify-between mb-2">
            <h2>Рекомендуем</h2>
            <Button variant="link" size="sm">Все товары</Button>
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

      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
            <h2>{searchQuery ? 'Результаты поиска' : 'Новые поступления'}</h2>
            {!searchQuery && <Button variant="link" size="sm">Все товары</Button>}
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

