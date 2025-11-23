import { ApiResponse, User, Product, Order, Review, Notification, FarmerStats, BuyerStats } from '@/types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://kheetiibazaar-backend-production.up.railway.app'}/api/v1`;

interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

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

  async getFarmerProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isAvailable?: boolean;
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
    return this.request(`/farmer/products?${queryParams.toString()}`);
  }

  async createProduct(productData: FormData): Promise<ApiResponse<{ product: Product }>> {
    return this.request('/farmer/products', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: productData,
    });
  }


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

  async getFarmerOrders(params?: {
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
    return this.request(`/farmer/orders?${queryParams.toString()}`);
  }

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
      body: JSON.stringify({ reason })
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

  async getUnreadNotificationCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return this.request('/notifications/count');
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

  // Address Management
  async getAddresses(): Promise<ApiResponse<any>> {
    return this.request('/buyer/addresses');
  }

  async createAddress(data: any): Promise<ApiResponse<any>> {
    return this.request('/buyer/addresses', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateAddress(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/buyer/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteAddress(id: string): Promise<ApiResponse<any>> {
    return this.request(`/buyer/addresses/${id}`, { method: 'DELETE' });
  }

  async setDefaultAddress(id: string): Promise<ApiResponse<any>> {
    return this.request(`/buyer/addresses/${id}/default`, { method: 'PATCH' });
  }

  // Payment Management
  async createPaymentOrder(data: {
    amount: number;
    currency?: string;
    orderId: string;
  }): Promise<ApiResponse<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>> {
    return this.request('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<ApiResponse<{
    paymentId: string;
    orderId: string;
    status: string;
  }>> {
    return this.request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPaymentDetails(paymentId: string): Promise<ApiResponse<any>> {
    return this.request(`/payment/${paymentId}`);
  }

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params as any);
    return this.request(`/payment/history?${queryParams.toString()}`);
  }

  async initiateRefund(paymentId: string, data: {
    amount?: number;
    reason?: string;
  }): Promise<ApiResponse<{
    refundId: string;
    amount: number;
    status: string;
  }>> {
    return this.request(`/payment/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Coupons
  async getAvailableCoupons(): Promise<ApiResponse<any>> {
    return this.request('/buyer/coupons/available');
  }

  // Wishlist
  async getWishlist(): Promise<ApiResponse<any>> {
    return this.request('/buyer/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    return this.request('/buyer/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }

  async getBuyerPayments(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/buyer/payments?${queryParams.toString()}`);
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<any>> {
    return this.request(`/buyer/wishlist/${productId}`, { method: 'DELETE' });
  }

  async clearWishlist(): Promise<ApiResponse<any>> {
    return this.request('/buyer/wishlist/clear', { method: 'DELETE' });
  }

  async shareWishlist(): Promise<ApiResponse<any>> {
    return this.request('/buyer/wishlist/share', { method: 'POST' });
  }

  async getSharedWishlist(token: string): Promise<ApiResponse<any>> {
    return this.request(`/buyer/wishlist/shared/${token}`);
  }

  // Loyalty Points
  async getLoyaltyAccount(): Promise<ApiResponse<any>> {
    return this.request('/buyer/loyalty');
  }

  async getPointsHistory(params?: any): Promise<ApiResponse<any>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/buyer/loyalty/history${queryParams}`);
  }

  async redeemPoints(data: any): Promise<ApiResponse<any>> {
    return this.request('/buyer/loyalty/redeem', { method: 'POST', body: JSON.stringify(data) });
  }

  // Returns
  async getMyReturns(): Promise<ApiResponse<any>> {
    return this.request('/buyer/returns');
  }

  // ========== PHASE 1: ADMIN API METHODS ==========
  
  async getAdminDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/dashboard/stats');
  }

  async getAdminRecentActivity(): Promise<ApiResponse<any>> {
    return this.request('/admin/dashboard/recent-activity');
  }

  async getAdminUsers(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/users?${queryParams.toString()}`);
  }

  async getAdminUserDetails(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUserStatus(userId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteAdminUser(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async getAdminOrders(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/orders?${queryParams.toString()}`);
  }

  async bulkUpdateOrderStatus(orderIds: string[], status: string): Promise<ApiResponse<any>> {
    return this.request('/admin/orders/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ orderIds, status })
    });
  }

  async getAdminProducts(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/products?${queryParams.toString()}`);
  }

  async updateProductStatus(productId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/products/${productId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ========== PHASE 2: ANALYTICS API METHODS ==========
  
  async getRevenueAnalytics(params?: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/analytics/revenue?${queryParams.toString()}`);
  }

  async getUserGrowthAnalytics(params?: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/analytics/users?${queryParams.toString()}`);
  }

  async getProductAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/admin/analytics/products');
  }

  async getOrderTrends(params?: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/analytics/orders?${queryParams.toString()}`);
  }

  async getPlatformOverview(): Promise<ApiResponse<any>> {
    return this.request('/admin/analytics/overview');
  }

  // ========== PHASE 3: SYSTEM MANAGEMENT API METHODS ==========
  
  // Settings Management
  async getPlatformSettings(): Promise<ApiResponse<any>> {
    return this.request('/admin/settings');
  }

  async updatePlatformSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async getPaymentSettings(): Promise<ApiResponse<any>> {
    return this.request('/admin/settings/payment');
  }

  async updatePaymentSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/admin/settings/payment', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async getEmailSettings(): Promise<ApiResponse<any>> {
    return this.request('/admin/settings/email');
  }

  async updateEmailSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/admin/settings/email', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Moderation
  async getModerationQueue(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/moderation/queue?${queryParams.toString()}`);
  }

  async approveModerationItem(itemId: string, itemType: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/moderation/${itemType}/${itemId}/approve`, {
      method: 'POST'
    });
  }

  async rejectModerationItem(itemId: string, itemType: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/moderation/${itemType}/${itemId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async getReportedContent(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/moderation/reports?${queryParams.toString()}`);
  }

  async reviewReport(reportId: string, action: 'dismiss' | 'warn' | 'ban'): Promise<ApiResponse<any>> {
    return this.request(`/admin/moderation/reports/${reportId}`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }

  // ========== PHASE 4: FINANCIAL MANAGEMENT API METHODS ==========

  // Billing & Finance
  async getFinancialStats(params?: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/finance/stats?${queryParams.toString()}`);
  }

  async getPayouts(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/finance/payouts?${queryParams.toString()}`);
  }

  async processPayout(payoutId: string, action: 'approve' | 'reject', notes?: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/finance/payouts/${payoutId}/process`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    });
  }

  // Coupons & Promotions
  async getCoupons(params?: any): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/admin/coupons?${queryParams.toString()}`);
  }

  async createCoupon(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCoupon(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCoupon(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  }

}

export const apiService = new ApiService();
export { ApiError };