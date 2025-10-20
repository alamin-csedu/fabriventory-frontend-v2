import {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserResponse,
  UsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  LoginResponse,
  UserWithPermissions,
  Role,
  RolesListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission,
  PermissionsListResponse,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionCheck,
  PermissionCheckResponse,
  ApiError
} from '@/lib/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081/api/v1'

class AuthApiError extends Error {
  constructor(
    message,
    status,
    details
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

class AuthApiService {
  baseURL

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(
    endpoint,
    options = {}
  ) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if token exists
    const token = this.getAccessToken()
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        const errorData = data
        throw new AuthApiError(
          errorData.error || 'Request failed',
          response.status,
          errorData.details
        )
      }

      return data
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error
      }
      throw new AuthApiError('Network error occurred')
    }
  }

  // Helper method to handle responses that might be wrapped in a success/data structure
  async requestWithWrapper(
    endpoint,
    options = {}
  ) {
    const response = await this.request(endpoint, options)
    
    // Check if response is wrapped in success/data structure
    if (typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
      return response.data
    }
    
    // Return response directly if not wrapped
    return response
  }

  getAccessToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('fabrimentory_access_token')  
  }

  setTokens(tokens) {
    if (typeof window === 'undefined') return
    localStorage.setItem('fabrimentory_access_token', tokens.access_token)
    localStorage.setItem('fabrimentory_refresh_token', tokens.refresh_token)
    localStorage.setItem('fabrimentory_token_expires', 
      (Date.now() + tokens.expires_in * 1000).toString()
    )
  }


  // Authentication endpoints
    async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    // Extract tokens and set them
    const tokens = {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      token_type: response.token_type,
      expires_in: response.expires_in,
    }
    this.setTokens(tokens)
    
    return response
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    // Extract tokens and set them
    const tokens = {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      token_type: response.token_type,
      expires_in: response.expires_in,
    }
    this.setTokens(tokens)
    
    return response
  }

  async refreshToken() {
    if (typeof window === 'undefined') {
      throw new AuthApiError('Cannot refresh token on server side')
    }

    const refreshToken = localStorage.getItem('fabrimentory_refresh_token')
    if (!refreshToken) {
      throw new AuthApiError('No refresh token available')
    }

    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    
    this.setTokens(response)
    return response
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      })
    } finally {
      this.clearTokens()
    }
  }

  async getProfile() {
    return await this.requestWithWrapper('/auth/profile')
  }

  async updateProfile(userData) {
    return await this.requestWithWrapper('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async changePassword(currentPassword, newPassword) {
    await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
  }

  async validateToken(token) {
    const response = await this.request('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
    return response
  }

  async checkPermission(permission) {
    const response = await this.request('/auth/check-permission', {
      method: 'POST',
      body: JSON.stringify(permission),
    })
    return response.allowed
  }

  // User management endpoints
  async getUsers(params) {
    return await this.requestWithWrapper(`/users?${params}`)
  }

  async getUser(id) {
    return await this.requestWithWrapper(`/users/${id}`)
  }

  async createUser(userData) {
    return await this.requestWithWrapper('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id, userData) {
    return await this.requestWithWrapper(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id) {
    await this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }


  async assignRoleToUser(userId, roleId) {
    await this.request(`/users/${userId}/assign-role`, {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId }),
    })
  }

  async removeRoleFromUser(userId, roleId) {
    await this.request(`/users/${userId}/remove-role`, {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId }),
    })
  }

  async getUserPermissions(userId) {
    const response = await this.request(
      `/users/${userId}/permissions/effective`
    )
    return response.data
  }

  async checkUserPermission(userId, permission) {
    const response = await this.request(`/users/${userId}/check-permission`, {
      method: 'POST',
      body: JSON.stringify(permission),
    })
    return response.data.allowed
  }

  async activateUser(userId) {
    await this.request(`/users/${userId}/activate`, {
      method: 'POST',
    })
  }

  async deactivateUser(userId) {
    await this.request(`/users/${userId}/deactivate`, {
      method: 'POST',
    })
  }

  // Role management endpoints
  async getRoles(params) {
    return await this.requestWithWrapper(`/roles?${params}`)
  }

  async getRole(id) {
    return await this.requestWithWrapper(`/roles/${id}`)
  }

  async createRole(roleData) {
    const response = await this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    })
    return await this.requestWithWrapper('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    })
  }

  async updateRole(id, roleData) {
    return await this.requestWithWrapper(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    })  
  }

  async deleteRole(id) {
    await this.requestWithWrapper(`/roles/${id}`, {
      method: 'DELETE',
    })
  }

  async assignPermissionToRole(roleId, permissionId) {
    await this.requestWithWrapper(`/roles/${roleId}/assign-permission`, {
      method: 'POST',
      body: JSON.stringify({ permission_id: permissionId }),
    })
  }

  async removePermissionFromRole(roleId, permissionId) {
    await this.requestWithWrapper(`/roles/${roleId}/remove-permission`, {
      method: 'POST',
      body: JSON.stringify({ permission_id: permissionId }),
    })
  }

  async getRolePermissions(roleId) {
    return await this.requestWithWrapper(
      `/roles/${roleId}/permissions`
    )
  }

  // Permission management endpoints
  async getPermissions(params) {
    return await this.requestWithWrapper(`/permissions?${params}`)
  }

  async getPermission(id) {
    return await this.requestWithWrapper(`/permissions/${id}`)
  }

  async createPermission(permissionData) {
    return await this.requestWithWrapper('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    })
  }

  async updatePermission(id, permissionData) {
    return await this.requestWithWrapper(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    })
  }

  async deletePermission(id) {
    await this.requestWithWrapper(`/permissions/${id}`, {
      method: 'DELETE',
    })
  }

  // Utility methods
  isAuthenticated() {
    if (typeof window === 'undefined') return false
    const token = this.getAccessToken()
    return !!token
  }

  async ensureValidToken() {
    return this.isAuthenticated()
  }
}

// Create and export a singleton instance
export const authApi = new AuthApiService()
export { AuthApiError }
