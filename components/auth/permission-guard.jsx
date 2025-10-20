"use client"

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock } from 'lucide-react'
import { PermissionCheck } from '@/lib/types/auth'

export function PermissionGuard({ 
  children, 
  permissions = [], 
  requireAll = false, 
  fallback = null,
  showError = true 
}) {
  const { hasPermission, hasAnyPermission, isAuthenticated, isLoading } = useAuth()

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

  if (permissions.length === 0) {
    return <>{children}</>
  }

  const hasAccess = requireAll 
    ? permissions.every(permission => hasPermission(permission))
    : hasAnyPermission(permissions)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return showError ? (
      <Alert variant="destructive" className="m-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have the required permission(s) to access this content.
          {permissions.length > 0 && (
            <span className="block mt-1 text-sm">
              Required: {permissions.map(p => `${p.resource}:${p.action}`).join(', ')}
            </span>
          )}
        </AlertDescription>
      </Alert>
    ) : null
  }

  return <>{children}</>
}

// Convenience components for common permission checks
export function UserManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'user', action: 'list' },
        { resource: 'user', action: 'create' },
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'update' },
        { resource: 'user', action: 'delete' },
        { resource: 'user', action: 'manage' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

export function RoleManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'role', action: 'list' },
        { resource: 'role', action: 'create' },
        { resource: 'role', action: 'read' },
        { resource: 'role', action: 'update' },
        { resource: 'role', action: 'delete' },
        { resource: 'role', action: 'manage' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

export function InventoryManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'inventory', action: 'list' },
        { resource: 'inventory', action: 'create' },
        { resource: 'inventory', action: 'read' },
        { resource: 'inventory', action: 'update' },
        { resource: 'inventory', action: 'delete' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

export function ItemManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'item', action: 'list' },
        { resource: 'item', action: 'create' },
        { resource: 'item', action: 'read' },
        { resource: 'item', action: 'update' },
        { resource: 'item', action: 'delete' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

export function SupplierManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'supplier', action: 'list' },
        { resource: 'supplier', action: 'create' },
        { resource: 'supplier', action: 'read' },
        { resource: 'supplier', action: 'update' },
        { resource: 'supplier', action: 'delete' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

export function BuyerManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'buyer', action: 'list' },
        { resource: 'buyer', action: 'create' },
        { resource: 'buyer', action: 'read' },
        { resource: 'buyer', action: 'update' },
        { resource: 'buyer', action: 'delete' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

export function SalesContractManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'sales_contract', action: 'list' },
        { resource: 'sales_contract', action: 'create' },
        { resource: 'sales_contract', action: 'read' },
        { resource: 'sales_contract', action: 'update' },
        { resource: 'sales_contract', action: 'delete' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

  export function PurchaseInvoiceManagementGuard({ children, fallback, showError }) {
  return (
    <PermissionGuard 
      permissions={[
        { resource: 'purchase_invoice', action: 'list' },
        { resource: 'purchase_invoice', action: 'create' },
        { resource: 'purchase_invoice', action: 'read' },
        { resource: 'purchase_invoice', action: 'update' },
        { resource: 'purchase_invoice', action: 'delete' },
      ]} 
      fallback={fallback} 
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}
