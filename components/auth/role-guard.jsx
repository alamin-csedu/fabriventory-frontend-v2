"use client"

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock } from 'lucide-react'

export function RoleGuard({ 
  children, 
  roles = [], 
  requireAll = false, 
  fallback = null,
  showError = true 
}) {
  const { hasRole, hasAnyRole, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return showError ? (
      <Alert variant="destructive" className="m-4">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          You must be logged in to access this content.
        </AlertDescription>
      </Alert>
    ) : null
  }

  if (roles.length === 0) {
    return <>{children}</>
  }

  const hasAccess = requireAll 
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return showError ? (
      <Alert variant="destructive" className="m-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have the required role(s) to access this content.
          {roles.length > 0 && (
            <span className="block mt-1 text-sm">
              Required: {roles.join(', ')}
            </span>
          )}
        </AlertDescription>
      </Alert>
    ) : null
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function SuperAdminGuard({ children, fallback, showError }) {
  return (
    <RoleGuard roles={['super_admin']} fallback={fallback} showError={showError}>
      {children}
    </RoleGuard>
  )
}

export function AdminGuard({ children, fallback, showError }) {
  return (
    <RoleGuard roles={['super_admin', 'admin']} fallback={fallback} showError={showError}>
      {children}
    </RoleGuard>
  )
}

export function ManagerGuard({ children, fallback, showError }) {
  return (
    <RoleGuard roles={['super_admin', 'admin', 'manager']} fallback={fallback} showError={showError}>
      {children}
    </RoleGuard>
  )
}

export function UserGuard({ children, fallback, showError }) {
  return (
    <RoleGuard roles={['super_admin', 'admin', 'manager', 'user']} fallback={fallback} showError={showError}>
      {children}
    </RoleGuard>
  )
}
