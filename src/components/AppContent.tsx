
'use client';
import React from 'react';
import { HomeScreen } from '@/screens/HomeScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { CartScreen } from '@/screens/CartScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { AdminScreen } from '@/screens/AdminScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { OrderHistoryScreen } from '@/screens/OrderHistoryScreen';
import { AddressesScreen } from '@/screens/AddressesScreen';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { CheckoutScreen } from '@/screens/CheckoutScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Product, User } from '@/types';
import { AuthScreen } from '@/screens/AuthScreen';
import { useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFavorites } from '@/contexts/FavoritesContext';
import { toast } from './ui/sonner';

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

export default function AppContent() {
  const { auth, firestore, user: firebaseUser, isUserLoading: authLoading } = useFirebase();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [history, setHistory] = React.useState<Screen[]>(['home']);

  React.useEffect(() => {
    const fetchUser = async () => {
      if (firebaseUser && firestore) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          // Handle case where user exists in Auth but not Firestore
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, [firebaseUser, firestore]);

  const navigateTo = (screen: Screen) => {
    setHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product-detail');
  };

  const handleTabChange = (tab: string) => {
    const screen = tab as Screen;
    if (['home', 'search', 'cart', 'profile', 'admin'].includes(screen)) {
      setHistory([screen]);
    }
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    const newHistory = [...history];
    newHistory.pop();
    const prevScreen = newHistory[newHistory.length - 1] || 'home';
    setCurrentScreen(prevScreen);
    setHistory(newHistory.length > 0 ? newHistory : ['home']);
  };

  const updateUser = async (user: User) => {
    if (!firestore || !user?.id) {
      throw new Error("Firestore or user not available for update");
    }
    const userRef = doc(firestore, 'users', user.id);
    await setDoc(userRef, user, { merge: true })
      .then(() => {
        setCurrentUser(user);
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: user,
        }));
      });
  };

  const handleShare = async () => {
    if (!selectedProduct) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedProduct.name,
          text: `Check out this product: ${selectedProduct.name}`,
          url: window.location.href,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          toast({ title: 'Нет разрешения делиться', variant: 'destructive' });
        }
      }
    } else {
      toast({ title: 'Функция "Поделиться" не поддерживается на этом устройстве', variant: 'destructive' });
    }
  };

  const handleToggleFavorite = () => {
    if (!selectedProduct) return;
    toggleFavorite(selectedProduct.id);
    toast({ title: isFavorite(selectedProduct.id) ? 'Удалено из избранного' : 'Добавлено в избранное' });
  }

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

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const shouldShowBottomNav = ['home', 'search', 'cart', 'profile', 'admin'].includes(currentScreen);
  const isProductDetail = currentScreen === 'product-detail';
  const shouldShowBackButton = !['home', 'search', 'cart', 'profile', 'admin'].includes(currentScreen) && !isProductDetail;

  if (authLoading) {
      return <div className="flex justify-center items-center h-screen">Загрузка...</div>
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={getScreenTitle()}
        showBackButton={shouldShowBackButton || isProductDetail}
        onBackClick={handleBack}
        onNotificationClick={() => navigateTo('notifications')}
        isProductDetail={isProductDetail}
        onShare={handleShare}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
      />

      <main className="pb-20 min-h-[calc(100vh-3.5rem)]">
        {currentScreen === 'home' && (
          <HomeScreen
            onProductSelect={handleProductSelect}
            onCategorySelect={() => navigateTo('search')}
          />
        )}

        {currentScreen === 'search' && (
          <SearchScreen onProductSelect={handleProductSelect} />
        )}

        {currentScreen === 'cart' && (
          <CartScreen onCheckout={() => navigateTo('checkout')} onGoToHome={() => navigateTo('home')} />
        )}

        {currentScreen === 'profile' && currentUser && (
          <ProfileScreen
            onEditProfile={() => navigateTo('edit-profile')}
            onViewOrders={() => navigateTo('view-orders')}
            onViewAddresses={() => navigateTo('view-addresses')}
            onViewFavorites={() => navigateTo('favorites')}
            onViewSettings={() => navigateTo('settings')}
            user={currentUser}
            onLogout={logout}
          />
        )}

        {currentScreen === 'admin' && currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <AdminScreen currentUser={currentUser} />
        )}

        {currentScreen === 'product-detail' && selectedProduct && (
          <ProductDetailScreen
            product={selectedProduct}
            onBack={handleBack}
          />
        )}

        {currentScreen === 'edit-profile' && currentUser && (
          <EditProfileScreen onBack={handleBack} user={currentUser} updateUser={updateUser} />
        )}

        {currentScreen === 'view-orders' && currentUser && (
          <OrderHistoryScreen onBack={handleBack} user={currentUser} />
        )}

        {currentScreen === 'view-addresses' && currentUser && (
          <AddressesScreen onBack={handleBack} user={currentUser} updateUser={updateUser} />
        )}

        {currentScreen === 'favorites' && currentUser && (
          <FavoritesScreen onProductSelect={handleProductSelect} onBack={handleBack} />
        )}

        {currentScreen === 'settings' && currentUser && (
          <SettingsScreen onBack={handleBack} user={currentUser} onLogout={logout} />
        )}

        {currentScreen === 'checkout' && currentUser && (
          <CheckoutScreen onBack={handleBack} user={currentUser} onOrderPlaced={() => navigateTo('home')} updateUser={updateUser} />
        )}

        {currentScreen === 'notifications' && (
          <NotificationsScreen onBack={handleBack} />
        )}
      </main>

      {shouldShowBottomNav && (
        <BottomNavigation
          activeTab={currentScreen}
          onTabChange={handleTabChange}
          user={currentUser}
        />
      )}

    </div>
  );
}
