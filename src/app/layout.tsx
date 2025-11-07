import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ToastProvider } from '@/contexts/ToastContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TechShop',
  description: 'Мобильное приложение интернет-магазин',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ru">
      <body className={inter.className}>
        <ThemeProvider>
          <FirebaseClientProvider>
            <ToastProvider>
              <NotificationProvider>
                <CartProvider>
                  <FavoritesProvider>
                    {children}
                    <Toaster />
                  </FavoritesProvider>
                </CartProvider>
              </NotificationProvider>
            </ToastProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
