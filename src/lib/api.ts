import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, LoginRequest, RegisterRequest, Product, Order, User, ProductFilters } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post('/api/v1/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post('/api/v1/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.get('/api/v1/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.put('/api/v1/auth/profile', data);
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    const response = await this.client.put('/api/v1/auth/change-password', data);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(data: { token: string; password: string }): Promise<ApiResponse> {
    const response = await this.client.post('/api/v1/auth/reset-password', data);
    return response.data;
  }

  // Product endpoints
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get('/api/v1/products', { params: filters });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await this.client.get(`/api/v1/products/${id}`);
    return response.data;
  }

  async searchProducts(query: string, page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get('/api/v1/products/search', {
      params: { q: query, page, limit },
    });
    return response.data;
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await this.client.get('/api/v1/products/categories');
    return response.data;
  }

  async createProduct(data: FormData): Promise<ApiResponse<Product>> {
    const response = await this.client.post('/api/v1/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProduct(id: string, data: FormData): Promise<ApiResponse<Product>> {
    const response = await this.client.put(`/api/v1/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/v1/products/${id}`);
    return response.data;
  }

  async getFarmerProducts(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get('/api/v1/products/farmer/my-products', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async toggleProductAvailability(id: string): Promise<ApiResponse<Product>> {
    const response = await this.client.patch(`/api/v1/products/${id}/toggle-availability`);
    return response.data;
  }

  // Order endpoints
  async createOrder(data: {
    products: Array<{ product: string; quantity: number }>;
    shippingAddress: any;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    const response = await this.client.post('/api/v1/orders', data);
    return response.data;
  }

  async getBuyerOrders(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get('/api/v1/orders/buyer/my-orders', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async getFarmerOrders(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get('/api/v1/orders/farmer/my-orders', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.get(`/api/v1/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    const response = await this.client.patch(`/api/v1/orders/farmer/${id}/status`, { status });
    return response.data;
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.patch(`/api/v1/orders/buyer/${id}/cancel`);
    return response.data;
  }

  async getOrderStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/api/v1/orders/farmer/stats');
    return response.data;
  }

  // File upload helper
  async uploadFile(file: File, folder = 'products'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
