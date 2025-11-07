
'use client';
import React, { useState } from 'react';
import { X, Upload, Save } from '../icons/index';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Product, Category, Brand } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface AddProductFormProps {
  onClose: () => void;
  onSave: (product: Partial<Product>, editProduct?: Product) => void;
  editProduct?: Product;
  categories: Category[];
  brands: Brand[];
}

export function AddProductForm({
  onClose,
  onSave,
  editProduct,
  categories,
  brands
}: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    description: editProduct?.description || '',
    price: editProduct?.price?.toString() || '',
    originalPrice: editProduct?.originalPrice?.toString() || '',
    categoryId: editProduct?.categoryId || '',
    brandId: editProduct?.brandId || '',
    imageUrl: editProduct?.imageUrl || '',
    stockQuantity: editProduct?.stockQuantity?.toString() || '0',
    isActive: editProduct?.isActive ?? true,
    isArchived: editProduct?.isArchived ?? false,
  });
  
  const [attributes, setAttributes] = useState(editProduct?.attributes || []);
  const [images, setImages] = useState(editProduct?.images || []);
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
  const [newImage, setNewImage] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setAttributes((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newAttribute.name,
          value: newAttribute.value,
        },
      ]);
      setNewAttribute({ name: '', value: '' });
    }
  };

  const removeAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  const addImage = () => {
    if (newImage && !images.includes(newImage)) {
      setImages((prev) => [...prev, newImage]);
      setNewImage('');
    }
  };

  const removeImage = (imageUrl: string) => {
    setImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Partial<Product> = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      imageUrl: formData.imageUrl,
      images,
      attributes,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      isActive: formData.isActive,
      isArchived: formData.isArchived,
    };
    
    if (formData.originalPrice && parseFloat(formData.originalPrice) > 0) {
        const originalPrice = parseFloat(formData.originalPrice);
        const price = parseFloat(formData.price) || 0;
        productData.originalPrice = originalPrice;
        productData.discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }


    onSave(productData, editProduct);
  };

  const isValid =
    formData.name && formData.price && formData.categoryId && formData.brandId;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="font-normal">
            {editProduct ? 'Редактировать товар' : 'Добавить товар'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-bold">Название товара *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите название товара"
                required
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-bold">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Введите описание товара"
                rows={3}
                className="bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="font-bold">Цена *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0"
                  required
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="originalPrice" className="font-bold">Старая цена</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    handleInputChange('originalPrice', e.target.value)
                  }
                  placeholder="0"
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="font-bold">Категория *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleInputChange('categoryId', value)
                  }
                >
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Выберите категорию">
                      {formData.categoryId
                        ? formData.categoryId
                        : 'Выберите категорию'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand" className="font-bold">Бренд *</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) => handleInputChange('brandId', value)}
                >
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Выберите бренд">
                      {formData.brandId
                        ? formData.brandId
                        : 'Выберите бренд'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="font-bold">Основное изображение</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 bg-muted"
                />
                 <Button type="button" variant="outline" onClick={() => {}}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="stockQuantity" className="font-bold">Количество на складе</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) =>
                  handleInputChange('stockQuantity', e.target.value)
                }
                placeholder="0"
                className="bg-muted"
              />
            </div>
          </div>

          {/* Additional Images */}
          <div className="space-y-3">
            <Label className="font-bold">Дополнительные изображения</Label>
            <div className="flex gap-2">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="URL изображения"
                className="bg-muted"
              />
              <Button type="button" variant="outline" onClick={addImage}>
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    Изображение {index + 1}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => removeImage(image)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Attributes */}
          <div className="space-y-3">
            <Label className="font-bold">Характеристики</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newAttribute.name}
                onChange={(e) =>
                  setNewAttribute((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Название характеристики"
                className="bg-muted"
              />
              <div className="flex gap-2">
                <Input
                  value={newAttribute.value}
                  onChange={(e) =>
                    setNewAttribute((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))
                  }
                  placeholder="Значение"
                  className="bg-muted"
                />
                <Button type="button" variant="outline" onClick={addAttribute}>
                  +
                </Button>
              </div>
            </div>
            {attributes.length > 0 && (
              <div className="space-y-2">
                {attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">
                      <strong>{attr.name}:</strong> {attr.value}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttribute(attr.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive" className="font-bold">Активен</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange('isActive', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isArchived" className="font-bold">В архиве</Label>
              <Switch
                id="isArchived"
                checked={formData.isArchived}
                onCheckedChange={(checked) =>
                  handleInputChange('isArchived', checked)
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!isValid} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {editProduct ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
