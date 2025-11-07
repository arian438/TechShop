
'use client';
import React, { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Star } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DeliveryAddress, User } from '../types';
import { toast } from '../components/ui/sonner';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter, FirestorePermissionError, useFirebase } from '@/firebase';
import { AddressForm } from '../components/profile/AddressForm';

interface AddressesScreenProps {
  onBack: () => void;
  user: User;
  updateUser: (user: User) => Promise<void>;
}

export function AddressesScreen({ onBack, user, updateUser }: AddressesScreenProps) {
  const { firestore } = useFirebase();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(user?.addresses || []);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);

  const handleSaveAddresses = async (updatedAddresses: DeliveryAddress[]) => {
    if (!firestore || !user?.id) return;
    const updatedUser = { ...user, addresses: updatedAddresses };
    await updateUser(updatedUser);
    setAddresses(updatedAddresses);
  };


  const handleAddAddress = async (formData: Omit<DeliveryAddress, 'id'>) => {
    const newAddress: DeliveryAddress = {
      id: Date.now().toString(),
      ...formData
    };

    let updatedAddresses = [...addresses];
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    updatedAddresses.push(newAddress);
    
    await handleSaveAddresses(updatedAddresses);
    setShowAddDialog(false);
    toast({ title: 'Адрес успешно добавлен' });
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setShowAddDialog(true);
  };

  const handleUpdateAddress = async (formData: Omit<DeliveryAddress, 'id'>) => {
    if (!editingAddress) return;

    let updatedAddresses = [...addresses];
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    updatedAddresses = updatedAddresses.map(addr => 
      addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } : addr
    );
    
    await handleSaveAddresses(updatedAddresses);
    setShowAddDialog(false);
    setEditingAddress(null);
    toast({ title: 'Адрес успешно обновлен' });
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    handleSaveAddresses(updatedAddresses);
    toast({ title: 'Адрес удален', variant: 'destructive' });
  };

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    handleSaveAddresses(updatedAddresses);
    toast({ title: 'Адрес по умолчанию изменен' });
  };

  return (
    <div className="p-4 space-y-4 bg-muted/40 min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Адреса доставки</h1>
          <Dialog open={showAddDialog} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingAddress(null);
            }
            setShowAddDialog(isOpen)
          }}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                onClick={() => setEditingAddress(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center font-bold">
                  {editingAddress ? 'Редактировать адрес' : 'Добавить новый адрес'}
                </DialogTitle>
              </DialogHeader>
              <AddressForm
                onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
                onCancel={() => setShowAddDialog(false)}
                initialData={editingAddress || undefined}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3>Нет сохраненных адресов</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте адрес доставки для быстрого оформления заказов
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый адрес
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold flex items-center gap-2">
                          {address.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {address.isDefault && (
                        <Badge variant="secondary" className="text-xs font-normal bg-muted">
                          <Star className="h-3 w-3 mr-1" />
                          По умолчанию
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAddress(address)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{address.city}, {address.address}</p>
                    <p>Индекс: {address.postalCode}</p>
                    <p>Телефон: {address.phone}</p>
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs p-0 h-auto mt-2"
                    >
                      Сделать по умолчанию
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
