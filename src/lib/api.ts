import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  Product,
  Order,
  User,
  ProductFilters,
} from "@/types";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "https://kheetiibazaar-backend-production.up.railway.app",
      timeout: 100000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(
    data: LoginRequest
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post("/api/v1/auth/login", data);
    return response.data;
  }

  async register(
    data: RegisterRequest
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post("/api/v1/auth/register", data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.get("/api/v1/auth/profile");
    return response.data;
  }

  async updateProfile(
    data: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.put("/api/v1/auth/profile", data);
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const response = await this.client.put(
      "/api/v1/auth/change-password",
      data
    );
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post("/api/v1/auth/forgot-password", {
      email,
    });
    return response.data;
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post(
      "/api/v1/auth/reset-password",
      data
    );
    return response.data;
  }

  // Product endpoints
  async getProducts(
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get("/api/v1/products", {
      params: filters,
    });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await this.client.get(`/api/v1/products/${id}`);
    return response.data;
  }

  async searchProducts(
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get("/api/v1/products/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  }

  // async getCategories(): Promise<ApiResponse<string[]>> {
  //   const response = await this.client.get('/api/v1/products/categories');
  //   return response.data;
  // }
async getCategories(): Promise<ApiResponse<{ categories: string[], categoryCounts: { category: string, count: number }[] }>> {
  const response = await this.client.get('/api/v1/categories');
  return response.data;
}

  async createProduct(data: FormData): Promise<ApiResponse<Product>> {
    const response = await this.client.post("/api/v1/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async updateProduct(
    id: string,
    data: FormData
  ): Promise<ApiResponse<Product>> {
    const response = await this.client.put(`/api/v1/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/v1/products/${id}`);
    return response.data;
  }

  async getFarmerProducts(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get(
      "/api/v1/products/farmer/my-products",
      {
        params: { page, limit, status },
      }
    );
    return response.data;
  }

  async toggleProductAvailability(id: string): Promise<ApiResponse<Product>> {
    const response = await this.client.patch(
      `/api/v1/products/${id}/toggle-availability`
    );
    return response.data;
  }

  // Order endpoints
  async createOrder(data: {
    products: Array<{ product: string; quantity: number }>;
    shippingAddress: any;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    const response = await this.client.post("/api/v1/orders", data);
    return response.data;
  }

  async getBuyerOrders(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get("/api/v1/orders/buyer/my-orders", {
      params: { page, limit, status },
    });
    return response.data;
  }

  // async getFarmerOrders(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Order>> {
  //   const response = await this.client.get('/api/v1/orders/farmer/my-orders', {
  //     params: { page, limit, status },
  //   });
  //   return response.data;
  // }
   async getFarmerOrders(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get('/api/v1/farmer/orders', {
      params: { page, limit, status },
    });
    return response.data;
  }
  

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.get(`/api/v1/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Order>> {
    const response = await this.client.patch(
      `/api/v1/orders/farmer/${id}/status`,
      { status }
    );
    return response.data;
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.patch(
      `/api/v1/orders/buyer/${id}/cancel`
    );
    return response.data;
  }

  async getOrderStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get("/api/v1/orders/farmer/stats");
    return response.data;
  }
async getNotifications({ page = 1, limit = 10 } = {}) {
  const query = `?page=${page}&limit=${limit}`;
  return this.client(`/api/v1/notifications${query}`, {
    method: 'GET',
  });
}
async getUnreadNotificationCount(): Promise<ApiResponse<{ unreadCount: number }>> {
  const response = await this.client.get('/api/v1/notifications/count');
  return response.data;
}

async markNotificationAsRead(notificationId: string) {
  return this.client(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}
async markAllNotificationsAsRead() {
  return this.client('/api/v1/notifications/read-all', {
    method: "PATCH",
  });
}

  // ApiClient.ts
async uploadImage(file: File, folder = 'products'): Promise<string> {
  const formData = new FormData();
  formData.append('image', file); 

  const response = await this.client.post('/api/v1/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url; 
}


  // File upload helper
  async uploadFile(file: File, folder = "products"): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.client.post("/api/v1/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url;
  }

  // Farmer-specific endpoints
  async getFarmerDashboard(): Promise<ApiResponse<{
    stats: any;
    recentOrders: Order[];
    topProducts: Product[];
  }>> {
    const response = await this.client.get("/api/v1/farmer/dashboard");
    return response.data;
  }

  async getFarmerStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get("/api/v1/farmer/stats");
    return response.data;
  }

  async getFarmerEarnings(): Promise<ApiResponse<{
    orders: {
      totalRevenue: number;
      pendingOrders: number;
    };
    monthlyEarnings: Array<{
      _id: { month: number; year: number };
      earnings: number;
    }>;
  }>> {
    const response = await this.client.get("/api/v1/farmer/earnings");
    return response.data;
  }

  // Product Reviews (using general product endpoints)
  async getProductReviews(
    productId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<any>> {
    const response = await this.client.get(
      `/api/v1/products/${productId}/reviews`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  async getFarmerReviews(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<any>> {
    // Get all products reviews for the farmer
    const response = await this.client.get("/api/v1/farmer/reviews", {
      params: { page, limit },
    });
    return response.data;
  }

  // Inventory Management APIs
  async getFarmerInventory(alertsOnly = false): Promise<ApiResponse<any[]>> {
    const params = alertsOnly ? "?alertsOnly=true" : "";
    const response = await this.client.get(
      `/api/v1/inventory/farmer${params}`
    );
    return response.data;
  }

  async createInventoryItem(data: {
    product: string;
    currentStock: number;
    reorderLevel?: number;
    expiryDate?: string;
    harvestDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post("/api/v1/inventory/create", data);
    return response.data;
  }

  async updateInventoryStock(
    itemId: string,
    quantity: number,
    reason: string
  ): Promise<ApiResponse<any>> {
    const response = await this.client.put(
      `/api/v1/inventory/${itemId}/update-stock`,
      { quantity, reason }
    );
    return response.data;
  }

  async getInventoryAlerts(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/api/v1/inventory/alerts");
    return response.data;
  }

  async getWasteReport(): Promise<ApiResponse<any>> {
    const response = await this.client.get("/api/v1/inventory/waste-report");
    return response.data;
  }

  async acknowledgeInventoryAlert(itemId: string): Promise<ApiResponse<any>> {
    const response = await this.client.put(
      `/api/v1/inventory/${itemId}/acknowledge-alert`
    );
    return response.data;
  }

  // Certifications APIs
  async getMyCertifications(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/api/v1/certifications/farmer/my');
    return response.data;
  }

  async uploadCertification(data: FormData): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/v1/certifications', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getProductCertifications(productId: string): Promise<ApiResponse<any[]>> {
    const response = await this.client.get(`/api/v1/certifications/product/${productId}`);
    return response.data;
  }

  async getQualityInspections(productId: string): Promise<ApiResponse<any[]>> {
    const response = await this.client.get(`/api/v1/certifications/inspections/${productId}`);
    return response.data;
  }

  // Delivery APIs
  async getMyDeliverySchedules(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/api/v1/delivery/schedules');
    return response.data;
  }

  async createDeliverySchedule(data: {
    order?: string;
    deliveryDate: string;
    timeSlot: string;
    address: any;
    specialInstructions?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/v1/delivery/schedule', data);
    return response.data;
  }

  async updateDeliverySchedule(scheduleId: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.client.put(`/api/v1/delivery/schedules/${scheduleId}`, data);
    return response.data;
  }

  async cancelDeliverySchedule(scheduleId: string, reason: string): Promise<ApiResponse<any>> {
    const response = await this.client.put(`/api/v1/delivery/schedules/${scheduleId}/cancel`, { reason });
    return response.data;
  }

  async completeDelivery(scheduleId: string): Promise<ApiResponse<any>> {
    const response = await this.client.put(`/api/v1/delivery/schedules/${scheduleId}/complete`);
    return response.data;
  }

  async getAvailableTimeSlots(date: string): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/api/v1/delivery/timeslots', {
      params: { date },
    });
    return response.data;
  }

  // Social/Profile APIs
  async getMyFarmerProfile(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/api/v1/social/farmer/me');
    return response.data;
  }

  async updateFarmerProfile(data: {
    bio?: string;
    farmName?: string;
    location?: any;
    specialties?: string[];
    certifications?: string[];
  }): Promise<ApiResponse<any>> {
    const response = await this.client.put('/api/v1/social/farmer/profile', data);
    return response.data;
  }

  async getMyFollowers(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/api/v1/social/followers/me');
    return response.data;
  }

  async getMyTestimonials(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/api/v1/social/testimonials/me');
    return response.data;
  }

  async getFarmerPublicProfile(farmerId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/api/v1/social/farmer/${farmerId}`);
    return response.data;
  }

  // ==================== Billing & Invoicing ====================

  // Farmer Billing
  async getFarmerBills(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<any>> {
    const response = await this.client.get('/api/v1/billing/farmer/my-bills', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async downloadFarmerBillPDF(billId: string): Promise<void> {
    const response = await this.client.get(`/api/v1/billing/farmer/${billId}/pdf`, {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${billId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async exportFarmerBillsCSV(): Promise<void> {
    const response = await this.client.get('/api/v1/billing/farmer/export/csv', {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `my-bills-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Buyer Billing
  async getBuyerBills(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<any>> {
    const response = await this.client.get('/api/v1/billing/buyer/my-bills', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async downloadBuyerBillPDF(billId: string): Promise<void> {
    const response = await this.client.get(`/api/v1/billing/buyer/${billId}/pdf`, {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${billId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async exportBuyerBillsCSV(): Promise<void> {
    const response = await this.client.get('/api/v1/billing/buyer/export/csv', {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `my-invoices-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}


export const apiClient = new ApiClient();
export default apiClient;
