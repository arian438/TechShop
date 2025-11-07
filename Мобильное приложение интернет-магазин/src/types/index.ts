export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'manager' | 'admin';
  addresses: DeliveryAddress[];
  favoriteProducts: string[];
  profileImage?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
}

export interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  imageUrl?: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  categoryId: string;
  brandId: string;
  imageUrl: string;
  images: string[];
  attributes: ProductAttribute[];
  stockQuantity: number;
  isActive: boolean;
  isArchived: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  status: 'new' | 'processing' | 'paid' | 'shipping' | 'delivered' | 'cancelled';
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'popularity' | 'newest' | 'rating';
  search?: string;
}

export interface UserSettings {
  notifications: {
    orders: boolean;
    promotions: boolean;
    newProducts: boolean;
    email: boolean;
    push: boolean;
  };
  privacy: {
    showProfile: boolean;
    showOrders: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'product';
  isRead: boolean;
  imageUrl?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}