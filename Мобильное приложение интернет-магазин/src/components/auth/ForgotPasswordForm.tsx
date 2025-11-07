import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/sonner';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await resetPassword(email);
      if (success) {
        setIsSuccess(true);
        toast.success('Инструкции отправлены на email');
      } else {
        toast.error('Пользователь с таким email не найден');
      }
    } catch (error) {
      toast.error('Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle>Проверьте email</CardTitle>
          <CardDescription>
            Мы отправили инструкции по восстановлению пароля на адрес {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} className="w-full">
            Вернуться к входу
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle>Восстановление пароля</CardTitle>
        <CardDescription>
          Введите email для получения инструкций по восстановлению пароля
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Отправка...' : 'Отправить инструкции'}
            </Button>
            <Button variant="outline" onClick={onBack}>
              Назад
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}