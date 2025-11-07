import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { CartScreen } from './screens/CartScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { AdminScreen } from './screens/AdminScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { OrderHistoryScreen } from './screens/OrderHistoryScreen';
import { AddressesScreen } from './screens/AddressesScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { ToastProvider, Toaster } from './components/ui/sonner';
import { Product, Category } from './types';

type Screen = 
  | 'home' 
  | 'search' 
  | 'cart' 
  | 'profile' 
  | 'admin'
  | 'product-detail'
  | 'edit-profile'
  | 'view-orders'
  | 'view-addresses'
  | 'favorites'
  | 'settings'
  | 'checkout'
  | 'notifications';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product-detail');
  };

  const handleCategorySelect = (category: Category) => {
    // В реальном приложении здесь будет переход к экрану категории с фильтром
    setCurrentScreen('search');
  };

  const handleTabChange = (tab: string) => {
    setCurrentScreen(tab as Screen);
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleCheckout = () => {
    setCurrentScreen('checkout');
  };

  const handleNavigateToFavorites = () => {
    setCurrentScreen('favorites');
  };

  const handleNavigateToSettings = () => {
    setCurrentScreen('settings');
  };

  const handleNavigateToNotifications = () => {
    setCurrentScreen('notifications');
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'home': return 'TechShop';
      case 'search': return 'Поиск';
      case 'cart': return 'Корзина';
      case 'profile': return 'Профиль';
      case 'admin': return 'Управление';
      case 'product-detail': return selectedProduct?.name || 'Товар';
      case 'edit-profile': return 'Редактировать профиль';
      case 'view-orders': return 'Мои заказы';
      case 'view-addresses': return 'Адреса доставки';
      case 'favorites': return 'Избранное';
      case 'settings': return 'Настройки';
      case 'checkout': return 'Оформление заказа';
      case 'notifications': return 'Уведомления';
      default: return 'TechShop';
    }
  };

  const shouldShowBottomNav = !['product-detail', 'edit-profile', 'view-orders', 'view-addresses', 'favorites', 'settings', 'checkout', 'notifications'].includes(currentScreen);
  const shouldShowBackButton = ['product-detail', 'edit-profile', 'view-orders', 'view-addresses', 'favorites', 'settings', 'checkout', 'notifications'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={getScreenTitle()}
        showBackButton={shouldShowBackButton}
        onBackClick={handleBack}
        onNotificationClick={handleNavigateToNotifications}
      />
      
      <main className="min-h-[calc(100vh-3.5rem)]">
        {currentScreen === 'home' && (
          <HomeScreen
            onProductSelect={handleProductSelect}
            onCategorySelect={handleCategorySelect}
          />
        )}
        
        {currentScreen === 'search' && (
          <SearchScreen onProductSelect={handleProductSelect} />
        )}
        
        {currentScreen === 'cart' && (
          <CartScreen onCheckout={handleCheckout} />
        )}
        
        {currentScreen === 'profile' && (
          <ProfileScreen
            onEditProfile={() => setCurrentScreen('edit-profile')}
            onViewOrders={() => setCurrentScreen('view-orders')}
            onViewAddresses={() => setCurrentScreen('view-addresses')}
            onViewFavorites={() => setCurrentScreen('favorites')}
            onViewSettings={() => setCurrentScreen('settings')}
          />
        )}
        
        {currentScreen === 'admin' && user && (user.role === 'admin' || user.role === 'manager') && (
          <AdminScreen />
        )}
        
        {currentScreen === 'product-detail' && selectedProduct && (
          <ProductDetailScreen
            product={selectedProduct}
            onBack={handleBack}
          />
        )}
        
        {currentScreen === 'edit-profile' && (
          <EditProfileScreen onBack={handleBack} />
        )}
        
        {currentScreen === 'view-orders' && (
          <OrderHistoryScreen onBack={handleBack} />
        )}
        
        {currentScreen === 'view-addresses' && (
          <AddressesScreen onBack={handleBack} />
        )}
        
        {currentScreen === 'favorites' && (
          <FavoritesScreen onProductSelect={handleProductSelect} onBack={handleBack} />
        )}
        
        {currentScreen === 'settings' && (
          <SettingsScreen onBack={handleBack} />
        )}
        
        {currentScreen === 'checkout' && (
          <CheckoutScreen onBack={handleBack} />
        )}
        
        {currentScreen === 'notifications' && (
          <NotificationsScreen onBack={handleBack} />
        )}
      </main>
      
      {shouldShowBottomNav && (
        <BottomNavigation
          activeTab={currentScreen}
          onTabChange={handleTabChange}
        />
      )}
      
      <Toaster />
      <div data-toast-container className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"></div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}