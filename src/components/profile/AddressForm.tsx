
'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { DeliveryAddress } from '../../types';

interface AddressFormProps {
  onSave: (data: Omit<DeliveryAddress, 'id'>) => void;
  onCancel: () => void;
  initialData?: Omit<DeliveryAddress, 'id'> | DeliveryAddress;
}

export function AddressForm({ onSave, onCancel, initialData }: AddressFormProps) {
  const [formData, setFormData] = useState<Omit<DeliveryAddress, 'id'>>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    postalCode: initialData?.postalCode || '',
    phone: initialData?.phone || '',
    isDefault: initialData?.isDefault || false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const isFormValid = formData.name && formData.address && formData.city && formData.phone;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="font-bold">Название адреса</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Дом, Работа, etc."
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className="font-bold">Город</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="Москва"
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="font-bold">Адрес</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="ул. Примерная, д. 1, кв. 1"
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode" className="font-bold">Почтовый индекс</Label>
        <Input
          id="postalCode"
          value={formData.postalCode}
          onChange={(e) => handleInputChange('postalCode', e.target.value)}
          placeholder="123456"
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="font-bold">Телефон</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+7 (999) 999-99-99"
          className="bg-muted"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="default"
          checked={formData.isDefault}
          onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
        />
        <Label htmlFor="default" className="font-bold">Адрес по умолчанию</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          {initialData ? 'Обновить' : 'Добавить'}
        </Button>
      </div>
    </div>
  );
}
