import axios from 'axios';
import Cookies from 'js-cookie';
import NProgress from 'nprogress';
import { toast } from 'sonner';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.3,
  speed: 500,
  easing: 'ease',
  trickleSpeed: 200,
});

// Function to inject NProgress styles (to be called from client components)
export const injectNProgressStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      #nprogress .bar {
        height: 4px !important;
      }
    `;
    document.head.appendChild(style);
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://fbbackend.rakibulhoque.com/api/v1',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'fabrimentory_access_token';
const REFRESH_TOKEN_KEY = 'fabrimentory_refresh_token';

export const setToken = (token) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }); // Token expires in 7 days
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const setRefreshToken = (refreshToken) => {
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 }); // Refresh token expires in 30 days
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => {
  Cookies.remove(REFRESH_TOKEN_KEY);
};

// Token refresh functionality
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const refreshToken = async () => {
  const refreshTokenValue = getRefreshToken();
  
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://fbauth.rakibulhoque.com/api/v1'}/auth/refresh`,
      {
        refresh_token: refreshTokenValue
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    
    if (access_token) {
      setToken(access_token);
    }
    
    if (refresh_token) {
      setRefreshToken(refresh_token);
    }

    return access_token;
  } catch (error) {
    // If refresh fails, clear all tokens and redirect to login
    removeToken();
    removeRefreshToken();
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    window.location.href = '/login';
    throw error;
  }
};

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    NProgress.start();
    window.dispatchEvent(new CustomEvent('api-loading-start'));
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    NProgress.done();
    window.dispatchEvent(new CustomEvent('api-loading-end'));
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    NProgress.done();
    return response;
  },
  async (error) => {
    NProgress.done();
    if(error.response?.data?.status === "duplicate_found"){
      return Promise.reject(error.response.data);
    }
    if (error.response) {
      switch (error.response.status) {
        case 401:
          const originalRequest = error.config;
          
          // If this is already a retry request or refresh request, don't retry
          if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
            toast.error('Session expired', {
              description: 'Please log in again'
            });
            Object.keys(Cookies.get()).forEach(cookieName => {
              Cookies.remove(cookieName);
            });
            removeToken();
            removeRefreshToken();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // If we're already refreshing, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newToken = await refreshToken();
            processQueue(null, newToken);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
          break;
        case 403:
          toast.error('Access forbidden', {
            description: 'You do not have permission to perform this action'
          });
          break;
        case 404:
          toast.error('Resource not found', {
            description: 'The requested resource could not be found'
          });
          break;
        case 500:
          toast.error('Internal server error', {
            description: 'An unexpected error occurred on the server'
          });
          break;
        case 422:
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          if (validationErrors) {
            // Get the first error message from each field
            const errorMessages = Object.entries(validationErrors)
              .map(([field, messages]) => `${field}: ${messages[0]}`)
              .join('\n');
            toast.error('Validation Error', {
              description: errorMessages.length > 150 ? errorMessages.substring(0, 150) + '...' : errorMessages
            });
          } else {
            const message = error.response.data.message || 'Please check your input';
            toast.error('Validation Error', {
              description: message.length > 150 ? message.substring(0, 150) + '...' : message
            });
          }
          break;
        default:
          const defaultMessage = error.response.data.message || 'An unexpected error occurred';
          toast.error('Error', {
            description: defaultMessage.length > 150 ? defaultMessage.substring(0, 150) + '...' : defaultMessage
          });
      }
    } else {
      toast.error('Network Error', {
        description: 'Please check your internet connection'
      });
    }
    return Promise.reject(error);
  }
);

// Utility function to clean query parameters
const cleanQueryParams = (config) => {
  if (config?.params) {
    const cleanedParams = {};
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedParams[key] = value;
      }
    });
    return { ...config, params: cleanedParams };
  }
  return config;
};

// API methods
export const apiService = {
  // Auth methods
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { access_token, refresh_token } = response.data;
    setToken(access_token);
    if (refresh_token) {
      setRefreshToken(refresh_token);
    }
    return response.data;
  },

  silentLogin: async (token) => {
    setToken(token);
    return api.get('/auth/profile');
  },

  logout: () => {
    removeToken();
    removeRefreshToken();
    return api.post('/auth/logout');
  },

  refreshToken: async () => {
    const refreshTokenValue = getRefreshToken();
    
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://fbauth.rakibulhoque.com/api/v1'}/auth/refresh`,
      { 
        refresh_token: refreshTokenValue
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    
    if (access_token) {
      setToken(access_token);
    }
    
    if (refresh_token) {
      setRefreshToken(refresh_token);
    }

    return response.data;
  },

  // Forgot password methods
  forgotPassword: async (email) => {
    const formData = new FormData();
    formData.append('email', email);
    return api.post('/auth/forgot-password', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  resetPassword: async (token, password, password_confirmation) => {
    const formData = new FormData();
    formData.append('password', password);
    formData.append('password_confirmation', password_confirmation);
    return api.post(`/auth/reset-password/${token}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  changePassword: async (oldPassword, newPassword, passwordConfirmation) => {
    const formData = new FormData();
    formData.append('old_password', oldPassword);
    formData.append('password', newPassword);
    formData.append('password_confirmation', passwordConfirmation);
    return api.post('/auth/change-password', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Generic API methods
  get: (url, config = {}) => api.get(url, cleanQueryParams(config)),
  post: (url, data, config = {}) => api.post(url, data, cleanQueryParams(config)),
  put: (url, data, config = {}) => api.put(url, data, cleanQueryParams(config)),
  delete: (url, config = {}) => api.delete(url, cleanQueryParams(config)),
  patch: (url, data, config = {}) => api.patch(url, data, cleanQueryParams(config)),
  
  // PDF download method
  downloadPdf: async (url, filename) => {
    try {
      const newWindow = window.open(url, '_blank');

      
      if (newWindow) {
        toast.success('Download started', {
          description: 'The PDF download should begin shortly. If prompted, please log in again.'
        });
      } else {
        toast.info('Popup blocked', {
          description: 'Please allow popups and try again, or copy the URL to download manually.'
        });
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Download failed', {
        description: 'Failed to download the PDF file. Please try again.'
      });
    }
  },
  
  // User management
  getUsers: async (params = {}) => {
    return api.get('/users', { params });
  },

  getUser: async (id) => {
    return api.get(`/users/${id}`);
  },

  createUser: async (userData) => {
    return api.post('/users', userData);
  },

  updateUser: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser: async (id) => {
    return api.delete(`/users/${id}`);
  },

  // Role management
  getRoles: async (params = {}) => {
    return api.get('/roles', { params });
  },

  getRole: async (id) => {
    return api.get(`/roles/${id}`);
  },

  createRole: async (roleData) => {
    return api.post('/roles', roleData);
  },

  updateRole: async (id, roleData) => {
    return api.put(`/roles/${id}`, roleData);
  },

  deleteRole: async (id) => {
    return api.delete(`/roles/${id}`);
  },

  // Permission management
  getPermissions: async (params = {}) => {
    return api.get('/permissions', { params });
  },

  getPermission: async (id) => {
    return api.get(`/permissions/${id}`);
  },

  createPermission: async (permissionData) => {
    return api.post('/permissions', permissionData);
  },

  updatePermission: async (id, permissionData) => {
    return api.put(`/permissions/${id}`, permissionData);
  },

  deletePermission: async (id) => {
    return api.delete(`/permissions/${id}`);
  },

  // Inventory management
  getItems: async (params = {}) => {
    return api.get('/item', { params });
  },

  getItem: async (id) => {
    return api.get(`/item/${id}`);
  },

  createItem: async (itemData) => {
    return api.post('/item', itemData);
  },

  updateItem: async (id, itemData) => {
    return api.put(`/item/${id}`, itemData);
  },

  deleteItem: async (id) => {
    return api.delete(`/item/${id}`);
  },

  // Supplier management
  getSuppliers: async (params = {}) => {
    return api.get('/suppliers', { params });
  },

  getSupplier: async (id) => {
    return api.get(`/suppliers/${id}`);
  },

  createSupplier: async (supplierData) => {
    return api.post('/suppliers', supplierData);
  },

  updateSupplier: async (id, supplierData) => {
    return api.put(`/suppliers/${id}`, supplierData);
  },

  deleteSupplier: async (id) => {
    return api.delete(`/suppliers/${id}`);
  },

  // Buyer management
  getBuyers: async (params = {}) => {
    return api.get('/buyers', { params });
  },

  getBuyer: async (id) => {
    return api.get(`/buyers/${id}`);
  },

  createBuyer: async (buyerData) => {
    return api.post('/buyers', buyerData);
  },

  updateBuyer: async (id, buyerData) => {
    return api.put(`/buyers/${id}`, buyerData);
  },

  deleteBuyer: async (id) => {
    return api.delete(`/buyers/${id}`);
  },

  // Sales contract management
  getSalesContracts: async (params = {}) => {
    return api.get('/sales-contracts', { params });
  },

  getSalesContract: async (id) => {
    return api.get(`/sales-contracts/${id}`);
  },

  createSalesContract: async (contractData) => {
    return api.post('/sales-contracts', contractData);
  },

  updateSalesContract: async (id, contractData) => {
    return api.put(`/sales-contracts/${id}`, contractData);
  },

  deleteSalesContract: async (id) => {
    return api.delete(`/sales-contracts/${id}`);
  },

  // Purchase invoice management
  getPurchaseInvoices: async (params = {}) => {
    return api.get('/purchase-invoices', { params });
  },

  getPurchaseInvoice: async (id) => {
    return api.get(`/purchase-invoices/${id}`);
  },

  createPurchaseInvoice: async (invoiceData) => {
    return api.post('/purchase-invoices', invoiceData);
  },

  updatePurchaseInvoice: async (id, invoiceData) => {
    return api.put(`/purchase-invoices/${id}`, invoiceData);
  },

  deletePurchaseInvoice: async (id) => {
    return api.delete(`/purchase-invoices/${id}`);
  },

  // Inventory transaction management
  getInventoryTransactions: async (params = {}) => {
    return api.get('/inventory-transactions', { params });
  },

  getInventoryTransaction: async (id) => {
    return api.get(`/inventory-transactions/${id}`);
  },

  createInventoryTransaction: async (transactionData) => {
    return api.post('/inventory-transactions', transactionData);
  },

  updateInventoryTransaction: async (id, transactionData) => {
    return api.put(`/inventory-transactions/${id}`, transactionData);
  },

  deleteInventoryTransaction: async (id) => {
    return api.delete(`/inventory-transactions/${id}`);
  },

  // Category management
  getCategories: async (params = {}) => {
    return api.get('/category', { params });
  },

  getCategory: async (id) => {
    return api.get(`/category/${id}`);
  },

  createCategory: async (categoryData) => {
    return api.post('/category', categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return api.put(`/category/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return api.delete(`/category/${id}`);
  },

  // Color management
  getColors: async (params = {}) => {
    return api.get('/color', { params });
  },

  getColor: async (id) => {
    return api.get(`/color/${id}`);
  },

  createColor: async (colorData) => {
    return api.post('/color', colorData);
  },

  updateColor: async (id, colorData) => {
    return api.put(`/color/${id}`, colorData);
  },

  deleteColor: async (id) => {
    return api.delete(`/color/${id}`);
  },

  // Job management
  getJobs: async (params = {}) => {
    return api.get('/job', { params });
  },

  getJob: async (id) => {
    return api.get(`/job/${id}`);
  },

  createJob: async (jobData) => {
    return api.post('/job', jobData);
  },

  updateJob: async (id, jobData) => {
    return api.put(`/job/${id}`, jobData);
  },

  deleteJob: async (id) => {
    return api.delete(`/job/${id}`);
  },

  // Storage management
  getStorages: async (params = {}) => {
    return api.get('/storage', { params });
  },

  getStorage: async (id) => {
    return api.get(`/storage/${id}`);
  },

  createStorage: async (storageData) => {
    return api.post('/storage', storageData);
  },

  updateStorage: async (id, storageData) => {
    return api.put(`/storage/${id}`, storageData);
  },

  deleteStorage: async (id) => {
    return api.delete(`/storage/${id}`);
  },

  getStorageHierarchy: async (id) => {
    return api.get(`/storage/${id}/hierarchy`);
  },

  // Storage stock grouped by item or storage (group_by: 'item' | 'storage')
  getStorageStockGrouped: async (params = {}) => {
    return api.get('/storage-stock/grouped', { params });
  },

  // Customer management
  getCustomers: async (params = {}) => {
    return api.get('/customer', { params });
  },

  getCustomer: async (id) => {
    return api.get(`/customer/${id}`);
  },

  createCustomer: async (customerData) => {
    return api.post('/customer', customerData);
  },

  updateCustomer: async (id, customerData) => {
    return api.put(`/customer/${id}`, customerData);
  },

  deleteCustomer: async (id) => {
    return api.delete(`/customer/${id}`);
  },

  // Vendor management
  getVendors: async (params = {}) => {
    return api.get('/vendor', { params });
  },

  getVendor: async (id) => {
    return api.get(`/vendor/${id}`);
  },

  createVendor: async (vendorData) => {
    return api.post('/vendor', vendorData);
  },

  updateVendor: async (id, vendorData) => {
    return api.put(`/vendor/${id}`, vendorData);
  },

  deleteVendor: async (id) => {
    return api.delete(`/vendor/${id}`);
  },

  // Unit management
  getUnits: async (params = {}) => {
    return api.get('/unit', { params });
  },

  getUnit: async (id) => {
    return api.get(`/unit/${id}`);
  },

  createUnit: async (unitData) => {
    return api.post('/unit', unitData);
  },

  updateUnit: async (id, unitData) => {
    return api.put(`/unit/${id}`, unitData);
  },

  deleteUnit: async (id) => {
    return api.delete(`/unit/${id}`);
  },

  // Unit conversion management
  getUnitConversions: async (params = {}) => {
    return api.get('/unit-conversion', { params });
  },

  getUnitConversion: async (fromId, toId) => {
    return api.get(`/unit-conversion/${fromId}/${toId}`);
  },

  createUnitConversion: async (conversionData) => {
    return api.post('/unit-conversion', conversionData);
  },

  updateUnitConversion: async (fromId, toId, conversionData) => {
    return api.put(`/unit-conversion/${fromId}/${toId}`, conversionData);
  },

  deleteUnitConversion: async (fromId, toId) => {
    return api.delete(`/unit-conversion/${fromId}/${toId}`);
  },

  // Stock Ledger management
  getStockLedgers: async (params = {}) => {
    return api.get('/stock-ledger', { params });
  },

  getStockLedger: async (id) => {
    return api.get(`/stock-ledger/${id}`);
  },

  createStockLedger: async (stockLedgerData) => {
    return api.post('/stock-ledger', stockLedgerData);
  },

  createStockLedgerWithFile: async (formData) => {
    return api.post('/stock-ledger', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateStockLedger: async (id, stockLedgerData) => {
    return api.put(`/stock-ledger/${id}`, stockLedgerData);
  },

  updateStockLedgerWithFile: async (id, formData) => {
    return api.put(`/stock-ledger/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteStockLedger: async (id) => {
    return api.delete(`/stock-ledger/${id}`);
  },

  getStockLedgerTimeline: async (id) => {
    return api.get(`/stock-ledger/${id}/timeline`);
  },

  // Stock Ledger Items management
  getStockLedgerItems: async (params = {}) => {
    return api.get('/stock-ledger-items', { params });
  },

  getStockLedgerItem: async (id) => {
    return api.get(`/stock-ledger-items/${id}`);
  },

  createStockLedgerItem: async (stockLedgerItemData) => {
    return api.post('/stock-ledger-items', stockLedgerItemData);
  },

  updateStockLedgerItem: async (id, stockLedgerItemData) => {
    return api.put(`/stock-ledger-items/${id}`, stockLedgerItemData);
  },

  deleteStockLedgerItem: async (id) => {
    return api.delete(`/stock-ledger-items/${id}`);
  },

  // Stock Transfer management
  getStockTransfers: async (params = {}) => {
    return api.get('/stock-transfer', { params });
  },

  getStockTransfer: async (id) => {
    return api.get(`/stock-transfer/${id}`);
  },

  createStockTransfer: async (stockTransferData) => {
    return api.post('/stock-transfer', stockTransferData);
  },

  updateStockTransfer: async (id, stockTransferData) => {
    return api.put(`/stock-transfer/${id}`, stockTransferData);
  },

  deleteStockTransfer: async (id) => {
    return api.delete(`/stock-transfer/${id}`);
  },

  // Dashboard API
  getDashboardOverview: async () => {
    return api.get('/dashboard/overview');
  },

  getDashboardStats: async () => {
    return api.get('/dashboard/stats');
  },

  getDashboardStockLedger: async () => {
    return api.get('/dashboard/stock-ledger');
  },

  getDashboardItems: async () => {
    return api.get('/dashboard/items');
  },

  getDashboardStorage: async () => {
    return api.get('/dashboard/storage');
  },

  getDashboardVendors: async () => {
    return api.get('/dashboard/vendors');
  },

  getDashboardJobs: async () => {
    return api.get('/dashboard/jobs');
  },

  getDashboardTimeSeries: async (params = {}) => {
    return api.get('/dashboard/time-series', { params });
  },
};

export default apiService;
