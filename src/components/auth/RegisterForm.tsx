'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { toast } from '../ui/sonner';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '@/types';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { auth, firestore } = useFirebase();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Пароли не совпадают', variant: 'destructive'});
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: 'Пароль должен содержать минимум 6 символов', variant: 'destructive'});
      return;
    }

    if (!auth || !firestore) {
      toast({ title: 'Ошибка регистрации', description: 'Сервис регистрации недоступен.', variant: 'destructive'});
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      const newUser: Omit<User, 'id'> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'user',
          addresses: [],
          favoriteProducts: [],
          createdAt: new Date().toISOString(),
      };

      await setDoc(doc(firestore, "users", firebaseUser.uid), newUser);
      toast({ title: 'Регистрация прошла успешно!'});
      // You might want to automatically log in the user or switch to login form
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({ title: 'Ошибка регистрации', description: 'Этот email уже используется.', variant: 'destructive'});
      } else {
        toast({ title: 'Ошибка регистрации', description: error.message || 'Произошла неизвестная ошибка.', variant: 'destructive'});
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="font-bold">Регистрация</CardTitle>
        <CardDescription>
          Создайте новый аккаунт для покупок
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold">ФИО</Label>
            <Input
              id="name"
              type="text"
              placeholder="Иван Иванов"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-bold">Телефон (необязательно)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 999 123-45-67"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 6 символов"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-bold">Подтвердите пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
              className="bg-muted"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="mt-4">
          <Button
            variant="link"
            className="w-full p-0"
            onClick={onSwitchToLogin}
          >
            Уже есть аккаунт? Войти
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
