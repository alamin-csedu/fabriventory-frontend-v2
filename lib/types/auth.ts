export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  roles: Role[]
}

export interface Role {
  id: number
  name: string
  description: string
  permissions?: Permission[]
}

export interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: UserWithPermissions
}

export interface UserWithPermissions {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  roles: Role[]
  permissions: Record<string, string[]>
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface AuthResponse {
  success: boolean
  data: AuthTokens
}

export interface UserResponse {
  success: boolean
  data: User
}

export interface UsersListResponse {
  success: boolean
  data: {
    data: User[]
    sort: {
      sort_by: string
      sort_direction: string
    }
    page: number
    size: number
    total: number
  }
}

export interface RolesListResponse {
  success: boolean
  data: {
    data: Role[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_pages: number
      has_next: boolean
      has_prev: boolean
    }
  }
}

export interface PermissionsListResponse {
  success: boolean
  data: {
    data: Permission[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_pages: number
      has_next: boolean
      has_prev: boolean
    }
  }
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  is_active?: boolean
  role_ids?: number[]
}

export interface UpdateUserRequest {
  username: string
  email: string
  first_name: string
  last_name: string
  is_active?: boolean
  role_ids?: number[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
  is_active?: boolean
  permission_ids?: number[]
}

export interface UpdateRoleRequest {
  name: string
  description?: string
  is_active?: boolean
  permission_ids?: number[]
}

export interface CreatePermissionRequest {
  name: string
  resource: string
  action: string
  description?: string
}

export interface UpdatePermissionRequest {
  name: string
  resource: string
  action: string
  description?: string
}

export interface CreatePermissionRequest {
  name: string
  resource: string
  action: string
  description: string
}

export interface RolesListResponse {
  success: boolean
  data: {
    roles: Role[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_pages: number
    }
  }
}

export interface PermissionsListResponse {
  success: boolean
  data: {
    permissions: Permission[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_pages: number
    }
  }
}

export interface ApiError {
  success: false
  error: string
  details?: string
}

// Permission checking types
export interface PermissionCheck {
  resource: string
  action: string
}

export interface PermissionCheckResponse {
  success: boolean
  data: {
    allowed: boolean
  }
}

// Predefined roles and permissions
export const PREDEFINED_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer'
} as const

export const PERMISSIONS = {
  // User permissions
  USER_LIST: 'user:list',
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  
  // Role permissions
  ROLE_LIST: 'role:list',
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_MANAGE: 'role:manage',
  
  // Permission permissions
  PERMISSION_LIST: 'permission:list',
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_READ: 'permission:read',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',
  
  // Audit permissions
  AUDIT_READ: 'audit:read',
  
  // Inventory permissions
  INVENTORY_LIST: 'inventory:list',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',
  
  // Item permissions
  ITEM_LIST: 'item:list',
  ITEM_CREATE: 'item:create',
  ITEM_READ: 'item:read',
  ITEM_UPDATE: 'item:update',
  ITEM_DELETE: 'item:delete',
  
  // Supplier permissions
  SUPPLIER_LIST: 'supplier:list',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_DELETE: 'supplier:delete',
  
  // Buyer permissions
  BUYER_LIST: 'buyer:list',
  BUYER_CREATE: 'buyer:create',
  BUYER_READ: 'buyer:read',
  BUYER_UPDATE: 'buyer:update',
  BUYER_DELETE: 'buyer:delete',
  
  // Sales contract permissions
  SALES_CONTRACT_LIST: 'sales_contract:list',
  SALES_CONTRACT_CREATE: 'sales_contract:create',
  SALES_CONTRACT_READ: 'sales_contract:read',
  SALES_CONTRACT_UPDATE: 'sales_contract:update',
  SALES_CONTRACT_DELETE: 'sales_contract:delete',
  
  // Purchase invoice permissions
  PURCHASE_INVOICE_LIST: 'purchase_invoice:list',
  PURCHASE_INVOICE_CREATE: 'purchase_invoice:create',
  PURCHASE_INVOICE_READ: 'purchase_invoice:read',
  PURCHASE_INVOICE_UPDATE: 'purchase_invoice:update',
  PURCHASE_INVOICE_DELETE: 'purchase_invoice:delete',
} as const

export type PermissionKey = keyof typeof PERMISSIONS
export type PermissionValue = typeof PERMISSIONS[PermissionKey]
