
'use client';
import React, { useState } from 'react';
import { Save } from '../icons/index';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { User as UserType } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from '../ui/sonner';

interface AddUserFormProps {
  onClose: () => void;
  onSave: (userData: Omit<UserType, 'id' | 'createdAt' | 'addresses' | 'favoriteProducts'>, password?: string, editUser?: UserType) => Promise<void>;
  editUser?: UserType;
}

export function AddUserForm({ onClose, onSave, editUser }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    name: editUser?.name || '',
    email: editUser?.email || '',
    phone: editUser?.phone || '',
    role: editUser?.role || 'user',
    profileImage: editUser?.profileImage || '',
    birthDate: editUser?.birthDate || '',
    gender: editUser?.gender || '',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!editUser && password !== confirmPassword) {
      toast({ title: 'Пароли не совпадают', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    if (!editUser && password.length < 6) {
      toast({ title: 'Пароль должен содержать минимум 6 символов', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'user' | 'manager' | 'admin',
        profileImage: formData.profileImage,
        birthDate: formData.birthDate,
        gender: formData.gender as 'male' | 'female' | 'other' | '',
      };
      
      await onSave(
        userData,
        !editUser ? password : undefined,
        editUser
      );
    } catch(error: any) {
       toast({ title: 'Ошибка сохранения пользователя', description: error.message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const isValid = formData.name && formData.email && (!editUser ? password : true);
  
  const genderOptions = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
    { value: 'other', label: 'Другой' },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="font-normal">
            {editUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div>
            <Label htmlFor="name" className="font-bold">Полное имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Введите полное имя"
              required
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="email" className="font-bold">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
              required
              disabled={!!editUser}
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="font-bold">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+7 (900) 123-45-67"
              className="bg-muted"
            />
          </div>

          {/* Password fields (only for new users) */}
          {!editUser && (
            <>
              <div>
                <Label htmlFor="password" className="font-bold">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="font-bold">Подтвердите пароль *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  className="bg-muted"
                />
              </div>
            </>
          )}

          {/* Role */}
          <div>
            <Label htmlFor="role" className="font-bold">Роль</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger className="bg-muted">
                <SelectValue>
                  {formData.role === 'admin' ? 'admin' :
                   formData.role === 'manager' ? 'manager' :
                   'user'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Пользователь</SelectItem>
                <SelectItem value="manager">Менеджер</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Info */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Дополнительная информация</h4>

            <div>
              <Label htmlFor="profileImage" className="font-bold">Фото профиля</Label>
              <Input
                id="profileImage"
                value={formData.profileImage}
                onChange={(e) => handleInputChange('profileImage', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="birthDate" className="font-bold">Дата рождения</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="gender" className="font-bold">Пол</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Выберите пол">
                    {(formData.gender && genderOptions.find(o => o.value === formData.gender)?.label.toLowerCase()) || 'Выберите пол'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={!isValid || isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Сохранение...' : (editUser ? 'Сохранить' : 'Добавить')}
            </Button>
          </div>

          {/* Password warning for editing */}
          {editUser && (
            <p className="text-xs text-muted-foreground text-center">
              Для изменения пароля пользователю нужно воспользоваться функцией
              "Забыли пароль?"
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
