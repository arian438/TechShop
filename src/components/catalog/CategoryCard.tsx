
'use client';
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Category } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CategoryCardProps {
  category: Category;
  onCategoryClick: (category: Category) => void;
}

export function CategoryCard({ category, onCategoryClick }: CategoryCardProps) {
  const imageUrl = Array.isArray(category.images) ? category.images[0] : category.images;
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onCategoryClick(category)}
    >
      <CardContent className="p-2">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-muted">
            <ImageWithFallback
              src={imageUrl}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xs font-medium h-8 line-clamp-2">{category.name}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
