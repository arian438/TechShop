
'use client';
import React from 'react';
import { 
  Bell, 
  Lock, 
  Palette, 
  ShoppingBag,
  Tag,
  Package,
  Mail,
  Smartphone,
  Eye,
  Globe,
  Monitor,
  Sun,
  Moon
} from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { User } from '../types';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirebase } from '@/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { toast } from '@/components/ui/sonner';


interface SettingsScreenProps {
  onBack: () => void;
  user: User;
  onLogout: () => void;
}

export function SettingsScreen({ onBack, user, onLogout }: SettingsScreenProps) {
  const { theme, setTheme } = useTheme();
  const { auth, firestore } = useFirebase();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  if (!user) return null;

  const handleDeleteAccount = async () => {
    if (!auth?.currentUser || !firestore) {
      toast({ title: 'Ошибка', description: 'Не удалось получить данные пользователя.', variant: 'destructive'});
      return;
    }

    const firebaseUser = auth.currentUser;

    try {
      // 1. Delete user document from Firestore
      await deleteDoc(doc(firestore, "users", firebaseUser.uid));

      // 2. Delete user from Firebase Auth
      await deleteUser(firebaseUser);

      toast({ title: 'Аккаунт успешно удален'});
      onLogout();
      
    } catch (error: any) {
      console.error("Error deleting account: ", error);
      let description = 'Произошла неизвестная ошибка.';
      if (error.code === 'auth/requires-recent-login') {
        description = 'Эта операция требует недавнего входа в систему. Пожалуйста, войдите в аккаунт еще раз и попробуйте снова.';
      }
      toast({ title: 'Ошибка удаления аккаунта', description, variant: 'destructive'});
    }
  };

  const getSelectedThemeLabel = (value: string) => {
    switch (value) {
      case 'auto':
        return 'системная';
      case 'light':
        return 'светлая';
      case 'dark':
        return 'темная';
      default:
        return 'системная';
    }
  };
  
  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon(theme);
  
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="p-4 space-y-4 pb-20">
        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-lg bg-gradient-to-br from-violet-500 to-blue-600 text-white">
                  {user ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold">{user?.name}</div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-5 w-5 text-blue-500" />
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <ShoppingBag className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label className="font-bold">Заказы</Label>
                  <p className="text-sm text-muted-foreground">Статус доставки, подтверждения</p>
                </div>
              </div>
              <Switch
              />
            </div>
            <Separator/>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label className="font-bold">Акции и скидки</Label>
                  <p className="text-sm text-muted-foreground">Специальные предложения</p>
                </div>
              </div>
              <Switch
                defaultChecked
              />
            </div>
            <Separator/>
             <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label className="font-bold">Новые товары</Label>
                  <p className="text-sm text-muted-foreground">Поступления в избранных категориях</p>
                </div>
              </div>
              <Switch
              />
            </div>
            <Separator/>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                 <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label className="font-bold">Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">Получать уведомления на почту</p>
                </div>
              </div>
              <Switch
                defaultChecked
              />
            </div>
             <Separator/>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label className="font-bold">Push уведомления</Label>
                  <p className="text-sm text-muted-foreground">Уведомления в браузере</p>
                </div>
              </div>
              <Switch
                defaultChecked
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-5 w-5 text-blue-500" />
              Приватность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <Label className="font-bold">Публичный профиль</Label>
                    <p className="text-sm text-muted-foreground">Другие пользователи могут видеть ваш профиль</p>
                  </div>
              </div>
              <Switch
                defaultChecked
              />
            </div>
            <Separator/>
            <div className="flex items-center justify-between">
               <div className="flex items-start gap-3">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <Label className="font-bold">История покупок</Label>
                    <p className="text-sm text-muted-foreground">Показывать историю заказов другим</p>
                  </div>
              </div>
              <Switch
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Palette className="h-5 w-5 text-blue-500" />
              Оформление
            </CardTitle>
          </CardHeader>
           <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Тема оформления</Label>
              <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'auto')}>
                <SelectTrigger className="border-0">
                  <div className="flex items-center gap-2">
                    <ThemeIcon className="h-4 w-4" />
                    <span>{getSelectedThemeLabel(theme)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Системная
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Светлая
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Темная
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="pt-4 flex flex-col items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive bg-red-500/5 hover:bg-red-500/10">
                Удалить аккаунт
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие невозможно отменить. Ваш аккаунт и все связанные с ним данные будут навсегда удалены.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
    </div>
    </div>
  );
}
