"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, AuthApiError } from '@/lib/api/auth'
import { User, LoginRequest, RegisterRequest, PermissionCheck, PERMISSIONS } from '@/lib/types/auth'
import Cookies from 'js-cookie'

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  refreshUser: () => Promise.resolve(),
  hasPermission: () => false,
  hasRole: () => false,
  hasAnyRole: () => false,
  hasAnyPermission: () => false,
  error: null,
  clearError: () => {},
  permissions: null,
  roles: null,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [permissions, setPermissions] = useState(null)
  const [roles, setRoles] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  const isAuthenticated = !!user

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Save auth data to cookies
  const saveAuthData = useCallback((authData) => {
    if (typeof window === 'undefined') return
    
    // Save tokens
    if (authData.access_token) {
      Cookies.set('fabrimentory_access_token', authData.access_token, { expires: 7 })
    }
    if (authData.refresh_token) {
      Cookies.set('fabrimentory_refresh_token', authData.refresh_token, { expires: 7 })
    }
    
    // Save user data
    if (authData.user) {
      Cookies.set('fabrimentory_user', JSON.stringify(authData.user), { expires: 7 })
      setUser(authData.user)
    }
    
    // Save permissions
    if (authData.user?.permissions) {
      Cookies.set('fabrimentory_permissions', JSON.stringify(authData.user.permissions), { expires: 7 })
      setPermissions(authData.user.permissions)
    }
    
    // Save roles - handle both array of role objects and array of role names
    if (authData.user?.roles) {
      const roleNames = Array.isArray(authData.user.roles) 
        ? authData.user.roles.map((role) => typeof role === 'string' ? role : role.name)
        : []
      Cookies.set('fabrimentory_roles', JSON.stringify(roleNames), { expires: 7 })
      setRoles(roleNames)
    }
  }, [])

  // Load auth data from cookies
  const loadAuthData = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      const userData = Cookies.get('fabrimentory_user')
      const permissionsData = Cookies.get('fabrimentory_permissions')
      const rolesData = Cookies.get('fabrimentory_roles')
      
      if (userData) {
        setUser(JSON.parse(userData))
      }
      if (permissionsData) {
        setPermissions(JSON.parse(permissionsData))
      }
      if (rolesData) {
        setRoles(JSON.parse(rolesData))
      }
    } catch (error) {
      console.error('Error loading auth data from cookies:', error)
    }
  }, [])

  // Clear auth data from cookies
  const clearAuthData = useCallback(() => {
    if (typeof window === 'undefined') return
    
    Cookies.remove('fabrimentory_access_token')
    Cookies.remove('fabrimentory_refresh_token')
    Cookies.remove('fabrimentory_user')
    Cookies.remove('fabrimentory_permissions')
    Cookies.remove('fabrimentory_roles')
    
    setUser(null)
    setPermissions(null)
    setRoles(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      if (!authApi.isAuthenticated()) {
        setUser(null)
        return
      }

      const isValid = await authApi.ensureValidToken()
      if (!isValid) {
        setUser(null)
        return
      }

      const userData = await authApi.getProfile()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    try {
      setError(null)
      
      const loginResponse = await authApi.login(credentials)
      
      // Save the complete auth response to cookies and state
      saveAuthData(loginResponse)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      if (error instanceof AuthApiError) {
        setError(error.message)
      } else {
        setError('Login failed. Please try again.')
      }
      throw error
    }
  }, [router, saveAuthData])

  const register = useCallback(async (userData) => {
    try {
      setError(null)
      
      const registerResponse = await authApi.register(userData)
      
      // Save the complete auth response to cookies and state
      saveAuthData(registerResponse)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration failed:', error)
      if (error instanceof AuthApiError) {
        setError(error.message)
      } else {
        setError('Registration failed. Please try again.')
      }
      throw error
    }
  }, [router, saveAuthData])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
      router.push('/login')
    }
  }, [router, clearAuthData])

  const hasPermission = useCallback((permission) => {
    // Super admin has access to everything
    if (roles && roles.includes('super_admin')) {
      return true
    }
    
    if (!permissions) return false
    
    // Check if user has the specific permission
    const resourcePermissions = permissions[permission.resource]
    if (resourcePermissions && resourcePermissions.includes(permission.action)) {
      return true
    }
    
    return false
  }, [permissions, roles])

  const hasRole = useCallback((roleName) => {
    if (!roles) return false
    return roles.includes(roleName)
  }, [roles])

  const hasAnyRole = useCallback((roleNames) => {
    if (!roles) return false
    return roles.some(role => roleNames.includes(role))
  }, [roles])

  const hasAnyPermission = useCallback((permissions) => {
    // Super admin has access to everything
    if (roles && roles.includes('super_admin')) {
      return true
    }
    
    return permissions.some(permission => hasPermission(permission))
  }, [hasPermission, roles])

  // Initialize auth state on mount (load from cookies, then validate token)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only run on client side
        if (typeof window === 'undefined') {
          setIsInitialized(true)
          return
        }

        // Load auth data from cookies first so UI can show user immediately if we have tokens
        loadAuthData()

        if (!authApi.isAuthenticated()) {
          setUser(null)
          setIsInitialized(true)
          return
        }

        const isValid = await authApi.ensureValidToken()
        if (!isValid) {
          setUser(null)
          setIsInitialized(true)
          return
        }

        await refreshUser()
      } catch (error) {
        console.error('Auth initialization failed:', error)
        setUser(null)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [refreshUser, loadAuthData])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(async () => {
      try {
        await authApi.ensureValidToken()
      } catch (error) {
        console.error('Token refresh failed:', error)
        setUser(null)
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated])

const value = {
    user,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    error,
    clearError,
    permissions,
    roles,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Convenience hooks for common permission checks
export function usePermission(permission) {
  const { hasPermission } = useAuth()
  return hasPermission(permission)
}

export function useRole(roleName) {
  const { hasRole } = useAuth()
  return hasRole(roleName)
}

export function useAnyRole(roleNames) {
  const { hasAnyRole } = useAuth()
  return hasAnyRole(roleNames)
}

export function useAnyPermission(permissions) {
  const { hasAnyPermission } = useAuth()
  return hasAnyPermission(permissions)
}
