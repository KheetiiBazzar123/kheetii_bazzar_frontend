export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'farmer' | 'buyer' | 'admin';
  phone?: string;
  address?: Address;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Product {
  _id: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    location: {
      city: string;
      state: string;
    };
  };
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: 'kg' | 'lb' | 'piece' | 'dozen' | 'bunch';
  images: string[];
  freshness: 'fresh' | 'good' | 'average';
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  harvestDate: string;
  expiryDate: string;
  location: Address;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  products: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'wallet' | 'cod';
  shippingAddress: Address;
  deliveryDate?: string;
  blockchainTxId?: string;
  blockchainHash?: string;
  blockchainStatus: 'pending' | 'verified' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Review {
  _id: string;
  product: string;
  buyer: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'product' | 'system' | 'delivery' | 'review' | 'promotion';
  isRead: boolean;
  data?: any;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  role: 'farmer' | 'buyer' | 'admin';
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'farmer' | 'buyer' | 'admin';
  phone?: string;
  address?: Address;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Product filters
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  freshness?: 'fresh' | 'good' | 'average';
  rating?: number;
  search?: string;
  organic?: boolean;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Order statistics
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

// Farmer statistics
export interface FarmerStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalEarnings: number;
}

// Buyer statistics
export interface BuyerStats {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  favoriteCategories: Array<{ category: string; count: number }>;
}

// Blockchain transaction
export interface BlockchainTransaction {
  _id: string;
  order: Order;
  txId: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: number;
  createdAt: string;
  updatedAt: string;
}

// Theme types
export type Theme = 'light' | 'dark';

// Language types
export type Language = 'en' | 'hi';

// Wishlist types
export interface WishlistItem {
  _id: string;
  user: string;
  product: Product;
  addedAt: string;
  notifyWhenAvailable?: boolean;
  notifyOnPriceChange?: boolean;
  priceWhenAdded?: number;
  notes?: string;
}

// Delivery Address Management
export interface DeliveryAddress {
  _id: string;
  user: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddressInput {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType?: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

// Socket events
export interface SocketEvents {
  'order:created': (order: Order) => void;
  'order:updated': (order: Order) => void;
  'order:status-changed': (data: { orderId: string; status: string }) => void;
  'notification:new': (notification: Notification) => void;
  'join-user-room': (userId: string) => void;
  'order-status-update': (data: { orderId: string; status: string; userId: string }) => void;
  'new-notification': (data: { userId: string; notification: Notification }) => void;
}
