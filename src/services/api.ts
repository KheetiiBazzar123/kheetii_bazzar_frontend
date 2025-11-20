import { ApiResponse, User, Product, Order, Review, Notification, FarmerStats, BuyerStats } from '@/types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/v1`;

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData
      );
    }

    return response.json();
  }

  // Auth APIs
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'farmer' | 'buyer';
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Farmer APIs
  async getFarmerDashboard(): Promise<ApiResponse<{
    stats: FarmerStats;
    recentOrders: Order[];
    topProducts: Product[];
  }>> {
    return this.request('/farmer/dashboard');
  }

  // async getFarmerProducts(params?: {
  //   page?: number;
  //   limit?: number;
  //   search?: string;
  //   category?: string;
  //   isAvailable?: boolean;
  // }): Promise<ApiResponse<{
  //   products: Product[];
  //   total: number;
  //   page: number;
  //   pages: number;
  // }>> {
  //   const queryParams = new URLSearchParams();
  //   if (params) {
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) {
  //         queryParams.append(key, value.toString());
  //       }
  //     });
  //   }
  //   return this.request(`/farmer/products?${queryParams.toString()}`);
  // }

  // async createProduct(productData: FormData): Promise<ApiResponse<{ product: Product }>> {
  //   return this.request('/farmer/products', {
  //     method: 'POST',
  //     headers: {}, // Let browser set Content-Type for FormData
  //     body: productData,
  //   });
  // }


  async updateProduct(productId: string, productData: FormData): Promise<ApiResponse<{ product: Product }>> {
    return this.request(`/farmer/products/${productId}`, {
      method: 'PUT',
      headers: {}, // Let browser set Content-Type for FormData
      body: productData,
    });
  }
 

  async deleteProduct(productId: string): Promise<ApiResponse<null>> {
    return this.request(`/farmer/products/${productId}`, { method: 'DELETE' });
  }

  async toggleProductAvailability(productId: string): Promise<ApiResponse<{ product: Product }>> {
    return this.request(`/farmer/products/${productId}/toggle-availability`, { method: 'PATCH' });
  }

  // async getFarmerOrders(params?: {
  //   page?: number;
  //   limit?: number;
  //   status?: string;
  //   search?: string;
  // }): Promise<ApiResponse<{
  //   orders: Order[];
  //   total: number;
  //   page: number;
  //   pages: number;
  // }>> {
  //   const queryParams = new URLSearchParams();
  //   if (params) {
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) {
  //         queryParams.append(key, value.toString());
  //       }
  //     });
  //   }
  //   return this.request(`/farmer/orders?${queryParams.toString()}`);
  // }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<{ order: Order }>> {
    return this.request(`/farmer/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // async getFarmerEarnings(params?: {
  //   period?: 'week' | 'month' | 'year';
  //   startDate?: string;
  //   endDate?: string;
  // }): Promise<ApiResponse<{
  //   earnings: {
  //     total: number;
  //     period: string;
  //     breakdown: Array<{
  //       date: string;
  //       amount: number;
  //       orders: number;
  //     }>;
  //   };
  // }>> {
  //   const queryParams = new URLSearchParams();
  //   if (params) {
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) {
  //         queryParams.append(key, value.toString());
  //       }
  //     });
  //   }
  //   return this.request(`/farmer/earnings?${queryParams.toString()}`);
  // }
async getFarmerEarnings(): Promise<ApiResponse<{
  products: {
    total: number;
    active: number;
  };
  orders: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  };
  monthlyEarnings: Array<{
    _id: {
      year: number;
      month: number;
    };
    earnings: number;
  }>;
}>> {
  return this.request(`/farmer/stats`, {
    method: 'GET',
  });
}


  // Buyer APIs
  async getBuyerDashboard(): Promise<ApiResponse<{
    stats: BuyerStats;
    recentOrders: Order[];
    favoriteCategories: Array<{ category: string; count: number }>;
    recentProducts: Product[];
  }>> {
    return this.request('/buyer/dashboard');
  }

  async getMarketplaceProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    freshness?: string;
    rating?: number;
    sortBy?: 'price' | 'rating' | 'createdAt' | 'name';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    products: Product[];
    total: number;
    page: number;
    pages: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/buyer/marketplace?${queryParams.toString()}`);
  }

  async getProduct(productId: string): Promise<ApiResponse<{ product: Product }>> {
    return this.request(`/buyer/products/${productId}`);
  }

  async createOrder(orderData: {
    products: Array<{
      product: string;
      quantity: number;
    }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    paymentMethod: 'card' | 'upi' | 'wallet' | 'cod';
    notes?: string;
  }): Promise<ApiResponse<{ order: Order }>> {
    return this.request('/buyer/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getBuyerOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{
    orders: Order[];
    total: number;
    page: number;
    pages: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/buyer/orders?${queryParams.toString()}`);
  }

  async getOrder(orderId: string): Promise<ApiResponse<{ order: Order }>> {
    return this.request(`/buyer/orders/${orderId}`);
  }

  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<{ order: Order }>> {
    return this.request(`/buyer/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async rateProduct(productId: string, rating: number, comment?: string): Promise<ApiResponse<{ review: Review }>> {
    return this.request('/buyer/reviews', {
      method: 'POST',
      body: JSON.stringify({ product: productId, rating, comment }),
    });
  }

  async getBuyerReviews(params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<ApiResponse<{
    reviews: Review[];
    total: number;
    page: number;
    pages: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/buyer/reviews?${queryParams.toString()}`);
  }

  // Notification APIs
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<ApiResponse<{
    notifications: Notification[];
    total: number;
    page: number;
    pages: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/notifications?${queryParams.toString()}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ notification: Notification }>> {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<null>> {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  // Blockchain APIs
  async getBlockchainTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{
    transactions: Array<{
      _id: string;
      order: Order;
      txId: string;
      hash: string;
      status: 'pending' | 'confirmed' | 'failed';
      blockNumber?: number;
      gasUsed?: number;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page: number;
    pages: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/blockchain/transactions?${queryParams.toString()}`);
  }

  async verifyTransaction(txId: string): Promise<ApiResponse<{
    transaction: {
      _id: string;
      txId: string;
      hash: string;
      status: 'pending' | 'confirmed' | 'failed';
      blockNumber?: number;
      gasUsed?: number;
    };
  }>> {
    return this.request(`/blockchain/verify/${txId}`, { method: 'POST' });
  }

  // Utility methods
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.request('/upload/image', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.request('/products/categories');
  }
}

export const apiService = new ApiService();
export { ApiError };