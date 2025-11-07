import React, { useState } from 'react';
import { 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Smartphone, 
  Mail, 
  Eye, 
  ShoppingBag,
  Tag,
  Package,
  Moon,
  Sun,
  Monitor
} from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { UserSettings } from '../types';
import { toast } from '../components/ui/sonner';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      orders: true,
      promotions: true,
      newProducts: false,
      email: true,
      push: true,
    },
    privacy: {
      showProfile: true,
      showOrders: false,
    },
    theme: 'auto',
    language: 'ru'
  });

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    toast('Настройки уведомлений обновлены');
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
    toast('Настройки приватности обновлены');
  };

  const handleThemeChange = (theme: string) => {
    setSettings(prev => ({ ...prev, theme: theme as 'light' | 'dark' | 'auto' }));
    toast('Тема оформления изменена');
  };

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({ ...prev, language: language as 'ru' | 'en' }));
    toast('Язык интерфейса изменен');
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon(settings.theme);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/20 dark:to-cyan-950/20">
      <div className="space-y-6 pb-20 p-4">
        {/* Profile Info */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-500" />
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Заказы</Label>
                  <p className="text-sm text-muted-foreground">Статус доставки, подтверждения</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.orders}
                onCheckedChange={(checked) => handleNotificationChange('orders', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Акции и скидки</Label>
                  <p className="text-sm text-muted-foreground">Специальные предложения</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.promotions}
                onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Новые товары</Label>
                  <p className="text-sm text-muted-foreground">Поступления в избранных категориях</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.newProducts}
                onCheckedChange={(checked) => handleNotificationChange('newProducts', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">Получать уведомления на почту</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Push уведомления</Label>
                  <p className="text-sm text-muted-foreground">Уведомления в браузере</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-500" />
              Приватность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Публичный профиль</Label>
                  <p className="text-sm text-muted-foreground">Другие пользователи могут видеть ваш профиль</p>
                </div>
              </div>
              <Switch
                checked={settings.privacy.showProfile}
                onCheckedChange={(checked) => handlePrivacyChange('showProfile', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>История покупок</Label>
                  <p className="text-sm text-muted-foreground">Показывать историю заказов другим</p>
                </div>
              </div>
              <Switch
                checked={settings.privacy.showOrders}
                onCheckedChange={(checked) => handlePrivacyChange('showOrders', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-500" />
              Оформление
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Тема оформления</Label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="bg-white/50">
                  <div className="flex items-center gap-2">
                    <ThemeIcon className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
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
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Системная
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Язык</Label>
              <Select value={settings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="bg-white/50">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full bg-white/50 hover:bg-white/80"
          >
            Экспорт данных
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-destructive border-destructive/20 bg-red-50/50 hover:bg-red-100/80"
          >
            Удалить аккаунт
          </Button>
        </div>
      </div>
    </div>
  );
}