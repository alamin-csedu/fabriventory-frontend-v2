export const BASE_URL_IMAGE = 'https://ancovaedu.ancova.com.bd/uploads/admin'

import { useAuth } from '../../hooks/use-auth'

export const useEndpoints = () => {
  const { getEndpoint, getDownloadEndpoint } = useAuth()

  // Auth endpoints
  const AUTH_ENDPOINTS = {
    login: getEndpoint('auth/login'),
    register: getEndpoint('auth/register'),
    logout: getEndpoint('auth/logout'),
    profile: getEndpoint('auth/profile'),
    refresh: getEndpoint('auth/refresh'),
    changePassword: getEndpoint('auth/change-password'),
    forgotPassword: getEndpoint('auth/forgot-password'),
    resetPassword: (token) => getEndpoint(`auth/reset-password/${token}`),
    validateToken: getEndpoint('auth/validate-token'),
    checkPermission: getEndpoint('auth/check-permission')
  }

  // User management endpoints
  const USER_ENDPOINTS = {
    list: getEndpoint('users'),
    add: getEndpoint('users'),
    update: (id) => getEndpoint(`users/${id}`),
    delete: (id) => getEndpoint(`users/${id}`),
    activate: (id) => getEndpoint(`users/${id}/activate`),
    deactivate: (id) => getEndpoint(`users/${id}/deactivate`),
    assignRole: (id) => getEndpoint(`users/${id}/assign-role`),
    removeRole: (id) => getEndpoint(`users/${id}/remove-role`),
    permissions: (id) => getEndpoint(`users/${id}/permissions/effective`),
    checkPermission: (id) => getEndpoint(`users/${id}/check-permission`)
  }

  // Role management endpoints
  const ROLE_ENDPOINTS = {
    list: getEndpoint('roles'),
    add: getEndpoint('roles'),
    update: (id) => getEndpoint(`roles/${id}`),
    delete: (id) => getEndpoint(`roles/${id}`),
    assignPermission: (id) => getEndpoint(`roles/${id}/assign-permission`),
    removePermission: (id) => getEndpoint(`roles/${id}/remove-permission`),
    permissions: (id) => getEndpoint(`roles/${id}/permissions`)
  }

  // Permission management endpoints
  const PERMISSION_ENDPOINTS = {
    list: getEndpoint('permissions'),
    add: getEndpoint('permissions'),
    update: (id) => getEndpoint(`permissions/${id}`),
    delete: (id) => getEndpoint(`permissions/${id}`)
  }

  // Item management endpoints
  const ITEM_ENDPOINTS = {
    list: getEndpoint('items'),
    add: getEndpoint('items'),
    update: (id) => getEndpoint(`items/${id}`),
    delete: (id) => getEndpoint(`items/${id}`),
    export: getEndpoint('items/export'),
    import: getEndpoint('items/import')
  }

  // Category management endpoints
  const CATEGORY_ENDPOINTS = {
    list: getEndpoint('categories'),
    add: getEndpoint('categories'),
    update: (id) => getEndpoint(`categories/${id}`),
    delete: (id) => getEndpoint(`categories/${id}`)
  }

  // Supplier management endpoints
  const SUPPLIER_ENDPOINTS = {
    list: getEndpoint('suppliers'),
    add: getEndpoint('suppliers'),
    update: (id) => getEndpoint(`suppliers/${id}`),
    delete: (id) => getEndpoint(`suppliers/${id}`)
  }

  // Buyer management endpoints
  const BUYER_ENDPOINTS = {
    list: getEndpoint('buyers'),
    add: getEndpoint('buyers'),
    update: (id) => getEndpoint(`buyers/${id}`),
    delete: (id) => getEndpoint(`buyers/${id}`)
  }

  // Sales contract management endpoints
  const SALES_CONTRACT_ENDPOINTS = {
    list: getEndpoint('sales-contracts'),
    add: getEndpoint('sales-contracts'),
    update: (id) => getEndpoint(`sales-contracts/${id}`),
    delete: (id) => getEndpoint(`sales-contracts/${id}`)
  }

  // Purchase invoice management endpoints
  const PURCHASE_INVOICE_ENDPOINTS = {
    list: getEndpoint('purchase-invoices'),
    add: getEndpoint('purchase-invoices'),
    update: (id) => getEndpoint(`purchase-invoices/${id}`),
    delete: (id) => getEndpoint(`purchase-invoices/${id}`)
  }

  // Inventory transaction management endpoints
  const INVENTORY_TRANSACTION_ENDPOINTS = {
    list: getEndpoint('inventory-transactions'),
    add: getEndpoint('inventory-transactions'),
    update: (id) => getEndpoint(`inventory-transactions/${id}`),
    delete: (id) => getEndpoint(`inventory-transactions/${id}`)
  }

  // Job management endpoints
  const JOB_ENDPOINTS = {
    list: getEndpoint('jobs'),
    add: getEndpoint('jobs'),
    update: (id) => getEndpoint(`jobs/${id}`),
    delete: (id) => getEndpoint(`jobs/${id}`)
  }

  // Storage management endpoints
  const STORAGE_ENDPOINTS = {
    list: getEndpoint('storages'),
    add: getEndpoint('storages'),
    update: (id) => getEndpoint(`storages/${id}`),
    delete: (id) => getEndpoint(`storages/${id}`)
  }

  // Customer management endpoints
  const CUSTOMER_ENDPOINTS = {
    list: getEndpoint('customers'),
    add: getEndpoint('customers'),
    update: (id) => getEndpoint(`customers/${id}`),
    delete: (id) => getEndpoint(`customers/${id}`)
  }

  // Vendor management endpoints
  const VENDOR_ENDPOINTS = {
    list: getEndpoint('vendors'),
    add: getEndpoint('vendors'),
    update: (id) => getEndpoint(`vendors/${id}`),
    delete: (id) => getEndpoint(`vendors/${id}`)
  }

  // Dashboard endpoints
  const DASHBOARD_ENDPOINTS = {
    stats: getEndpoint('dashboard/stats'),
    recentActivities: getEndpoint('dashboard/recent-activities'),
    inventorySummary: getEndpoint('dashboard/inventory-summary'),
    salesSummary: getEndpoint('dashboard/sales-summary')
  }

  // Report endpoints
  const REPORT_ENDPOINTS = {
    inventory: getEndpoint('reports/inventory'),
    sales: getEndpoint('reports/sales'),
    purchases: getEndpoint('reports/purchases'),
    export: (type) => getDownloadEndpoint(`reports/${type}/export`)
  }

  // Audit endpoints
  const AUDIT_ENDPOINTS = {
    list: getEndpoint('audit-logs'),
    user: (id) => getEndpoint(`audit-logs/user/${id}`),
    entity: (type, id) => getEndpoint(`audit-logs/${type}/${id}`)
  }

  return {
    AUTH_ENDPOINTS,
    USER_ENDPOINTS,
    ROLE_ENDPOINTS,
    PERMISSION_ENDPOINTS,
    ITEM_ENDPOINTS,
    CATEGORY_ENDPOINTS,
    SUPPLIER_ENDPOINTS,
    BUYER_ENDPOINTS,
    SALES_CONTRACT_ENDPOINTS,
    PURCHASE_INVOICE_ENDPOINTS,
    INVENTORY_TRANSACTION_ENDPOINTS,
    JOB_ENDPOINTS,
    STORAGE_ENDPOINTS,
    CUSTOMER_ENDPOINTS,
    VENDOR_ENDPOINTS,
    DASHBOARD_ENDPOINTS,
    REPORT_ENDPOINTS,
    AUDIT_ENDPOINTS
  }
}
