'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { doc, deleteDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';


interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isUserLoading: authLoading } = useUser();
  const { firestore, isUserLoading: firebaseLoading } = useFirebase();

  const fetchCart = useCallback(async () => {
    if (user && firestore) {
      setLoading(true);
      try {
        const cartCollectionRef = collection(firestore, `users/${user.uid}/cart`);
        const cartSnapshot = await getDocs(cartCollectionRef);
        const cartItems = cartSnapshot.docs.map(doc => doc.data() as CartItem);
        setItems(cartItems);
      } catch (error) {
        console.error("Error fetching cart: ", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    } else if (!user) {
        setItems([]);
        setLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    const isFirebaseReady = !firebaseLoading;
    const isAuthReady = !authLoading;

    if (isFirebaseReady && isAuthReady) {
        fetchCart();
    } else {
        setItems([]);
        setLoading(true);
    }
  }, [fetchCart, firebaseLoading, authLoading]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = async (product: Product, quantity: number = 1) => {
    if (!user || !firestore) return;
    const cartItemRef = doc(firestore, `users/${user.uid}/cart`, product.id);
    
    const existingItem = items.find(item => item.productId === product.id);

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockQuantity) {
            return;
        }
        await setDoc(cartItemRef, { quantity: newQuantity }, { merge: true });
        setItems(prevItems =>
            prevItems.map(item =>
              item.productId === product.id
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
    } else {
      const newItem: CartItem = { 
        id: product.id, 
        productId: product.id, 
        price: product.price, 
        quantity, 
        name: product.name,
        productName: product.name,
        image: product.imageUrl 
      };
      await setDoc(cartItemRef, newItem);
      setItems(prevItems => [...prevItems, newItem]);
    }
  };

  const removeItem = async (productId: string) => {
    if (!user || !firestore) return;
    const cartItemRef = doc(firestore, `users/${user.uid}/cart`, productId);
    await deleteDoc(cartItemRef);
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || !firestore) return;

    if (quantity <= 0) {
      await removeItem(productId);
    } else {
      const cartItemRef = doc(firestore, `users/${user.uid}/cart`, productId);
      await setDoc(cartItemRef, { quantity }, { merge: true });
      setItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (!user || !firestore) return;
    
    const cartCollectionRef = collection(firestore, `users/${user.uid}/cart`);
    const cartSnapshot = await getDocs(cartCollectionRef);
    
    if(cartSnapshot.empty) return;

    const batch = writeBatch(firestore);
    cartSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, total, addItem, removeItem, updateQuantity, clearCart, loading }}>
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
