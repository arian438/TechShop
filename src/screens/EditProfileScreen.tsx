
'use client';
import React, { useState, useRef } from 'react';
import { Camera, Save, User as UserIcon } from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { User as UserType } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon } from '@/components/icons';

interface EditProfileScreenProps {
  onBack: () => void;
  user: UserType;
  updateUser: (user: UserType) => Promise<void>;
}

export function EditProfileScreen({ onBack, user, updateUser }: EditProfileScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserType>(user);
  const [isLoading, setIsLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    user.birthDate ? new Date(user.birthDate) : undefined
  );

  const handleInputChange = (field: keyof UserType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date);
    if (date) {
      handleInputChange('birthDate', date.toISOString().split('T')[0]);
    } else {
      handleInputChange('birthDate', '');
    }
  };


  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      onBack();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const genderOptions = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
    { value: 'other', label: 'Другой' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="p-4 space-y-4 pb-20">
        {/* Profile Photo */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={formData.profileImage} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg h-10 w-10 border-2 border-white hover:bg-blue-600"
                  onClick={handleImageUpload}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Нажмите на камеру для изменения фото
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
           <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-5 w-5 text-blue-500" />
              Личная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">Полное имя</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Введите email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-bold">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+7 (999) 999-99-99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="font-bold">Дата рождения</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input-background",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center">
                        {birthDate ? format(birthDate, "dd.MM.yyyy") : <span>Выберите дату</span>}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={ru}
                    captionLayout="dropdown-buttons"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Пол</Label>
              <Select value={formData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex-1 bg-white/50 hover:bg-white/80"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
    </div>
    </div>
  );
}
