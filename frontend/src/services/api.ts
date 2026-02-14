import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = data.data;
          useAuthStore.getState().setTokens(accessToken, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Generic CRUD helpers
export function createCrudApi<T>(resource: string) {
  return {
    list: (params?: Record<string, unknown>) => api.get<{ data: T[] }>(`/${resource}`, { params }),
    get: (id: string) => api.get<{ data: T }>(`/${resource}/${id}`),
    create: (data: Partial<T>) => api.post<{ data: T }>(`/${resource}`, data),
    update: (id: string, data: Partial<T>) => api.patch<{ data: T }>(`/${resource}/${id}`, data),
    remove: (id: string) => api.delete(`/${resource}/${id}`),
  };
}

// ── Resource APIs ─────────────────────────────────────────
export const projectsApi = createCrudApi('projects');
export const unitsApi = createCrudApi('units');
export const leadsApi = createCrudApi('leads');
export const customersApi = createCrudApi('customers');
export const bookingsApi = createCrudApi('bookings');
export const contractsApi = createCrudApi('contracts');
export const receiptsApi = createCrudApi('receipts');
export const brokersApi = createCrudApi('brokers');

// Nested-path resources (backend uses sub-paths)
export const coaApi = {
  list: (params?: Record<string, unknown>) => api.get<{ data: any[] }>('/accounting/coa', { params }),
  get: (id: string) => api.get<{ data: any }>(`/accounting/coa/${id}`),
  create: (data: any) => api.post<{ data: any }>('/accounting/coa', data),
};

export const journalEntriesApi = {
  list: (params?: Record<string, unknown>) => api.get<{ data: any[] }>('/accounting/journals', { params }),
  get: (id: string) => api.get<{ data: any }>(`/accounting/journals/${id}`),
};

export const employeesApi = {
  list: (params?: Record<string, unknown>) => api.get<{ data: any[] }>('/hr/employees', { params }),
  get: (id: string) => api.get<{ data: any }>(`/hr/employees/${id}`),
  create: (data: any) => api.post<{ data: any }>('/hr/employees', data),
  update: (id: string, data: any) => api.patch<{ data: any }>(`/hr/employees/${id}`, data),
};

export const payrollApi = {
  list: (params?: Record<string, unknown>) => api.get<{ data: any[] }>('/payroll/payslips', { params }),
  get: (id: string) => api.get<{ data: any }>(`/payroll/payslips/${id}`),
  create: (data: any) => api.post<{ data: any }>('/payroll/payslips', data),
  update: (id: string, data: any) => api.patch<{ data: any }>(`/payroll/payslips/${id}`, data),
};

export const maintenanceApi = {
  list: (params?: Record<string, unknown>) => api.get<{ data: any[] }>('/maintenance/tickets', { params }),
  get: (id: string) => api.get<{ data: any }>(`/maintenance/tickets/${id}`),
  create: (data: any) => api.post<{ data: any }>('/maintenance/tickets', data),
  update: (id: string, data: any) => api.patch<{ data: any }>(`/maintenance/tickets/${id}`, data),
};

export const inventoryApi = {
  list: (params?: Record<string, unknown>) => api.get<{ data: any[] }>('/inventory/items', { params }),
  get: (id: string) => api.get<{ data: any }>(`/inventory/items/${id}`),
  create: (data: any) => api.post<{ data: any }>('/inventory/items', data),
  update: (id: string, data: any) => api.patch<{ data: any }>(`/inventory/items/${id}`, data),
};

// ── Reports / Dashboard ───────────────────────────────────
export const reportsApi = {
  sales: (params?: Record<string, unknown>) => api.get<{ data: any }>('/reports/sales', { params }),
  collections: (params?: Record<string, unknown>) => api.get<{ data: any }>('/reports/collections', { params }),
  aging: () => api.get<{ data: any }>('/reports/aging'),
};

// ── Notifications ─────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get<{ data: any[] }>('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  dismiss: (id: string) => api.delete(`/notifications/${id}`),
};

// ── Platform Admin (Super Admin) ──────────────────────────
export const platformApi = {
  stats: () => api.get<{ data: any }>('/platform/stats'),
  listTenants: () => api.get<{ data: any[] }>('/platform/tenants'),
  getTenant: (id: string) => api.get<{ data: any }>(`/platform/tenants/${id}`),
  createTenant: (data: any) => api.post<{ data: any }>('/platform/tenants', data),
  updateTenant: (id: string, data: any) => api.patch<{ data: any }>(`/platform/tenants/${id}`, data),
  activateTenant: (id: string) => api.patch(`/platform/tenants/${id}/activate`),
  deactivateTenant: (id: string) => api.patch(`/platform/tenants/${id}/deactivate`),
  getTenantUsers: (id: string) => api.get<{ data: any[] }>(`/platform/tenants/${id}/users`),
  activateUser: (id: string) => api.patch(`/platform/users/${id}/activate`),
  deactivateUser: (id: string) => api.patch(`/platform/users/${id}/deactivate`),
};
