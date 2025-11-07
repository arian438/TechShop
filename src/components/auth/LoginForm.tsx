'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { toast } from '../ui/sonner';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!auth) {
      toast({ title: 'Ошибка аутентификации', description: 'Сервис аутентификации не доступен.', variant: 'destructive'});
      setIsLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Вход выполнен успешно!'});
    } catch (error: any) {
       toast({ title: 'Ошибка входа', description: 'Неверный email или пароль.', variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'manager' | 'admin') => {
    setIsLoading(true);
    const demoCredentials = {
      user: { email: 'user@example.com', password: 'user123' },
      manager: { email: 'manager@example.com', password: 'manager123' },
      admin: { email: 'admin@example.com', password: 'admin123' },
    };
    
    const { email, password } = demoCredentials[role];
    setEmail(email);
    setPassword(password);

    if (!auth) {
      toast({ title: 'Ошибка аутентификации', description: 'Сервис аутентификации не доступен.', variant: 'destructive'});
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Вход выполнен успешно!'});
    } catch (error: any) {
      toast({ title: 'Ошибка входа для демо-пользователя', description: 'Неверный email или пароль.', variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="font-bold">Вход в аккаунт</CardTitle>
        <CardDescription>
          Введите email и пароль для входа в систему
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-muted"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Демо аккаунты:</p>
          <div className="flex flex-col gap-1 items-center">
            <Button type="button" variant="link" className="p-0 h-auto" onClick={() => handleDemoLogin('user')}>
              Пользователь
            </Button>
            <Button type="button" variant="link" className="p-0 h-auto" onClick={() => handleDemoLogin('manager')}>
              Менеджер
            </Button>
            <Button type="button" variant="link" className="p-0 h-auto" onClick={() => handleDemoLogin('admin')}>
              Администратор
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <Button
            type="button"
            variant="link"
            className="w-auto p-0 h-auto"
            onClick={onForgotPassword}
          >
            Забыли пароль?
          </Button>
          <div>
            <Button
              type="button"
              variant="link"
              className="w-auto p-0 h-auto"
              onClick={onSwitchToRegister}
            >
              Нет аккаунта? Зарегистрируйтесь
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
