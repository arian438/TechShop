import React, { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Star } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { DeliveryAddress } from '../types';
import { toast } from '../components/ui/sonner';

interface AddressesScreenProps {
  onBack: () => void;
}

export function AddressesScreen({ onBack }: AddressesScreenProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(user?.addresses || []);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      isDefault: false
    });
  };

  const handleAddAddress = () => {
    const newAddress: DeliveryAddress = {
      id: Date.now().toString(),
      ...formData
    };

    if (formData.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
    }

    setAddresses(prev => [...prev, newAddress]);
    setShowAddDialog(false);
    resetForm();
    toast('Адрес успешно добавлен');
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddDialog(true);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    if (formData.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
    }

    setAddresses(prev => prev.map(addr => 
      addr.id === editingAddress.id ? { ...addr, ...formData } : addr
    ));
    
    setShowAddDialog(false);
    setEditingAddress(null);
    resetForm();
    toast('Адрес успешно обновлен');
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    toast('Адрес удален');
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    toast('Адрес по умолчанию изменен');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name && formData.address && formData.city && formData.phone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <div className="space-y-6 pb-20 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">Адреса доставки</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
                onClick={() => {
                  setEditingAddress(null);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Редактировать адрес' : 'Добавить новый адрес'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название адреса</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Дом, Работа, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Москва"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="ул. Примерная, д. 1, кв. 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Почтовый индекс</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="default"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                  />
                  <Label htmlFor="default">Адрес по умолчанию</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false);
                      setEditingAddress(null);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                    disabled={!isFormValid}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
                  >
                    {editingAddress ? 'Обновить' : 'Добавить'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Нет сохраненных адресов</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте адрес доставки для быстрого оформления заказов
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый адрес
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {address.name}
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              <Star className="h-3 w-3 mr-1" />
                              По умолчанию
                            </Badge>
                          )}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p>{address.city}, {address.address}</p>
                    {address.postalCode && <p>Индекс: {address.postalCode}</p>}
                    <p>Телефон: {address.phone}</p>
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs"
                    >
                      Сделать основным
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}