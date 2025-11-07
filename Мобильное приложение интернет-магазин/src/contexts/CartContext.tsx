import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartState, Product } from '../types';

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    total: 0,
  });

  useEffect(() => {
    // Загружаем корзину из localStorage при инициализации
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartState(cart);
    }
  }, []);

  useEffect(() => {
    // Сохраняем корзину в localStorage при изменении
    localStorage.setItem('cart', JSON.stringify(cartState));
  }, [cartState]);

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const addItem = (product: Product, quantity: number = 1) => {
    setCartState(prevState => {
      const existingItemIndex = prevState.items.findIndex(item => item.productId === product.id);
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Если товар уже в корзине, увеличиваем количество
        newItems = [...prevState.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Добавляем новый товар
        const newItem: CartItem = {
          id: Date.now().toString(),
          productId: product.id,
          quantity,
          price: product.price,
        };
        newItems = [...prevState.items, newItem];
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  const removeItem = (productId: string) => {
    setCartState(prevState => {
      const newItems = prevState.items.filter(item => item.productId !== productId);
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCartState(prevState => {
      const newItems = prevState.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  const clearCart = () => {
    setCartState({
      items: [],
      total: 0,
    });
  };

  const getItemCount = (): number => {
    return cartState.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        ...cartState,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}