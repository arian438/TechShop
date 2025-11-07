import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Category } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CategoryCardProps {
  category: Category;
  onCategoryClick: (category: Category) => void;
}

export function CategoryCard({ category, onCategoryClick }: CategoryCardProps) {
  const getCategoryImage = (slug: string) => {
    const images: Record<string, string> = {
      smartphones: 'https://comphit.ru/img/sovety/sovety506_1.jpg',
      laptops: 'https://avatars.mds.yandex.net/get-mpic/5284155/2a00000193b38be8ad4a1b8b4b6bc7f1d296/orig',
      headphones: 'https://img.mvideo.ru/Pdb/50040578b1.jpg',
      tablets: 'https://cache3.youla.io/files/images/780_780/5a/8f/5a8fef9d22a44962b03b2f74.jpg',
      smartwatches: 'https://almi.ru/storage/images/categories/0004/6377/00046377.jpg',
      'gaming-consoles': 'https://avatars.mds.yandex.net/get-mpic/4696638/2a00000194b6cd1370b7db72cbd7cd38e7ca/orig',
    };
    return images[slug] || 'https://images.unsplash.com/photo-1598442664275-3e4ec7c13565?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3B8ZW58MXx8fHwxNzU4MjUxMjQwfDA&ixlib=rb-4.1.0&q=80&w=300';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onCategoryClick(category)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
            <ImageWithFallback
              src={getCategoryImage(category.slug)}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-sm">{category.name}</h3>
        </div>
      </CardContent>
    </Card>
  );
}