'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase/provider';
import { User } from '@/types';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading: authLoading } = useUser();
  const { firestore, isUserLoading: firebaseLoading } = useFirebase();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  
  const loading = authLoading || firebaseLoading;

  useEffect(() => {
    const fetchUser = async () => {
      if (firebaseUser && firestore) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, [firebaseUser, firestore]);

  useEffect(() => {
    if (currentUser) {
        setFavorites(currentUser.favoriteProducts || []);
    } else {
        setFavorites([]);
    }
  }, [currentUser]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!currentUser || !firestore || loading) return;

    const userRef = doc(firestore, 'users', currentUser.id);
    const isCurrentlyFavorite = favorites.includes(productId);

    try {
      if (isCurrentlyFavorite) {
        await updateDoc(userRef, {
          favoriteProducts: arrayRemove(productId)
        });
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        await updateDoc(userRef, {
          favoriteProducts: arrayUnion(productId)
        });
        setFavorites(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error("Error toggling favorite: ", error);
    }
  }, [currentUser, firestore, loading, favorites]);

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
