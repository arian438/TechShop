'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { toast } from '../ui/sonner';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock reset password
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSuccess(true);
    toast({ title: `Инструкции отправлены на ${email}`});
    
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-bold">Проверьте email</CardTitle>
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
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="font-bold">Восстановление пароля</CardTitle>
        <CardDescription>
          Введите email для получения инструкций по восстановлению пароля
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Отправка...' : 'Отправить инструкции'}
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={onBack} className="p-0 h-auto">
                Назад
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
