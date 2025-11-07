import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/sonner';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Добро пожаловать!');
      } else {
        toast.error('Неверный email или пароль');
      }
    } catch (error) {
      toast.error('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'user' | 'manager' | 'admin') => {
    const demoCredentials = {
      user: { email: 'user@example.com', password: 'password123' },
      manager: { email: 'manager@example.com', password: 'password123' },
      admin: { email: 'admin@example.com', password: 'password123' },
    };
    
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle>Вход в аккаунт</CardTitle>
        <CardDescription>
          Введите email и пароль для входа в систему
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Демо аккаунты:</p>
          <div className="flex flex-col gap-1">
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('user')}>
              Пользователь
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('manager')}>
              Менеджер
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')}>
              Администратор
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="link"
            className="w-full p-0"
            onClick={onForgotPassword}
          >
            Забыли пароль?
          </Button>
          <Button
            variant="link"
            className="w-full p-0"
            onClick={onSwitchToRegister}
          >
            Нет аккаунта? Зарегистрируйтесь
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}