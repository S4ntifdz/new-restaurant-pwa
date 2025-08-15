const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://d0638a438f78.ngrok-free.app';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}/api/v1${endpoint}`;
    
    console.log('Making API request to:', url);
    console.log('With token:', this.token ? 'Present' : 'Missing');
    console.log('Request options:', options);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('Authorization header set');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log('Unauthorized response received');
          throw new Error('UNAUTHORIZED');
        }
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      // Get the raw response text first
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type header:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const jsonResponse = JSON.parse(responseText);
          console.log('Parsed JSON response:', jsonResponse);
          return jsonResponse;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text that failed to parse:', responseText);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        console.log('Response is not JSON. Content-Type:', contentType);
        console.log('Response text:', responseText);
        
        // Try to parse as JSON anyway, in case the content-type header is wrong
        try {
          const jsonResponse = JSON.parse(responseText);
        console.log('API JSON Response data:', jsonResponse);
        return jsonResponse;
        } catch (parseError) {
          console.error('Response is not JSON and cannot be parsed:', parseError);
          throw new Error(`Server returned non-JSON response: ${responseText}`);
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async validateJWT(): Promise<boolean> {
    try {
      console.log('Validating JWT...');
      
      const response = await this.request<{valid: boolean, table_uuid: string}>('/validate-jwt/');
      console.log('JWT validation response:', response);
      
      // Check if response has valid property and it's true
      if (response && typeof response === 'object' && response.valid === true) {
        console.log('JWT validation successful - valid field is true');
        return true;
      }
      
      console.log('JWT validation failed - valid field is not true');
      return false;
    } catch (error) {
      console.error('JWT validation failed:', error);
      return false;
    }
  }

  async getTableUuidFromJWT(): Promise<string | null> {
    try {
      const response = await this.request<{valid: boolean, table_uuid: string}>('/validate-jwt/');
      return response.table_uuid;
    } catch (error) {
      console.error('Failed to get table UUID:', error);
      return null;
    }
  }

  // Tables
  async callWaiter(tableId: string): Promise<{ number: number; calling: boolean }> {
    return this.request(`/tables/call/${tableId}/`, {
      method: 'POST',
    });
  }

  async cancelWaiterCall(tableId: string): Promise<void> {
    return this.request(`/api/v1/call-cancel/`, {
      method: 'POST',
    });
  }

  async getUnpaidOrders(tableId: string) {
    return this.request(`/tables/${tableId}/unpaid-orders/`);
  }

  // Menu Categories
  async getMenuCategories() {
    return this.request('/menu-categories/');
  }

  // Products
  async getProducts() {
    return this.request('/products/');
  }

  // Menus
  async getMenus() {
    return this.request('/menus/');
  }

  // Orders
  async getOrders() {
    return this.request('/orders/');
  }

  async createOrder(order: any) {
    return this.request('/orders/', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // Payments
  async createPayment(payment: { method: string; amount: string }) {
    return this.request('/payments/', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  // Offers
  async getOffers() {
    return this.request('/offers/');
  }
}

export const apiClient = new ApiClient();